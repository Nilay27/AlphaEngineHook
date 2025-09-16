// file: /app/api/submissions/approve/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { eq } from 'drizzle-orm'

import { approveSubmissionAction } from '@/actions/db/projects-actions'
import { db } from '@/db/db'
import { projectSubmissionsTable } from '@/db/schema/project-submissions-schema'
import { projectsTable } from '@/db/schema/projects-schema'
import { approveSubmissionOnChain } from '@/app/api/blockchain-utils'
import { withCors } from '@/lib/cors'
import {
  successResponse,
  errorResponse,
  serverErrorResponse,
  logApiRequest
} from '@/app/api/api-utils'

/**
 * POST /api/submissions/approve
 * Body:
 * {
 *   "submissionId": string,
 *   "walletEns": string,  // optional if no ENS
 *   "walletAddress": string  // must match the project owner
 * }
 */
async function postApproveSubmission(req: NextRequest) {
  try {
    logApiRequest('POST', '/api/submissions/approve', req.ip || 'unknown')
    
    const body = await req.json()
    const { submissionId, walletEns, walletAddress } = body

    if (!submissionId || !walletEns || !walletAddress) {
      return errorResponse(
        'Missing submissionId or walletEns or walletAddress',
        400
      )
    }

    // 1) Fetch the submission
    const [submission] = await db
      .select()
      .from(projectSubmissionsTable)
      .where(eq(projectSubmissionsTable.submissionId, submissionId))
      .limit(1)

    if (!submission) {
      return errorResponse('Submission not found', 404)
    }

    // First, call the blockchain to approve the submission
    let blockchainSubmissionId = submission.blockchainSubmissionId || submissionId;
    let blockchainResult = await approveSubmissionOnChain(walletAddress, blockchainSubmissionId);
    
    // If blockchain transaction failed, retry up to 3 times
    if (!blockchainResult.success) {
      console.log(`Blockchain approval attempt 1 failed for submission ${blockchainSubmissionId}. Retrying...`);
      
      // Try up to 2 more times (total of 3 attempts)
      for (let attempt = 2; attempt <= 3; attempt++) {
        blockchainResult = await approveSubmissionOnChain(walletAddress, blockchainSubmissionId);
        
        // If successful, break out of the retry loop
        if (blockchainResult.success) {
          console.log(`Blockchain approval succeeded on attempt ${attempt} for submission ${blockchainSubmissionId}`);
          break;
        }
        
        console.log(`Blockchain approval attempt ${attempt} failed for submission ${blockchainSubmissionId}. ${attempt < 3 ? "Retrying..." : "Giving up."}`);
      }
      
      // If all attempts failed, return error
      if (!blockchainResult.success) {
        console.error(`All blockchain approval attempts failed for submission ${blockchainSubmissionId}:`, blockchainResult.error);
        return errorResponse(
          'Failed to approve submission on blockchain after multiple attempts. Please try again later.',
          500
        );
      }
    }

    // 2) Call the database action to approve
    const result = await approveSubmissionAction({
      projectId: submission.projectId,
      freelancerWalletEns: submission.freelancerWalletEns,
      freelancerWalletAddress: submission.freelancerWalletAddress,
      companyWalletEns: walletEns,
      companyWalletAddress: walletAddress
    })

    if (!result.isSuccess) {
      return errorResponse(result.message || 'Failed to approve submission', 400)
    }

    // 3) Mark submission as merged and awarded
    await db
      .update(projectSubmissionsTable)
      .set({ 
        isMerged: true,
        status: 'awarded',
        blockchainTxHash: blockchainResult.txHash
      })
      .where(eq(projectSubmissionsTable.submissionId, submissionId))

    // 4) Return success
    return successResponse(
      {
        submissionId,
        blockchainTxHash: blockchainResult.txHash
      },
      'Submission approved successfully'
    )
  } catch (error: any) {
    console.error('[POST /api/submissions/approve] Error:', error)
    return serverErrorResponse(error)
  }
}

export const POST = withCors(postApproveSubmission)

// For CORS preflight
export const OPTIONS = withCors(async () => {
  return new Response(null, { status: 204 })
})