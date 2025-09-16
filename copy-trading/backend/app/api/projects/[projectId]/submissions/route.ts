import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db/db'
import { createSubmissionAction } from '@/actions/db/submissions-actions'
import { eq } from 'drizzle-orm'
import { projectSubmissionsTable } from '@/db/schema/project-submissions-schema'

export async function GET(
  req: NextRequest,
  { params }: { params: { projectId: string } }
) {
  try {
    const { projectId } = params

    // Get all submissions for this project
    const submissions = await db
      .select()
      .from(projectSubmissionsTable)
      .where(eq(projectSubmissionsTable.projectId, projectId))

    return NextResponse.json({
      isSuccess: true,
      data: submissions
    }, { status: 200 })
  } catch (error) {
    console.error('GET /api/projects/[projectId]/submissions =>', error)
    return NextResponse.json(
      { isSuccess: false, message: 'Internal error' },
      { status: 500 }
    )
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { projectId: string } }
) {
  try {
    const { projectId } = params
    const body = await req.json()

    // We call our server action to do the DB insert + checks
    const result = await createSubmissionAction({
      projectId,
      freelancerAddress: body.freelancerAddress,
      prLink: body.prLink,
    })

    if (!result.isSuccess || !result.data) {
      return NextResponse.json(
        { isSuccess: false, message: result.message },
        { status: 400 }
      )
    }

    const submission = result.data
    // submission has: 
    //   id, projectId, prLink, freelancerAddress, isMerged, ... etc.

    // Option A: Return them raw
    // return NextResponse.json({ isSuccess: true, data: submission }, { status: 200 })

    // Option B: Return only the fields you want, with "camelCase" or "snake_case" keys
    return NextResponse.json(
      {
        isSuccess: true,
        data: {
          submission_id: submission.id,
          project_id: submission.projectId,
          pr_link: submission.prLink,
          freelancer_address: submission.freelancerAddress,
          is_merged: submission.isMerged,
          created_at: submission.createdAt,
          // etc. if you want to show repoOwner, prNumber, ...
        },
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('POST /api/projects/[projectId]/submissions =>', error)
    return NextResponse.json(
      { isSuccess: false, message: 'Internal error' },
      { status: 500 }
    )
  }
}