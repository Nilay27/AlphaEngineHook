import { eq } from 'drizzle-orm'
import { NextRequest, NextResponse } from 'next/server'

import { db } from '@/db/db'
import { projectsTable } from '@/db/schema/projects-schema'

/**
 * POST /api/projects/:projectId/assign
 * Assign a freelancer to a project
 * Request body should contain:
 * - freelancerAddress: wallet address of the freelancer to assign
 * - walletAddress: wallet address of the project owner (for authorization)
 */
export async function POST(
  req: NextRequest,
  { params }: { params: { projectId: string } }
) {
  try {
    const projectId = params.projectId
    const body = await req.json()
    
    if (!body.freelancerAddress || !body.walletAddress) {
      return NextResponse.json(
        { message: 'Missing freelancerAddress or walletAddress' },
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
        { message: 'Unauthorized: Only the project owner can assign freelancers' },
        { status: 403 }
      )
    }
    
    // Check if project can be assigned
    if (project.projectStatus !== 'open') {
      return NextResponse.json(
        { message: 'Cannot assign freelancer to a closed project' },
        { status: 400 }
      )
    }
    
    if (project.assignedFreelancer) {
      return NextResponse.json(
        { message: 'Project already has an assigned freelancer' },
        { status: 400 }
      )
    }
    
    // Assign the freelancer
    const [updated] = await db
      .update(projectsTable)
      .set({
        assignedFreelancer: body.freelancerAddress,
        updatedAt: new Date()
      })
      .where(eq(projectsTable.id, projectId))
      .returning()
    
    return NextResponse.json(
      { 
        message: 'Freelancer assigned successfully',
        data: updated
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('[POST /api/projects/:id/assign] Error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/projects/:projectId/assign
 * Remove a freelancer assignment from a project
 * Query parameter: walletAddress (for authorization)
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: { projectId: string } }
) {
  try {
    const projectId = params.projectId
    
    // Get wallet address from the URL query parameters
    const { searchParams } = new URL(req.url)
    const walletAddress = searchParams.get('walletAddress')
    
    if (!walletAddress) {
      return NextResponse.json(
        { message: 'Missing walletAddress parameter' },
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
    if (project.projectOwner !== walletAddress) {
      return NextResponse.json(
        { message: 'Unauthorized: Only the project owner can remove assignments' },
        { status: 403 }
      )
    }
    
    // Check if project can be modified
    if (project.projectStatus !== 'open') {
      return NextResponse.json(
        { message: 'Cannot modify a closed project' },
        { status: 400 }
      )
    }
    
    if (!project.assignedFreelancer) {
      return NextResponse.json(
        { message: 'Project does not have an assigned freelancer' },
        { status: 400 }
      )
    }
    
    // Remove the assignment
    const [updated] = await db
      .update(projectsTable)
      .set({
        assignedFreelancer: null,
        updatedAt: new Date()
      })
      .where(eq(projectsTable.id, projectId))
      .returning()
    
    return NextResponse.json(
      { 
        message: 'Freelancer assignment removed successfully',
        data: updated
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('[DELETE /api/projects/:id/assign] Error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
} 