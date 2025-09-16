import { NextRequest, NextResponse } from 'next/server'
import { eq } from 'drizzle-orm'

import { db } from '@/db/db'
import { companyTable } from '@/db/schema/company-schema'
import { projectsTable } from '@/db/schema/projects-schema'

export async function GET(
  req: NextRequest,
  { params }: { params: { companyId: string } }
) {
  try {
    const { companyId } = params

    // 1) Query the company
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

    // 2) Count open projects for stats
    const allProjects = await db
      .select()
      .from(projectsTable)
      .where(eq(projectsTable.projectOwner, company.walletAddress))

    const activeProjects = allProjects.filter(p => p.projectStatus === 'open')
    const numActive = activeProjects.length

    // For “pull requests to review,” we pretend it's 7 in the example
    const numPullRequests = 7

    // 3) Return JSON in a shape that the page expects
    return NextResponse.json({
      isSuccess: true,
      data: {
        companyName: company.companyName,
        walletAddress: company.walletAddress,
        numActive,
        numPullRequests,
      },
    })
  } catch (error) {
    console.error('Error in GET /api/company/[companyId]/dashboard:', error)
    return NextResponse.json(
      { isSuccess: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}