import { NextRequest, NextResponse } from 'next/server'
import { eq, and } from 'drizzle-orm'

import { db } from '@/db/db'
import { freelancerTable } from '@/db/schema/freelancer-schema'
import { projectsTable } from '@/db/schema/projects-schema'
import { projectSubmissionsTable } from '@/db/schema/project-submissions-schema'

/**
 * GET /api/freelancer/:freelancerId/submissions?merged=1|0
 * Return all PR submissions by this freelancer. Filter by isMerged if needed.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { freelancerId: string } }
) {
  try {
    const { searchParams } = new URL(req.url)
    const mergedFilter = searchParams.get('merged') // '1' or '0'

    // 1) find freelancer
    const [freelancer] = await db
      .select()
      .from(freelancerTable)
      .where(eq(freelancerTable.id, params.freelancerId))
      .limit(1)
    if (!freelancer) {
      return NextResponse.json(
        { message: 'Freelancer not found' },
        { status: 404 }
      )
    }

    // 2) conditions => freelancer_address
    const conditions = [eq(projectSubmissionsTable.freelancerAddress, freelancer.walletAddress)]
    if (mergedFilter === '1') {
      conditions.push(eq(projectSubmissionsTable.isMerged, true))
    } else if (mergedFilter === '0') {
      conditions.push(eq(projectSubmissionsTable.isMerged, false))
    }

    // 3) fetch joined
    const rows = await db
      .select({
        submissionId: projectSubmissionsTable.id,
        isMerged: projectSubmissionsTable.isMerged,
        prLink: projectSubmissionsTable.prLink,
        createdAt: projectSubmissionsTable.createdAt,
        projectId: projectsTable.id,
        projectName: projectsTable.projectName,
        projectStatus: projectsTable.projectStatus,
        prizeAmount: projectsTable.prizeAmount
      })
      .from(projectSubmissionsTable)
      .leftJoin(projectsTable, eq(projectSubmissionsTable.projectId, projectsTable.id))
      .where(and(...conditions))

    return NextResponse.json({
      freelancer: {
        id: freelancer.id,
        walletAddress: freelancer.walletAddress,
        name: freelancer.freelancerName
      },
      submissions: rows
    })
  } catch (error) {
    console.error('[GET /api/freelancer/:freelancerId/submissions] Error:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}