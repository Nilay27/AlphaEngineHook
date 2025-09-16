import { eq } from 'drizzle-orm'
import { NextRequest, NextResponse } from 'next/server'

import { db } from '@/db/db'
import { projectsTable } from '@/db/schema/projects-schema'

/**
 * PUT /api/projects/:projectId/status
 * Change a project's status
 * Request body should contain:
 * - status: The new project status ('open' or 'closed')
 * - walletAddress: Wallet address of the project owner (for authorization)
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: { projectId: string } }
) {
  try {
    const projectId = params.projectId
    const body = await req.json()
    
    if (!body.status || !body.walletAddress) {
      return NextResponse.json(
        { message: 'Missing status or walletAddress' },
        { status: 400 }
      )
    }
    
    // Validate status value
    if (!['open', 'closed'].includes(body.status)) {
      return NextResponse.json(
        { message: 'Invalid status value. Valid values are: open, closed' },
        { status: 400 }
      )
    }
    
    // Check if project exists and verify owner
    const [project] = await db
      .select()
      .from(projectsTable)
      .where(eq(projectsTable.id, projectId))
      .limit(1)
    
    if (!project) {
      return NextResponse.json(
        { message: 'Project not found' },
        { status: 404 }
      )
    }
    
    // Verify ownership
    if (project.projectOwner !== body.walletAddress) {
      return NextResponse.json(
        { message: 'Unauthorized: Only the project owner can change the status' },
        { status: 403 }
      )
    }
    
    // No change needed if status is already the requested status
    if (project.projectStatus === body.status) {
      return NextResponse.json(
        { message: `Project is already ${body.status}`, data: project },
        { status: 200 }
      )
    }
    
    // Special checks for reopening a closed project
    if (body.status === 'open' && project.projectStatus === 'closed') {
      // You could add additional logic here if needed,
      // e.g., check if tokens have been awarded, etc.
    }
    
    // Update the project status
    const [updated] = await db
      .update(projectsTable)
      .set({
        projectStatus: body.status,
        updatedAt: new Date()
      })
      .where(eq(projectsTable.id, projectId))
      .returning()
    
    return NextResponse.json(
      { 
        message: `Project status changed to ${body.status} successfully`,
        data: updated
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('[PUT /api/projects/:id/status] Error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
} 