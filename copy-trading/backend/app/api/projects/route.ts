/**
 * @file /app/api/projects/route.ts
 *
 * @description
 * Handles:
 * - GET /api/projects (list/fetch projects with optional query-param-based filtering)
 * - POST /api/projects:
 *     (A) Create a new project (if body has "projectName" etc.)
 *     (B) Filter projects (if body has "status", "skills", "sortBy", etc. but no creation fields)
 *
 * Also includes minimal integration of a 'deadline' field, so you can sort by 'deadline' if needed.
 * If your 'projectsTable' schema does not yet have 'deadline', you should add it. Example:
 *
 *  export const projectsTable = pgTable('projects', {
 *    ...
 *    deadline: timestamp('deadline', { mode: 'date' }), // or .notNull() if required
 *  })
 *
 * This ensures the new "sortBy: 'deadline'" logic works without errors.
 */

import { NextRequest, NextResponse } from 'next/server'
import { eq, sql, asc, desc, and } from 'drizzle-orm'

import { db } from '@/db/db'
import { projectsTable } from '@/db/schema/projects-schema'
import { createProjectAction } from '@/actions/db/projects-actions'
import { companyTable } from '@/db/schema/company-schema'

import {
  successResponse,
  errorResponse,
  serverErrorResponse,
  logApiRequest,
  validateRequiredFields
} from '@/app/api/api-utils'

import { withCors } from '@/lib/cors'

// Helper function to print the schema structure for debugging
function logSchemaStructure() {
  console.log('Projects table schema structure:');
  for (const key in projectsTable) {
    if (typeof projectsTable[key] === 'object' && projectsTable[key] !== null) {
      console.log(`- ${key}`);
    }
  }
}

// We call this once on startup to aid debugging
try {
  logSchemaStructure();
} catch (error) {
  console.error('Error logging schema structure:', error);
}

// -------------------------------------------------------------------------------------
// NEXT.JS 13 route handlers: GET, POST, OPTIONS
// We wrap them with CORS as in your existing code base
// -------------------------------------------------------------------------------------

// We keep dynamic (disable route segment caching)
export const dynamic = 'force-dynamic';

/**
  ┌─────────────────────────────────────────────────────────────────────────┐
  │  GET /api/projects                                                    │
  │                                                                       │
  │  Lists projects, optionally filtered by query parameters:             │
  │   - status       => e.g. ?status=open                                 │
  │   - skill        => e.g. ?skill=React                                 │
  │   - minPrize     => e.g. ?minPrize=50                                 │
  │   - maxPrize     => e.g. ?maxPrize=150                                │
  │   - owner        => e.g. ?owner=0xabc... (projectOwner)               │
  │   - sort         => 'created', 'prize', 'name'                        │
  │   - order        => 'asc' or 'desc'                                   │
  │   - limit        => number (default 20, max 100)                      │
  │   - offset       => pagination offset                                 │
  └─────────────────────────────────────────────────────────────────────────┘
 */
async function getProjects(req: NextRequest) {
  try {
    logApiRequest('GET', '/api/projects', req.ip || 'unknown')

    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status')
    const skill = searchParams.get('skill')
    const minPrize = searchParams.get('minPrize')
    const maxPrize = searchParams.get('maxPrize')
    const owner = searchParams.get('owner')?.toLowerCase()
    const sortBy = searchParams.get('sort') || 'created'
    const sortOrder = searchParams.get('order') || 'desc'
    const limitParam = searchParams.get('limit')
    const offsetParam = searchParams.get('offset')

    // Parse limit & offset
    const limit = limitParam ? Math.min(parseInt(limitParam, 10), 100) : 20
    const offset = offsetParam ? parseInt(offsetParam, 10) : 0

    // Build the query with proper type casting
    let query = db.select().from(projectsTable) as any

    // Apply filters one by one
    if (status) {
      query = query.where(eq(projectsTable.projectStatus, status))
    }
    
    if (minPrize) {
      query = query.where(sql`${projectsTable.prizeAmount} >= ${minPrize}`)
    }
    
    if (maxPrize) {
      query = query.where(sql`${projectsTable.prizeAmount} <= ${maxPrize}`)
    }
    
    if (skill) {
      query = query.where(sql`${projectsTable.requiredSkills} ILIKE ${'%' + skill + '%'}`)
    }
    
    if (owner) {
      query = query.where(eq(projectsTable.projectOwner, owner))
    }

    // Sorting
    switch (sortBy) {
      case 'prize':
        query = query.orderBy(sortOrder === 'asc' ? asc(projectsTable.prizeAmount) : desc(projectsTable.prizeAmount))
        break
      case 'name':
        query = query.orderBy(sortOrder === 'asc' ? asc(projectsTable.projectName) : desc(projectsTable.projectName))
        break
      case 'created':
      default:
        query = query.orderBy(sortOrder === 'asc' ? asc(projectsTable.createdAt) : desc(projectsTable.createdAt))
        break
    }

    // Apply limit and offset
    query = query.limit(limit).offset(offset)

    // Execute the query
    const rows = await query

    // Return success
    const response = successResponse(rows, undefined, 200)
    // Optionally set Cache-Control if you like
    response.headers.set('Cache-Control', 'public, max-age=60')
    return response
  } catch (err) {
    console.error('[GET /api/projects] error:', err)
    return serverErrorResponse(err)
  }
}

