// app/api/github/webhook/route.ts
import { eq, and } from 'drizzle-orm'
import { NextRequest, NextResponse } from 'next/server'

import { autoAwardOnPrMergeAction } from '@/actions/db/projects-actions'
import { db } from '@/db/db'
import { projectSubmissionsTable } from '@/db/schema/project-submissions-schema'
import { createCryptoHash } from '@/lib/utils'

// Add GitHub webhook verification with a secret
// The secret should be the same as configured in the GitHub webhook settings
const WEBHOOK_SECRET = process.env.GITHUB_WEBHOOK_SECRET || '';

export async function POST(req: NextRequest) {
  try {
    // <--- This MUST be "true" in your environment or it short-circuits:
    if (process.env.AUTO_AWARD_GITHUB_WEBHOOK !== "true") {
      console.log("Auto-award is OFF. Doing nothing.")
      return NextResponse.json({ message: "Auto-award disabled" }, { status: 200 })
    }

    // Get the event type from headers
    const eventType = req.headers.get('x-github-event');
    console.log(`[GitHub Webhook] Received event type: ${eventType}`);

    // Verify webhook signature if a secret is configured
    if (WEBHOOK_SECRET) {
      const signature = req.headers.get('x-hub-signature-256') || '';
      const payload = await req.text();
      const calculatedSignature = `sha256=${createCryptoHash(payload, WEBHOOK_SECRET)}`;
      
      if (signature !== calculatedSignature) {
        console.error("GitHub webhook signature verification failed");
        return NextResponse.json({ message: "Invalid signature" }, { status: 401 });
      }

      // Re-parse the payload since we've consumed it for verification
      const parsedPayload = JSON.parse(payload);
      return handleWebhook(parsedPayload, eventType || '');
    }

    // No secret configured, process without verification
    const payload = await req.json();
    return handleWebhook(payload, eventType || '');
  } catch (error) {
    console.error("Error processing GitHub webhook:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

// Extracts PR number from a merge commit message
// Example: "Merge pull request #123 from owner/branch"
function extractPrNumber(commitMessage: string): string | null {
  const match = commitMessage.match(/Merge pull request #(\d+)/);
  return match ? match[1] : null;
}

// Separate function to handle the webhook logic
async function handleWebhook(payload: any, eventType: string) {
  try {
    // Log the full payload to debug the structure
    console.log("[GitHub Webhook] Full payload:", JSON.stringify(payload, null, 2));
    console.log("[GitHub Webhook] Event type:", eventType);
    console.log("[GitHub Webhook] Action:", payload?.action);
    console.log("[GitHub Webhook] PR merged status:", payload?.pull_request?.merged);
    
    // Case 1: Pull request event where action=closed and merged=true
    const isPrMergeEvent = payload?.pull_request?.merged === true && payload?.action === "closed";
    
    // Case 2: Push event with a merge commit message
    const isPushMergeEvent = eventType === 'push' && 
                             payload?.head_commit?.message && 
                             payload?.head_commit?.message.startsWith('Merge pull request #');
    
    if (isPrMergeEvent || isPushMergeEvent) {
      let repoOwner, repoName, prNumber;
      
      if (isPrMergeEvent) {
        // For pull_request events
        console.log("Processing PR merged webhook");
        repoOwner = payload.repository.owner.login;
        repoName = payload.repository.name;
        prNumber = payload.pull_request.number;
      } else {
        // For push events with merge commits
        console.log("Processing push event with PR merge commit");
        repoOwner = payload.repository.owner.login;
        repoName = payload.repository.name;
        prNumber = extractPrNumber(payload.head_commit.message);
        
        if (!prNumber) {
          console.log("[GitHub Webhook] Could not extract PR number from commit message");
          return NextResponse.json({ message: "Not a PR merged event" }, { status: 200 });
        }
      }

      console.log("Processing webhook for merged PR:", {
        repo: `${repoOwner}/${repoName}`,
        pr: prNumber,
        title: isPrMergeEvent ? payload.pull_request.title : payload.head_commit.message
      });

      // Look up submission in DB
      console.log(`[GitHub Webhook] Looking up submission for PR #${prNumber} in ${repoOwner}/${repoName}`);
      console.log(`[GitHub Webhook] Query:`, {
        repoOwner,
        repoName,
        prNumber: prNumber.toString()
      });
      
      try {
        // Debug schema to ensure table is properly loaded
        console.log("[GitHub Webhook] projectSubmissionsTable check:", 
          projectSubmissionsTable ? "defined" : "undefined", 
          projectSubmissionsTable ? Object.keys(projectSubmissionsTable).length : 0);
        
        const [submission] = await db
          .select()
          .from(projectSubmissionsTable)
          .where(
            and(
              eq(projectSubmissionsTable.repoOwner, repoOwner),
              eq(projectSubmissionsTable.repoName, repoName),
              eq(projectSubmissionsTable.prNumber, prNumber.toString())
            )
          )
          .limit(1);

        console.log("[GitHub Webhook] Submission found =>", submission ? 
          `ID: ${submission.submissionId}, projectId: ${submission.projectId}` : "None");

        if (!submission) {
          console.log(`[GitHub Webhook] No matching submission found for PR #${prNumber} in ${repoOwner}/${repoName}`);
          return NextResponse.json({ message: "No matching submission" }, { status: 200 });
        }

        // Check if this submission has already been processed with successful blockchain transaction
        if (submission.status === "awarded" && submission.blockchainTxHash) {
          console.log(`[GitHub Webhook] Submission ${submission.submissionId} has already been processed with blockchain tx: ${submission.blockchainTxHash}`);
          return NextResponse.json({ 
            message: "Submission already processed with blockchain transaction", 
            txHash: submission.blockchainTxHash 
          }, { status: 200 });
        }

        // Check if it's been marked as awarded in DB but no blockchain yet
        if (submission.status === "awarded" && !submission.blockchainTxHash) {
          console.log(`[GitHub Webhook] Submission ${submission.submissionId} is awarded in DB but no blockchain transaction yet. Will retry.`);
          // Continue processing to retry blockchain transaction
        }

        // 1) Mark isMerged = true in DB & update status
        try {
          console.log(`[GitHub Webhook] Updating submission ${submission.submissionId} status to 'processing'`);
          
          await db
            .update(projectSubmissionsTable)
            .set({ 
              isMerged: true,
              status: "processing", // intermediate state while we process the award
              updatedAt: new Date()
            })
            .where(eq(projectSubmissionsTable.submissionId, submission.submissionId));

          console.log(`[GitHub Webhook] Successfully updated submission ${submission.submissionId} status to 'processing'`);
        } catch (updateError: any) {
          console.error(`[GitHub Webhook] Error updating submission status:`, updateError);
          return NextResponse.json({ 
            message: "Failed to update submission status", 
            error: updateError.message 
          }, { status: 500 });
        }

        // 2) Attempt awarding tokens + completion skills
        console.log(`[GitHub Webhook] Calling autoAwardOnPrMergeAction with parameters:`, {
          projectId: submission.projectId,
          freelancerWalletEns: submission.freelancerWalletEns,
          freelancerWalletAddress: submission.freelancerWalletAddress
        });
        
        try {
          const result = await autoAwardOnPrMergeAction({
            projectId: submission.projectId,
            freelancerWalletEns: submission.freelancerWalletEns,
            freelancerWalletAddress: submission.freelancerWalletAddress
          });

          console.log(`[GitHub Webhook] Award result:`, result);

          // 3) Update final status based on blockchain result
          let finalStatus = "awarded"; // Default status if blockchain fails
          
          if (result.isSuccess) {
            if (result.data?.blockchainSuccess) {
              finalStatus = "awarded";
            }
          } else {
            finalStatus = "award_failed";
          }
          
          try {
            // Always update the status even if the award action encounters issues
            const updateData: any = { 
              status: finalStatus,
              updatedAt: new Date()
            };
            
            // Only set the blockchain transaction hash if it was provided
            if (result.data?.blockchainTxHash) {
              updateData.blockchainTxHash = result.data.blockchainTxHash;
            }
            
            await db
              .update(projectSubmissionsTable)
              .set(updateData)
              .where(eq(projectSubmissionsTable.submissionId, submission.submissionId));

            console.log(`[GitHub Webhook] Updated submission ${submission.submissionId} final status to '${finalStatus}'`);
          } catch (finalUpdateError: any) {
            console.error(`[GitHub Webhook] Error updating final submission status:`, finalUpdateError);
          }

          return NextResponse.json({ 
            message: result.message,
            status: finalStatus,
            blockchainTxHash: result.data?.blockchainTxHash || null,
            tokensAwarded: result.data?.tokensAwarded || 0
          }, { status: 200 });
        } catch (awardError: any) {
          console.error(`[GitHub Webhook] Error in autoAwardOnPrMergeAction:`, awardError);
          
          // Update submission status to indicate failure
          try {
            await db
              .update(projectSubmissionsTable)
              .set({ 
                status: "award_failed",
                updatedAt: new Date()
              })
              .where(eq(projectSubmissionsTable.submissionId, submission.submissionId));
          } catch (errorUpdateError) {
            console.error(`[GitHub Webhook] Failed to update submission status after award error:`, errorUpdateError);
          }
          
          return NextResponse.json({ 
            message: "Failed to process award", 
            error: awardError.message 
          }, { status: 500 });
        }
      } catch (queryError: any) {
        console.error(`[GitHub Webhook] Error querying submission:`, queryError);
        console.error(`[GitHub Webhook] Error stack:`, queryError.stack);
        return NextResponse.json({ 
          message: "Error looking up submission", 
          error: queryError.message 
        }, { status: 500 });
      }
    }

    // Not the right event
    console.log(`[GitHub Webhook] Not a PR merged event. Event: ${eventType}, Action: ${payload?.action}, Merged: ${payload?.pull_request?.merged}`);
    return NextResponse.json({ message: "Not a PR merged event" }, { status: 200 });
  } catch (error: any) {
    console.error(`[GitHub Webhook] Unhandled error:`, error);
    console.error(`[GitHub Webhook] Error stack:`, error.stack);
    return NextResponse.json({ 
      message: "Internal server error processing webhook", 
      error: error.message 
    }, { status: 500 });
  }
}