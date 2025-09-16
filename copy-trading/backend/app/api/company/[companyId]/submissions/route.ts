// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server'
import { eq, and, sql } from 'drizzle-orm'

import { db } from '@/db/db'
import { companyTable } from '@/db/schema/company-schema'
import { projectsTable } from '@/db/schema/projects-schema'
import { projectSubmissionsTable } from '@/db/schema/project-submissions-schema'

import { 
  successResponse, 
  errorResponse, 
  serverErrorResponse,
  validateRequiredFields 
} from '@/app/api/api-utils'

export async function GET(
  req: NextRequest,
  { params }: { params: { companyId: string } }
) {
  try {
    const { companyId } = params
    const { searchParams } = new URL(req.url)
    const mergedFilter = searchParams.get('merged')

    // 1) find the company
    const [company] = await db
      .select()
      .from(companyTable)
      .where(eq(companyTable.id, companyId))
      .limit(1)
    if (!company) {
      return NextResponse.json(
        { isSuccess: false, message: 'Company not found' },
        { status: 404 }
      )
    }

    // 2) find all projects for that company
    const userProjects = await db
      .select()
      .from(projectsTable)
      .where(eq(projectsTable.projectOwner, company.walletAddress))

    if (userProjects.length === 0) {
      return NextResponse.json({
        isSuccess: true,
        data: {
          submissions: [],
          company,
        },
      })
    }
    const projectIds = userProjects.map(p => p.id)

    // 3) build where conditions for submissions
    // Simple approach using a plain SQL string
    const projectIdsStr = projectIds.map(id => `'${id}'`).join(', ');
    const conditions = [];
    
    if (projectIds.length > 0) {
      // Only add this condition if there are project IDs
      conditions.push(sql`${projectSubmissionsTable.projectId} IN (${projectIdsStr})`);
    }
    
    if (mergedFilter === '1') {
      conditions.push(eq(projectSubmissionsTable.isMerged, true));
    } else if (mergedFilter === '0') {
      conditions.push(eq(projectSubmissionsTable.isMerged, false));
    }

    // 4) query
    const rows = await db
      .select({
        submissionId: projectSubmissionsTable.id,
        freelancerAddress: projectSubmissionsTable.freelancerAddress,
        prLink: projectSubmissionsTable.prLink,
        isMerged: projectSubmissionsTable.isMerged,
        projectId: projectSubmissionsTable.projectId,
        createdAt: projectSubmissionsTable.createdAt,
      })
      .from(projectSubmissionsTable)
      .where(and(...conditions))

    return NextResponse.json({
      isSuccess: true,
      data: {
        company,
        submissions: rows,
      },
    })
  } catch (error) {
    console.error('Error GET /api/company/[companyId]/submissions:', error)
    return NextResponse.json(
      { isSuccess: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}