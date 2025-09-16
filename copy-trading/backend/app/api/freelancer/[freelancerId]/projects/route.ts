import { NextRequest, NextResponse } from 'next/server'
import { eq } from 'drizzle-orm'

import { db } from '@/db/db'
import { projectsTable } from '@/db/schema/projects-schema'
import { freelancerTable } from '@/db/schema/freelancer-schema'

/**
 * GET /api/freelancer/:freelancerId/projects
 * Returns some project list for this freelancer. 
 * 
 * For demonstration, you might fetch:
 *   - All “open” projects 
 *   - Or do logic to filter out those the user already completed
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { freelancerId: string } }
) {
  try {
    const { freelancerId } = params

    // 1) Check the freelancer exists
    const [freelancer] = await db
      .select()
      .from(freelancerTable)
      .where(eq(freelancerTable.id, freelancerId))
      .limit(1)

    if (!freelancer) {
      return NextResponse.json(
        { isSuccess: false, message: 'Freelancer not found' },
        { status: 404 }
      )
    }

    // 2) Query the “projects” table in whichever way you want:
    //   For example, return all “open” projects.
    const rows = await db
      .select()
      .from(projectsTable)
      .where(eq(projectsTable.projectStatus, 'open'))
      // .where(...)  Add more filters as needed
      .limit(50)

    return NextResponse.json(
      {
        isSuccess: true,
        data: rows,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('[GET /api/freelancer/:id/projects] error:', error)
    return NextResponse.json(
      { isSuccess: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}