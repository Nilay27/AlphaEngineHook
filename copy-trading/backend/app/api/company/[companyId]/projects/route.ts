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
    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status')

    // Find the company
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

    // Query all projects
    let allProjects = await db
      .select()
      .from(projectsTable)
      .where(eq(projectsTable.projectOwner, company.walletAddress))

    // If user passed ?status=1 => open, ?status=2 => closed, else all
    if (status === '1') {
      allProjects = allProjects.filter((p) => p.projectStatus === 'open')
    } else if (status === '2') {
      allProjects = allProjects.filter((p) => p.projectStatus === 'closed')
    }

    return NextResponse.json({
      isSuccess: true,
      data: {
        company: {
          id: company.id,
          companyName: company.companyName,
          walletAddress: company.walletAddress,
        },
        projects: allProjects.map((proj) => ({
          id: proj.id,
          projectName: proj.projectName,
          projectStatus: proj.projectStatus,
          projectDescription: proj.projectDescription,
        })),
      },
    })
  } catch (error) {
    console.error('Error in GET /api/company/[id]/projects:', error)
    return NextResponse.json(
      { isSuccess: false, message: 'Internal error' },
      { status: 500 }
    )
  }
}