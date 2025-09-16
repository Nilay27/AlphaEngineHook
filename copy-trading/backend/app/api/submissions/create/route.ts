/****************************************************************************************
 * File: /app/api/submissions/create/route.ts
 * 
 * POST /api/submissions/create
 * 
 * @description
 * Creates a new submission record for a project. We allow the client to specify
 * either (A) walletEns, or (B) walletAddress for the freelancer. This route
 * resolves the final freelancer wallet address and passes it to createSubmissionAction.
 * 
 * Expected Request Body:
 * {
 *   "projectId":        string,  // required
 *   "walletEns":        string,  // optional if user has an ENS
 *   "walletAddress":    string,  // optional if no ENS; fallback
 *   "prLink":           string,  // optional but recommended
 *   "submissionText":   string   // optional
 * }
 *
 * The old code required "freelancerWallet", but we have removed that in favor
 * of "walletEns" + "walletAddress" with a short DB lookup. 
 *
 * @returns
 * 201 on success => { isSuccess: true, message: "Submission created successfully", data: {...} }
 * 4xx on any validation or lookup failure
 ****************************************************************************************/

import { NextRequest, NextResponse } from 'next/server'
import { withCors } from '@/lib/cors'
import { db } from '@/db/db'
import { freelancerTable } from '@/db/schema/freelancer-schema'
import { eq } from 'drizzle-orm'

import { 
  successResponse, 
  errorResponse, 
  serverErrorResponse,
  validateRequiredFields,
  logApiRequest 
} from '@/app/api/api-utils'
import { createSubmissionAction } from '@/actions/db/submissions-actions'
import { createSubmissionOnChain } from '@/app/api/blockchain-utils'

async function postCreateSubmission(req: NextRequest) {
  try {
    logApiRequest('POST', '/api/submissions/create', req.ip || 'unknown')

    const body = await req.json().catch(() => ({}))
    
    // 1) Validate required fields. 
    //    We do NOT require 'freelancerWallet' anymore; we handle walletEns/walletAddress logic below.
    const validation = validateRequiredFields(body, ['projectId', 'walletEns', 'walletAddress'])
    if (!validation.isValid) {
      return errorResponse(
        `Missing required fields: ${validation.missingFields.join(', ')}`,
        400
      )
    }

    // 2) Resolve final freelancer address from "walletEns" or "walletAddress"
    const { projectId, walletEns, walletAddress, prLink, submissionText } = body
    console.log('projectId =>', projectId)
    console.log('walletEns =>', walletEns)
    console.log('walletAddress =>', walletAddress)

    // Both are optional, but we must have at least one
    if (!walletEns && !walletAddress) {
      return errorResponse(
        `Must provide at least one of [walletEns, walletAddress] to identify the freelancer`,
        400
      )
    }

    let finalFreelancerAddress = ''
    // Try ENS first
    if (walletEns) {
      const lowerEns = walletEns.trim().toLowerCase()
      console.log('lowerEns =>', lowerEns)
      // find freelancer by that ENS
      const [byEns] = await db
        .select()
        .from(freelancerTable)
        .where(eq(freelancerTable.walletEns, lowerEns))
        .limit(1)
      console.log('byEns =>', byEns)
      if (!byEns) {
        return errorResponse(
          `No freelancer found for walletEns='${walletEns}'`,
          404
        )
      }
      finalFreelancerAddress = byEns.walletAddress.toLowerCase()
    }
    // If still empty, fallback to walletAddress
    if (!finalFreelancerAddress && walletAddress) {
      if (!/^0x[a-fA-F0-9]{40}$/.test(walletAddress)) {
        return errorResponse(`Invalid walletAddress format: ${walletAddress}`, 400)
      }
      finalFreelancerAddress = walletAddress.trim().toLowerCase()
    }

    if (!finalFreelancerAddress) {
      return errorResponse(`Could not resolve freelancer address`, 400)
    }

    // Call the smart contract to create a submission on-chain
    let blockchainResult = await createSubmissionOnChain(walletAddress, projectId);
    
    // If blockchain transaction failed, retry up to 3 times
    if (!blockchainResult.success) {
      console.log(`Blockchain submission creation attempt 1 failed for project ${projectId}. Retrying...`);
      console.log(`Error details: ${JSON.stringify(blockchainResult.error)}`);
      
      // Try up to 2 more times (total of 3 attempts)
      for (let attempt = 2; attempt <= 3; attempt++) {
        // Add a small delay between retry attempts
        await new Promise(resolve => setTimeout(resolve, 2000)); // 2 second delay
        
        console.log(`Starting blockchain submission retry attempt ${attempt} for project ${projectId}`);
        blockchainResult = await createSubmissionOnChain(walletAddress, projectId);
        
        // If successful, break out of the retry loop
        if (blockchainResult.success) {
          console.log(`Blockchain submission creation succeeded on attempt ${attempt} for project ${projectId}`);
          break;
        }
        
        console.log(`Blockchain submission creation attempt ${attempt} failed for project ${projectId}. ${attempt < 3 ? "Retrying..." : "Giving up."}`);
        console.log(`Error details: ${JSON.stringify(blockchainResult.error)}`);
      }
      
      // If all attempts failed, return error
      if (!blockchainResult.success) {
        console.error(`All blockchain submission creation attempts failed for project ${projectId}:`, blockchainResult.error);
        
        // Extract more specific error information for the client
        let errorMessage = 'Failed to create submission on blockchain after multiple attempts. Please try again later.';
        let statusCode = 500;
        
        // Check for specific error types to provide better feedback
        if (blockchainResult.error) {
          const error = blockchainResult.error;
          
          // Check for common blockchain errors
          if (typeof error === 'object') {
            if ('code' in error && error.code === 'CALL_EXCEPTION') {
              errorMessage = 'Smart contract rejected the submission. Possible reasons: user not registered, project does not exist, or user not eligible for this project.';
              statusCode = 400;
            } else if ('reason' in error && typeof error.reason === 'string') {
              errorMessage = `Blockchain error: ${error.reason}`;
            } else if ('message' in error && typeof error.message === 'string' && error.message.includes('execution reverted')) {
              errorMessage = 'Contract execution reverted: the submission criteria were not met.';
              statusCode = 400;
            }
          }
        }
        
        return errorResponse(errorMessage, statusCode);
      }
    }
    
    // Use the submission ID from the blockchain if available
    const onChainSubmissionId = blockchainResult.submissionId;

    // 3) Call the createSubmissionAction with the final wallet
    const submissionData = {
      projectId: projectId,
      freelancerWalletEns: walletEns,
      freelancerWalletAddress: walletAddress.toLowerCase(),
      submissionText: submissionText,
      githubLink: prLink,
      onChainSubmissionId: onChainSubmissionId,
      blockchainTxHash: blockchainResult.txHash,
    };

    const result = await createSubmissionAction(submissionData);

    if (!result.isSuccess) {
      return errorResponse(result.message, 400);
    }

    // Add blockchain info to the response data
    const responseData = {
      ...result.data,
      blockchainTxHash: blockchainResult.txHash
    };

    // 4) Return success (HTTP 201)
    return successResponse(
      responseData, 
      'Submission created successfully', 
      201
    )
  } catch (error: any) {
    console.error('[POST /api/submissions/create] Unhandled error =>', error)
    return serverErrorResponse(error)
  }
}

export const POST = withCors(postCreateSubmission)

// For CORS preflight
export const OPTIONS = withCors(async () => {
  return new Response(null, { status: 204 })
})