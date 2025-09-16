import { NextRequest, NextResponse } from 'next/server'
import { eq } from 'drizzle-orm'

import { approveSubmissionAction } from '@/actions/db/projects-actions'
import { db } from '@/db/db'
import { projectSubmissionsTable } from '@/db/schema/project-submissions-schema'
import { projectsTable } from '@/db/schema/projects-schema'

/**
 * POST /api/approve
 * 
 * Body expects:
 * {
 *   "submissionId": "some-uuid",
 *   "walletAddress": "0xownerWallet"
 * }
 * 
 * 1) Finds the submission.
 * 2) Locates the associated project.
 * 3) Checks that walletAddress belongs to that project’s owner.
 * 4) If checks pass, approves the submission (which closes project and awards tokens/skills).
 * 5) Marks the submission `isMerged = true`.
 */
export async function POST(req: NextRequest) {
  try {
    // 1) Read JSON body
    const body = await req.json()
    const { submissionId, walletAddress } = body

    if (!submissionId || !walletAddress) {
      return NextResponse.json(
        { isSuccess: false, message: 'Missing submissionId or walletAddress' },
        { status: 400 }
      )
    }

    // 2) Fetch the submission row
    const [submission] = await db
      .select()
      .from(projectSubmissionsTable)
      .where(eq(projectSubmissionsTable.id, submissionId))
      .limit(1)

    if (!submission) {
      return NextResponse.json(
        { isSuccess: false, message: 'Submission not found' },
        { status: 404 }
      )
    }

    // 3) Fetch the project for that submission
    const [project] = await db
      .select()
      .from(projectsTable)
      .where(eq(projectsTable.id, submission.projectId))
      .limit(1)

    if (!project) {
      return NextResponse.json(
        { isSuccess: false, message: 'Project not found (from submission)' },
        { status: 404 }
      )
    }

    // 4) Ensure walletAddress matches the project owner
    const isOwner =
      project.projectOwner.toLowerCase() === walletAddress.toLowerCase()

    if (!isOwner) {
      return NextResponse.json(
        { isSuccess: false, message: 'Only the project owner can approve' },
        { status: 403 }
      )
    }

    // 5) Optionally check if project is already closed or submission is merged
    if (project.projectStatus === 'closed') {
      return NextResponse.json(
        { isSuccess: false, message: 'Project is already closed/approved.' },
        { status: 400 }
      )
    }
    if (submission.isMerged) {
      return NextResponse.json(
        { isSuccess: false, message: 'Submission is already merged/approved.' },
        { status: 400 }
      )
    }

    // 6) Perform the actual “approve submission” logic
    //    - This usually closes the project, awards tokens, etc.
    const result = await approveSubmissionAction({
      projectId: project.id,
      freelancerAddress: submission.freelancerAddress,
      walletAddress, // project owner
    })

    if (!result.isSuccess) {
      return NextResponse.json(
        { isSuccess: false, message: result.message },
        { status: 400 }
      )
    }

    // 7) Mark the submission row as merged
    await db
      .update(projectSubmissionsTable)
      .set({ isMerged: true })
      .where(eq(projectSubmissionsTable.id, submissionId))

    // 8) All good
    return NextResponse.json(
      { isSuccess: true, message: 'Submission approved successfully' },
      { status: 200 }
    )
  } catch (error) {
    console.error('[POST /api/approve] Error:', error)
    return NextResponse.json(
      { isSuccess: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}