/**
  ┌───────────────────────────────────────────────────────────────────────────────────────┐
  │ POST /api/projects                                                                  │
  │                                                                                     │
  │ This single POST endpoint handles two possible flows:                               │
  │  1) Create a new project (if the request body has "projectName", "projectOwner",    │
  │     etc. - basically the required fields for creation).                             │
  │  2) If the body is missing project-creation fields but has filtering fields such    │
  │     as "status", "skills", etc., then we treat it as a "filter" request.            │
  │                                                                                     │
  │ Filter request body fields:                                                         │
  │   {                                                                                 │
  │     "status": "open" | "closed",                                                   │
  │     "skills": "HTML, CSS, JavaScript",                                             │
  │     "sortBy": "reward" | "deadline" | "createdAt",                                  │
  │     "sortOrder": "asc" | "desc",                                                    │
  │     "page": "1",                                                                    │
  │     "limit": "10"                                                                   │
  │   }                                                                                 │
  │                                                                                     │
  │ Create request body fields (example):                                               │
  │   {                                                                                 │
  │     "projectName": "Cool Project",                                                 │
  │     "projectDescription": "Some description",                                       │
  │     "projectOwner": "myname.eth",   // or 0x.. if still in transition               │
  │     "prizeAmount": 100,                                                             │
  │     "requiredSkills": "React,NodeJS",                                               │
  │     "completionSkills": "Docker,CI/CD",                                             │
  │     "blockchainProjectId": "0x1234..." // Optional, if project was created on chain │
  │   }                                                                                 │
  └───────────────────────────────────────────────────────────────────────────────────────┘
 */
