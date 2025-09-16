/**
 * @file /app/api/projects/[projectId]/route.ts
 *
 * @description
 * Handles:
 * - GET /api/projects/{projectId} - Get a specific project by ID including its submissions
 * - PUT /api/projects/{projectId} - Update a project by ID
 * - DELETE /api/projects/{projectId} - Delete a project by ID
 */

import { NextRequest, NextResponse } from 'next/server'
import { eq } from 'drizzle-orm'

import { db } from '@/db/db'
import { projectsTable } from '@/db/schema/projects-schema'
import { projectSubmissionsTable } from '@/db/schema/project-submissions-schema'
import { companyTable } from '@/db/schema/company-schema'

import {
  successResponse,
  errorResponse,
  serverErrorResponse,
  logApiRequest
} from '@/app/api/api-utils'

import { withCors } from '@/lib/cors'


// GET handler without withCors wrapper (will be wrapped later)
async function getProjectById(req: NextRequest, context: { params: { projectId: string } }) {
  try {
    const { projectId } = context.params
    logApiRequest('GET', `/api/projects/${projectId}`, req.ip || 'unknown')

    // Fetch project details
    const project = await db
      .select()
      .from(projectsTable)
      .where(eq(projectsTable.projectId, projectId))
      .limit(1)
      .then(rows => rows[0] || null)

    if (!project) {
      return errorResponse(`Project with ID ${projectId} not found`, 404)
    }

    // Fetch submission IDs for this project
    const submissions = await db
      .select({
        submissionId: projectSubmissionsTable.submissionId,
        status: projectSubmissionsTable.status,
        createdAt: projectSubmissionsTable.createdAt
      })
      .from(projectSubmissionsTable)
      .where(eq(projectSubmissionsTable.projectId, projectId))
      .orderBy(projectSubmissionsTable.createdAt)

    // Format the project data for response
    const projectResponse = {
      ...project,
      // Convert timestamp fields to ISO strings for JSON
      createdAt: project.createdAt ? project.createdAt.toISOString() : null,
      updatedAt: project.updatedAt ? project.updatedAt.toISOString() : null,
      deadline: project.deadline ? project.deadline.toISOString() : null,
      // Add submissions array
      submissions: submissions.map(sub => ({
        submissionId: sub.submissionId,
        status: sub.status,
        createdAt: sub.createdAt ? sub.createdAt.toISOString() : null
      }))
    }

    return successResponse(projectResponse, `Project details retrieved successfully`)
  } catch (err) {
    console.error(`[GET /api/projects/${context.params.projectId}] error:`, err)
    return serverErrorResponse(err)
  }
}



/**
 * PUT /api/projects/[projectId]
 * 
 * Updates a project.
 * Request body should contain:
 * - projectName: string (required)
 * - projectDescription?: string
 * - prizeAmount?: number|string
 * - requiredSkills?: string
 * - completionSkills?: string
 * - projectRepo?: string
 * - (EITHER) walletAddress: string (required) 
 *   OR walletEns: string (required if you do not pass walletAddress)
 *   because we treat 'walletEns' as the primary key in an ENS-based approach.
 */
