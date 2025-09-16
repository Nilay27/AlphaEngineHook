import { NextRequest, NextResponse } from 'next/server'
import { eq } from 'drizzle-orm'

import { db } from '@/db/db'
import { projectsTable } from '@/db/schema/projects-schema'
import { withCors } from '@/lib/cors'
import { errorResponse, serverErrorResponse, successResponse, logApiRequest } from '@/app/api/api-utils'

/**
 * GET /api/company/my-projects?walletEns={walletEns}&walletAddress={walletAddress}
 * 
 * Returns projects where the specified wallet is the owner.
 * Either walletEns or walletAddress is required.
 */
async function getCompanyProjects(req: NextRequest) {
  try {
    console.log('[GET /api/company/my-projects] Request received');
    logApiRequest('GET', '/api/company/my-projects', req.ip || 'unknown');
    
    // Get query parameters
    const url = new URL(req.url);
    const walletEns = url.searchParams.get('walletEns');
    const walletAddress = url.searchParams.get('walletAddress');
    
    console.log('Query parameters:', { walletEns, walletAddress });
    
    // Validate required parameters
    if (!walletEns && !walletAddress) {
      console.error('Missing required query parameters: walletEns or walletAddress');
      return errorResponse('Either walletEns or walletAddress is required', 400, undefined, req);
    }
    
    // Validate wallet address format if provided
    if (walletAddress && !walletAddress.match(/^0x[a-fA-F0-9]{40}$/)) {
      return errorResponse('Invalid wallet address format', 400, undefined, req);
    }

    // Query projects where the user is the owner
    type ProjectResult = typeof projectsTable.$inferSelect;
    let projects: ProjectResult[] = [];
    
    if (walletEns && walletAddress) {
      // If both are provided, search for either match
      projects = await db
        .select()
        .from(projectsTable)
        .where(
          eq(projectsTable.projectOwnerWalletEns, walletEns)
        )
        .unionAll(
          db
            .select()
            .from(projectsTable)
            .where(
              eq(projectsTable.projectOwnerWalletAddress, walletAddress)
            )
        );
    } else if (walletEns) {
      // Only ENS provided
      projects = await db
        .select()
        .from(projectsTable)
        .where(eq(projectsTable.projectOwnerWalletEns, walletEns));
    } else if (walletAddress) {
      // Only wallet address provided
      projects = await db
        .select()
        .from(projectsTable)
        .where(eq(projectsTable.projectOwnerWalletAddress, walletAddress));
    }
    
    return successResponse(projects, 'Projects retrieved successfully', 200, req);
  } catch (error) {
    console.error('Error fetching projects:', error);
    return serverErrorResponse(error, undefined, req);
  }
}

// Wrap all handlers with CORS middleware
export const GET = withCors(getCompanyProjects);
export const OPTIONS = withCors(async () => {
  return new Response(null, { status: 204 });
}); 