async function postProjectsHandler(req: NextRequest) {
  try {
    // 1) Attempt to parse request body
    const body = await req.json().catch(() => ({}))

    // 2) Detect if it looks like a "create project" request
    //    We'll check for "projectName" as a required field in creation
    //    If found, we do the "createProject" logic
    if (body.projectName) {
      // ---------------------------------------------------------
      // CREATE PROJECT FLOW
      // ---------------------------------------------------------
      logApiRequest('POST', '/api/projects => createProject', req.ip || 'unknown')

      // Validate required fields for creation
      const validation = validateRequiredFields(body, ['walletAddress', 'walletEns', 'projectName'])
      if (!validation.isValid) {
        return errorResponse(
          `Missing required fields: ${validation.missingFields.join(', ')}`,
          400,
          validation.missingFields.reduce((acc, field) => {
            acc[field] = [`${field} is required`];
            return acc;
          }, {} as Record<string, string[]>)
        )
      }

      // We call the existing createProjectAction
      const result = await createProjectAction({
        walletEns: body.walletEns,
        walletAddress: body.walletAddress,
        projectName: body.projectName,
        projectDescription: body.projectDescription,
        prizeAmount: body.prizeAmount,        
        projectRepo: body.projectRepo || body.projectLink,
        requiredSkills: Array.isArray(body.requiredSkills)
          ? body.requiredSkills.join(', ')
          : (body.requiredSkills || ''),
        completionSkills: body.completionSkills,
        deadline: body.deadline, // Pass through as is - validation happens in createProjectAction
        // Add the blockchain project ID if it exists
        onChainProjectId: body.blockchainProjectId || body.onChainProjectId
      })

      if (!result.isSuccess) {
        // If it failed because of validation or other issues
        return errorResponse(result.message || 'Failed to create project', 400)
      }

      return successResponse(result.data, 'Project created successfully')
    }

    // ---------------------------------------------------------
    // FILTERING FLOW (no 'projectName' => treat as filter)
    // ---------------------------------------------------------
    logApiRequest('POST', '/api/projects => filterProjects', req.ip || 'unknown')

    // Read fields from the request body
    const tab = body.tab || 'all'
    const status = body.status || ''
    const skills = body.skills || ''
    const sortBy = body.sortBy || 'createdAt'  // fallback to createdAt
    const sortOrder = body.sortOrder || 'desc'
    const page = parseInt(body.page || '1', 10)
    const limit = parseInt(body.limit || '10', 10)
    const offset = (page - 1) * limit
    
    console.log('Filtering projects with params:', { tab, status, skills, sortBy, sortOrder, page, limit })

    // Build query with proper type casting
    let query = db.select().from(projectsTable) as any

    // if status provided
    if (status) {
      console.log(`Applying status filter: "${status}" (original type: ${typeof status})`)
      
      // Use direct equality with the column name to avoid any issues
      query = query.where(eq(projectsTable.projectStatus, status))
      
      // Log the generated SQL for debugging
      console.log('Generated SQL condition:', 'project_status = ' + status)
    }

    // if skills provided => require each skill to appear in requiredSkills
    if (skills) {
      console.log(`Applying skills filter: "${skills}"`);
      
      const skillsList = skills.split(',').map((s: string) => s.trim().toLowerCase());
      console.log('Skills list for filtering:', skillsList);
      
      // Use SQL LIKE for each skill
      for (const skill of skillsList) {
        query = query.where(
          sql`${projectsTable.requiredSkills} ILIKE ${'%' + skill + '%'}`
        );
      }
    }

    // Apply sorting
    if (sortBy === 'reward') {
      query = query.orderBy(
        sortOrder === 'asc' ? asc(projectsTable.prizeAmount) : desc(projectsTable.prizeAmount)
      )
    } else if (sortBy === 'deadline') {
      query = query.orderBy(
        sortOrder === 'asc' ? asc(projectsTable.deadline) : desc(projectsTable.deadline)
      )
    } else {
      // default is createdAt
      query = query.orderBy(
        sortOrder === 'asc' ? asc(projectsTable.createdAt) : desc(projectsTable.createdAt)
      )
    }

    // Apply pagination
    query = query.limit(limit).offset(offset)

    // Execute query
    const rows = await query
    
    // Log the raw results to debug
    console.log(`Query returned ${rows.length} projects before final filtering`);
    if (rows.length > 0) {
      console.log('First project status:', rows[0].projectStatus);
    }
    
    // Apply an additional manual filter for status if provided
    // This ensures we only return projects that truly match the status
    let filteredRows = rows;
    if (status) {
      filteredRows = rows.filter(project => 
        project.projectStatus && project.projectStatus.toLowerCase() === status.toLowerCase()
      );
      console.log(`After manual status filtering: ${filteredRows.length} projects remain`);
    }
    
    // Apply manual skills filtering if needed
    if (skills && filteredRows.length > 0) {
      const skillsList = skills.split(',').map(s => s.trim().toLowerCase());
      
      filteredRows = filteredRows.filter(project => {
        if (!project.requiredSkills) return false;
        
        const projectSkills = project.requiredSkills.toLowerCase();
        return skillsList.every(skill => projectSkills.includes(skill));
      });
      
      console.log(`After manual skills filtering: ${filteredRows.length} projects remain`);
    }

    // Return formatted response
    return NextResponse.json({
      isSuccess: true,
      data: filteredRows.map((p) => ({
        ...p,
        // Convert deadline to ISO string if present
        deadline: p.deadline ? p.deadline.toISOString() : null
      }))
    }, { status: 200 })

  } catch (error) {
    console.error('[POST /api/projects] error:', error)
    return NextResponse.json(
      { isSuccess: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/projects
 * Updates an existing project
 * 
 * Request body should contain:
 * - projectId: string (required)
 * - projectName: string (required)
 * - projectDescription?: string
 * - requiredSkills?: string
 * - completionSkills?: string
 * - projectRepo?: string
 * - walletAddress: string (required for authorization)
 * - walletEns?: string (optional, for ENS support)
 * 
 * Note: prizeAmount cannot be changed after project creation
 */
async function putProjectHandler(req: NextRequest) {
  try {
    const body = await req.json()
    console.log('[PUT /api/projects] Request body:', JSON.stringify(body, null, 2))

    // Validate required fields
    const validation = validateRequiredFields(body, ['projectId', 'projectName', 'walletAddress'])
    if (!validation.isValid) {
      return errorResponse(
        `Missing required fields: ${validation.missingFields.join(', ')}`,
        400
      )
    }

    // Check if user is trying to change prizeAmount, which is not allowed
    if (body.prizeAmount !== undefined) {
      return errorResponse('Changing prize amount is not allowed after project creation', 400)
    }

    // Find the project first to verify ownership
    console.log(`[PUT /api/projects] Looking for project with ID: ${body.projectId}`)
    const [project] = await db
      .select()
      .from(projectsTable)
      .where(eq(projectsTable.projectId, body.projectId))
      .limit(1)

    if (!project) {
      return errorResponse('Project not found', 404)
    }

    console.log('[PUT /api/projects] Found project:', JSON.stringify(project, null, 2))

    // Verify ownership - check both wallet address and ENS
    const isOwner = 
      (project.projectOwnerWalletAddress && 
       project.projectOwnerWalletAddress.toLowerCase() === body.walletAddress.toLowerCase()) ||
      (body.walletEns && project.projectOwnerWalletEns && 
       project.projectOwnerWalletEns.toLowerCase() === body.walletEns.toLowerCase())

    console.log(`[PUT /api/projects] Ownership check: ${isOwner}`)
    console.log(`Project owner: ${project.projectOwnerWalletEns} / ${project.projectOwnerWalletAddress}`)
    console.log(`Request from: ${body.walletEns} / ${body.walletAddress}`)

    if (!isOwner) {
      return errorResponse('Only the project owner can update this project', 403)
    }

    // Prepare update data with only fields that exist in the schema
    const updateData = {
      projectName: body.projectName,
      projectDescription: body.projectDescription || '',
      requiredSkills: body.requiredSkills || '',
      completionSkills: body.completionSkills || '',
      projectRepo: body.projectRepo || '',
      updatedAt: new Date(),
      projectOwnerWalletAddress: body.walletAddress,
      projectOwnerWalletEns: body.walletEns
    }

    console.log('[PUT /api/projects] Update data:', JSON.stringify(updateData, null, 2))

    try {
      // Update the project
      const [updated] = await db
        .update(projectsTable)
        .set(updateData)
        .where(eq(projectsTable.projectId, body.projectId))
        .returning()

      console.log('[PUT /api/projects] Update successful:', updated ? 'Yes' : 'No')
      return successResponse(updated, 'Project updated successfully')
    } catch (dbError: any) {
      console.error('[PUT /api/projects] Database error during update:', dbError)
      // Add more specific error information to help debug
      if (dbError.message && dbError.message.includes('syntax error')) {
        return errorResponse(
          'Database syntax error. This might be due to a mismatch between code and schema.',
          500
        )
      }
      return serverErrorResponse(dbError)
    }
  } catch (error) {
    console.error('[PUT /api/projects] error:', error)
    return serverErrorResponse(error)
  }
}

/**
 * DELETE /api/projects
 * Deletes a project if the caller is the owner and the project isn't assigned
 * 
 * Request body should contain:
 * - projectId: string (required)
 * - walletEns?: string (primary way to identify owner)
 * - walletAddress?: string (backup/alternative way to identify owner)
 * 
 * At least one of walletEns or walletAddress must be provided
 */
async function deleteProjectHandler(req: NextRequest) {
  try {
    const body = await req.json()
    const { projectId, walletAddress, walletEns } = body
    console.log('[DELETE /api/projects] Request body:', { projectId, walletAddress, walletEns })

    // Validate projectId
    if (!projectId) {
      return errorResponse('Missing projectId in request body', 400)
    }

    // Validate that at least one identification method is provided
    if (!walletAddress && !walletEns) {
      return errorResponse('Must provide either walletEns or walletAddress', 400)
    }

    // Find the project first
    const [project] = await db
      .select()
      .from(projectsTable)
      .where(eq(projectsTable.projectId, projectId))
      .limit(1)

    if (!project) {
      return errorResponse('Project not found', 404)
    }

    // Cannot delete if project is assigned
    if (project.assignedFreelancerWalletAddress || project.assignedFreelancerWalletEns) {
      return errorResponse('Cannot delete a project that has been assigned', 400)
    }

    // Check ownership using multiple methods
    let isAuthorized = false;
    console.log('Project owner details:', {
      ens: project.projectOwnerWalletEns,
      address: project.projectOwnerWalletAddress
    })
    console.log('Requester details:', { ens: walletEns, address: walletAddress })

    // Method 1: Direct match with walletEns
    if (walletEns && project.projectOwnerWalletEns && 
        project.projectOwnerWalletEns.toLowerCase() === walletEns.toLowerCase()) {
      isAuthorized = true;
      console.log('Authorized via ENS match')
    }
    // Method 2: Direct match with walletAddress
    else if (walletAddress && project.projectOwnerWalletAddress && 
             project.projectOwnerWalletAddress.toLowerCase() === walletAddress.toLowerCase()) {
      isAuthorized = true;
      console.log('Authorized via wallet address match')
    }
    // Method 3: ENS lookup if project owner is a wallet address
    else if (walletEns) {
      const [company] = await db
        .select()
        .from(companyTable)
        .where(eq(companyTable.walletEns, walletEns.toLowerCase()))
        .limit(1)

      if (company && company.walletAddress && project.projectOwnerWalletAddress && 
          company.walletAddress.toLowerCase() === project.projectOwnerWalletAddress.toLowerCase()) {
        isAuthorized = true;
        console.log('Authorized via company ENS lookup')
      }
    }
    // Method 4: Reverse lookup if project owner is an ENS
    else if (walletAddress) {
      const [company] = await db
        .select()
        .from(companyTable)
        .where(eq(companyTable.walletAddress, walletAddress.toLowerCase()))
        .limit(1)

      if (company && company.walletEns && project.projectOwnerWalletEns && 
          company.walletEns.toLowerCase() === project.projectOwnerWalletEns.toLowerCase()) {
        isAuthorized = true;
        console.log('Authorized via company wallet address lookup')
      }
    }

    if (!isAuthorized) {
      return errorResponse('Only the project owner can delete this project', 403)
    }

    try {
      console.log(`[DELETE /api/projects] Attempting to delete project: ${projectId}`)
      
      // Perform the delete
      await db
        .delete(projectsTable)
        .where(eq(projectsTable.projectId, projectId))

      console.log(`[DELETE /api/projects] Successfully deleted project: ${projectId}`)
      return successResponse({
        projectId: projectId,
        walletAddress: walletAddress,
        walletEns: walletEns
      }, 'Project deleted successfully')
    } catch (dbError: any) {
      console.error('[DELETE /api/projects] Database error during delete:', dbError)
      if (dbError.message && dbError.message.includes('syntax error')) {
        return errorResponse(
          'Database syntax error. This might be due to a mismatch between code and schema.',
          500
        )
      }
      return serverErrorResponse(dbError)
    }
  } catch (error) {
    console.error('[DELETE /api/projects] error:', error)
    return serverErrorResponse(error)
  }
}

// ----------------------------------------------------------
// Exports: Next.js route handlers
// ----------------------------------------------------------

/**
 * GET /api/projects => calls getProjects
 */
export const GET = withCors(getProjects)

/**
 * POST /api/projects => can CREATE or FILTER (as described above)
 */
export const POST = withCors(postProjectsHandler)

/**
 * PUT /api/projects
 * Updates an existing project
 * 
 * Request body should contain:
 * - projectId: string (required)
 * - projectName: string (required)
 * - projectDescription?: string
 * - prizeAmount?: string | number
 * - requiredSkills?: string
 * - completionSkills?: string
 * - projectRepo?: string
 * - walletAddress: string (required for authorization)
 * - walletEns?: string (optional, for ENS support)
 */
export const PUT = withCors(putProjectHandler)

/**
 * DELETE /api/projects
 * Deletes a project if the caller is the owner and the project isn't assigned
 * 
 * Request body should contain:
 * - projectId: string (required)
 * - walletEns?: string (primary way to identify owner)
 * - walletAddress?: string (backup/alternative way to identify owner)
 * 
 * At least one of walletEns or walletAddress must be provided
 */
export const DELETE = withCors(deleteProjectHandler)

/**
 * OPTIONS /api/projects => needed for CORS preflight
 */
export const OPTIONS = withCors(async () => {
  return new Response(null, { status: 204 })
})