async function updateProject(
  req: NextRequest,
  { params }: { params: { projectId: string } }
) {
  try {
    const projectId = params.projectId
    const body = await req.json()
    console.log('Update project request body:', JSON.stringify(body))

    const { 
      projectName, 
      projectDescription, 
      prizeAmount, 
      requiredSkills, 
      completionSkills, 
      projectRepo,
      walletAddress,    // optional if you provide walletEns
      walletEns,        // new field to handle "ENS is primary"
      deadline
    } = body

  

    console.log(`Looking for project with ID: ${projectId}`)
    // Find the project first to determine ownership check method
    const [project] = await db
      .select()
      .from(projectsTable)
      .where(eq(projectsTable.projectId, projectId))
      .limit(1)

    if (!project) {
      return NextResponse.json(
        { isSuccess: false, message: 'Project not found' },
        { status: 404 }
      )
    }

    console.log('Found project:', JSON.stringify(project))

    // Check ownership - account for different ways project_owner might be stored
    let isAuthorized = false;
    
    // Case 1: Direct match on ENS name
    if (walletEns && project.projectOwnerWalletEns && 
        project.projectOwnerWalletEns.toLowerCase() === walletEns.toLowerCase()) {
      isAuthorized = true;
      console.log('Authorized via direct ENS match')
    } 
    // Case 2: Direct match on wallet address 
    else if (walletAddress && project.projectOwnerWalletAddress &&
             project.projectOwnerWalletAddress.toLowerCase() === walletAddress.toLowerCase()) {
      isAuthorized = true;
      console.log('Authorized via direct wallet address match')
    }
    
    // Case 3: Reverse lookup (if project_owner is ENS but user provided wallet address)
    else if (walletAddress && !isAuthorized) {
      const [company] = await db
        .select()
        .from(companyTable)
        .where(eq(companyTable.walletAddress, walletAddress.toLowerCase()))
        .limit(1)
        
      if (company && company.walletEns && project.projectOwnerWalletEns && 
          company.walletEns.toLowerCase() === project.projectOwnerWalletEns.toLowerCase()) {
        isAuthorized = true;
        console.log('Authorized via company wallet-to-ENS lookup')
      }
    }
    // Case 4: ENS lookup needed (if project_owner is wallet address but user provided ENS)
    else if (walletEns && !isAuthorized) {
      // Look up the company that has this walletEns
      const [company] = await db
        .select()
        .from(companyTable)
        .where(eq(companyTable.walletEns, walletEns.toLowerCase()))
        .limit(1)

      if (company && company.walletAddress && project.projectOwnerWalletAddress && 
          company.walletAddress.toLowerCase() === project.projectOwnerWalletAddress.toLowerCase()) {
        isAuthorized = true;
        console.log('Authorized via company ENS-to-wallet lookup')
      }
    }

    // For development ease, temporarily consider all requests authorized
    // REMOVE THIS LINE IN PRODUCTION
    isAuthorized = true;

    if (!isAuthorized) {
      console.log('Authorization failed:', {
        requestedBy: { walletEns, walletAddress },
        projectOwner: { ens: project.projectOwnerWalletEns, address: project.projectOwnerWalletAddress }
      })
      
      return NextResponse.json(
        { isSuccess: false, message: 'Only the project owner can update this project' },
        { status: 403 }
      )
    }

    console.log('Performing update with data:', {
      projectName,
      projectDescription,
      prizeAmount,
      requiredSkills,
      completionSkills,
      projectRepo,
      deadline
    })

    // Parse deadline if it's a string
    let parsedDeadline = deadline;
    if (typeof deadline === 'string') {
      parsedDeadline = new Date(deadline);
      console.log(`Parsed deadline from ${deadline} to ${parsedDeadline}`)
    }

    // Perform the update
    try {
      const [updated] = await db
        .update(projectsTable)
        .set({
          projectName,
          projectDescription,
          prizeAmount: prizeAmount?.toString() || '0',
          requiredSkills,
          completionSkills,
          projectRepo,
          updatedAt: new Date(),
          deadline: parsedDeadline
        })
        .where(eq(projectsTable.projectId, projectId))
        .returning()
  
      console.log('Update successful:', updated ? 'Yes' : 'No')
      return NextResponse.json({ isSuccess: true, data: updated }, { status: 200 })
    } catch (dbError: any) {
      console.error('Database error during update:', dbError)
      return NextResponse.json(
        { 
          isSuccess: false, 
          message: 'Database error updating project', 
          debugInfo: { 
            error: dbError.message,
            stack: dbError.stack 
          }
        },
        { status: 500 }
      )
    }
  } catch (err) {
    console.error('Error in PUT /api/projects/[projectId]:', err)
    return NextResponse.json(
      { 
        isSuccess: false, 
        message: 'Internal server error',
        debugInfo: { 
          error: err instanceof Error ? err.message : String(err),
          stack: err instanceof Error ? err.stack : undefined
        }
      },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/projects/[projectId]
 *
 * Either:
 *   - pass "walletAddress" in body, or
 *   - pass "walletEns" in body, from which we will derive the actual wallet address
 * 
 * Example request body:
 * {
 *   "walletEns": "mycompany.eth"
 * }
 * or:
 * {
 *   "walletAddress": "0xAbC123..."
 * }
 *
 * This method checks project ownership. 
 * Also checks if `assignedFreelancer` is null before allowing deletion.
 */
async function deleteProject(
  req: NextRequest,
  { params }: { params: { projectId: string } }
) {
  try {
    const projectId = params.projectId
    console.log(`Processing DELETE request for project ID: ${projectId}`)
    
    let body;
    try {
      body = await req.json()
      console.log('DELETE request body:', JSON.stringify(body))
    } catch (parseError) {
      console.error('Failed to parse request body:', parseError)
      return NextResponse.json(
        { 
          isSuccess: false, 
          message: 'Invalid request body format', 
          debugInfo: { error: 'JSON parse error', details: String(parseError) }
        },
        { status: 400 }
      )
    }

    const { walletAddress, walletEns } = body

    if (!walletAddress && !walletEns) {
      return NextResponse.json(
        { 
          isSuccess: false, 
          message: 'Either walletAddress or walletEns is required',
          debugInfo: { receivedBody: body }
        },
        { status: 400 }
      )
    }

    // Find the project first
    const projects = await db
      .select()
      .from(projectsTable)
      .where(eq(projectsTable.projectId, projectId))
      .limit(1)
    
    if (!projects || projects.length === 0) {
      return NextResponse.json(
        { 
          isSuccess: false, 
          message: 'Project not found',
          debugInfo: { 
            projectId,
            query: `SELECT * FROM projects WHERE project_id = '${projectId}' LIMIT 1`
          }
        },
        { status: 404 }
      )
    }

    const project = projects[0]
    console.log('Found project:', JSON.stringify(project))

    // Check ownership - account for different ways project_owner might be stored
    let isAuthorized = false;
    
    // Case 1: Direct match on ENS name
    if (walletEns && project.projectOwnerWalletEns && 
        project.projectOwnerWalletEns.toLowerCase() === walletEns.toLowerCase()) {
      isAuthorized = true;
      console.log("Authorized by direct ENS match");
    } 
    // Case 2: Direct match on wallet address 
    else if (walletAddress && project.projectOwnerWalletAddress &&
             project.projectOwnerWalletAddress.toLowerCase() === walletAddress.toLowerCase()) {
      isAuthorized = true;
      console.log("Authorized by direct wallet address match");
    }
    // Case 3: ENS lookup needed (if project_owner is wallet address but user provided ENS)
    else if (walletEns && !isAuthorized) {
      // Look up the company that has this walletEns
      const companies = await db
        .select()
        .from(companyTable)
        .where(eq(companyTable.walletEns, walletEns.toLowerCase()))
        .limit(1)

      if (companies.length > 0) {
        const company = companies[0]
        if (company && company.walletAddress && project.projectOwnerWalletAddress && 
            company.walletAddress.toLowerCase() === project.projectOwnerWalletAddress.toLowerCase()) {
          isAuthorized = true;
          console.log("Authorized by ENS-to-wallet lookup");
        }
      }
    }
    // Case 4: Reverse lookup (if project_owner is ENS but user provided wallet address)
    else if (walletAddress && !isAuthorized) {
      const companies = await db
        .select()
        .from(companyTable)
        .where(eq(companyTable.walletAddress, walletAddress.toLowerCase()))
        .limit(1)
        
      if (companies.length > 0) {
        const company = companies[0]
        if (company && company.walletEns && project.projectOwnerWalletEns && 
            company.walletEns.toLowerCase() === project.projectOwnerWalletEns.toLowerCase()) {
          isAuthorized = true;
          console.log("Authorized by wallet-to-ENS lookup");
        }
      }
    }

    // For development ease, temporarily consider all requests authorized
    // REMOVE THIS LINE IN PRODUCTION
    isAuthorized = true;

    if (!isAuthorized) {
      console.log("Authorization failed:", {
        projectOwner: { 
          ens: project.projectOwnerWalletEns, 
          address: project.projectOwnerWalletAddress 
        },
        requestedBy: { 
          walletEns, 
          walletAddress 
        }
      });
      
      return NextResponse.json(
        { isSuccess: false, message: 'Only the owner can delete this project' },
        { status: 403 }
      )
    }

    // Cannot delete if project is assigned
    if (project.assignedFreelancerWalletAddress || project.assignedFreelancerWalletEns) {
      return NextResponse.json(
        { isSuccess: false, message: 'Cannot delete a project that has been assigned' },
        { status: 400 }
      )
    }

    // Perform the delete
    try {
      await db
        .delete(projectsTable)
        .where(eq(projectsTable.projectId, projectId))
      
      console.log(`Successfully deleted project with ID: ${projectId}`)
      return NextResponse.json(
        { isSuccess: true, message: 'Project deleted successfully' },
        { status: 200 }
      )
    } catch (deleteError: any) {
      console.error('Error deleting project:', deleteError)
      return NextResponse.json(
        { 
          isSuccess: false, 
          message: 'Error deleting project',
          debugInfo: { 
            error: deleteError.message, 
            stack: deleteError.stack,
            projectId 
          }
        },
        { status: 500 }
      )
    }
  } catch (err) {
    console.error('Error in DELETE /api/projects/[projectId]:', err)
    return NextResponse.json(
      { 
        isSuccess: false, 
        message: 'Internal server error',
        debugInfo: { 
          error: err instanceof Error ? err.message : String(err),
          stack: err instanceof Error ? err.stack : undefined
        }
      },
      { status: 500 }
    )
  }
}

// We keep dynamic (disable route segment caching)
export const dynamic = 'force-dynamic';

// The wrapped GET handler - Next.js will call this with req and context
export const GET = (req: NextRequest, context: { params: { projectId: string } }) => {
  // Use a closure to preserve the context parameter
  const wrappedHandler = withCors((innerReq: NextRequest) => {
    return getProjectById(innerReq, context)
  })
  
  return wrappedHandler(req)
}

export const PUT = (req: NextRequest, context: any) => {
  return withCors(async (req: NextRequest) => updateProject(req, context))(req);
};

export const DELETE = (req: NextRequest, context: any) => {
  return withCors(async (req: NextRequest) => deleteProject(req, context))(req);
};


// OPTIONS handler
export const OPTIONS = withCors(async () => {
  return new Response(null, { status: 204 })
}) 