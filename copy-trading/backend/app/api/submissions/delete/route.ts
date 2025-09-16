import { NextRequest, NextResponse } from 'next/server'
import { eq } from 'drizzle-orm'

import { db } from '@/db/db'
import { projectSubmissionsTable } from '@/db/schema/project-submissions-schema'
import { projectsTable } from '@/db/schema/projects-schema'

/**
 * POST /api/submissions/delete
 * Body:
 * {
 *   "submissionId": string,
 *   "walletAddress": string,
 *   "walletEns": string
 * }
 *
 * Allows either the projectOwner or the freelancer to delete the submission.
 */
export async function POST(req: NextRequest) {
  try {
    console.log('[POST /api/submissions/delete] Request received');
    
    // Parse the request body
    let body;
    try {
      body = await req.json();
      console.log('Request body:', JSON.stringify(body));
    } catch (error) {
      console.error('Error parsing request body:', error);
      return NextResponse.json({
        isSuccess: false,
        message: 'Invalid JSON in request body'
      }, { status: 400 });
    }
    
    // Check required fields
    const { submissionId, walletAddress, walletEns } = body || {};
    
    if (!submissionId || !walletAddress || !walletEns) {
      const missingFields: string[] = [];
      if (!submissionId) missingFields.push('submissionId');
      if (!walletAddress) missingFields.push('walletAddress');
      if (!walletEns) missingFields.push('walletEns');
      
      console.error('Missing required fields:', missingFields);
      return NextResponse.json({
        isSuccess: false,
        message: `Missing required fields: ${missingFields.join(', ')}`
      }, { status: 400 });
    }
    
    // Validate wallet format
    if (!walletAddress.match(/^0x[a-fA-F0-9]{40}$/)) {
      return NextResponse.json({
        isSuccess: false,
        message: 'Invalid wallet address format'
      }, { status: 400 });
    }

    // 1) find the submission
    const [submission] = await db
      .select()
      .from(projectSubmissionsTable)
      .where(eq(projectSubmissionsTable.submissionId, submissionId))
      .limit(1)
      
    if (!submission) {
      return NextResponse.json({
        isSuccess: false,
        message: 'Submission not found'
      }, { status: 404 });
    }

    // 2) find the project
    const [project] = await db
      .select()
      .from(projectsTable)
      .where(eq(projectsTable.projectId, submission.projectId))
      .limit(1)
      
    if (!project) {
      return NextResponse.json({
        isSuccess: false,
        message: 'Project not found'
      }, { status: 404 });
    }

    // 3) check ownership or submitter
    const isOwner = project.projectOwnerWalletEns.toLowerCase() === walletEns.toLowerCase() ||
                    project.projectOwnerWalletAddress.toLowerCase() === walletAddress.toLowerCase();
                    
    const isSubmitter = submission.freelancerWalletEns.toLowerCase() === walletEns.toLowerCase() ||
                        submission.freelancerWalletAddress.toLowerCase() === walletAddress.toLowerCase();

    if (!isOwner && !isSubmitter) {
      return NextResponse.json({
        isSuccess: false,
        message: 'Not authorized to delete this submission'
      }, { status: 403 });
    }

    // 4) Perform delete
    await db
      .delete(projectSubmissionsTable)
      .where(eq(projectSubmissionsTable.submissionId, submissionId))

    return NextResponse.json({
      isSuccess: true,
      message: 'Submission deleted successfully'
    });
  } catch (error) {
    console.error('Submission delete error:', error);
    return NextResponse.json({
      isSuccess: false,
      message: 'Internal server error',
      debugInfo: error instanceof Error ? {
        message: error.message,
        stack: error.stack
      } : { error: String(error) }
    }, { status: 500 });
  }
}

export function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    }
  });
}