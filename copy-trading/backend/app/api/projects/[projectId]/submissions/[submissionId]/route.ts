/****************************************************************************************
 * File: /app/api/submissions/[submissionId]/route.ts
 * Relative path: /Users/sattu/Library/CloudStorage/Dropbox/blockchain/teachnook/api_for_fe/app/api/submissions/[submissionId]/route.ts
 *
 * GET /api/submissions/:submissionId
 * 
 * This endpoint is role-independent. It returns the single submission with that submissionId.
 ****************************************************************************************/

import { NextRequest, NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';

import { db } from '@/db/db';
import { projectSubmissionsTable } from '@/db/schema/project-submissions-schema';
import { errorResponse, successResponse, serverErrorResponse } from '@/app/api/api-utils';
import { withCors } from '@/lib/cors';

async function getSingleSubmission(req: NextRequest, context: { params: { submissionId: string } }) {
  try {
    const { submissionId } = context.params;

    // 1) Query by submissionId in projectSubmissionsTable
    const [submission] = await db
      .select()
      .from(projectSubmissionsTable)
      .where(eq(projectSubmissionsTable.submissionId, submissionId))
      .limit(1);

    if (!submission) {
      return errorResponse('Submission not found', 404);
    }

    // 2) Return success
    return successResponse(submission);
  } catch (error) {
    console.error('[GET /api/submissions/:submissionId] error =>', error);
    return serverErrorResponse(error);
  }
}

export const GET = (req: NextRequest, context: any) =>
  withCors(() => getSingleSubmission(req, context))(req);
export const OPTIONS = withCors(async () => new Response(null, { status: 204 }));