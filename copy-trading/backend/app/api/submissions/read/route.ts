/****************************************************************************************
 * File: /app/api/submissions/read/route.ts
 * Relative path: /Users/sattu/Library/CloudStorage/Dropbox/blockchain/teachnook/api_for_fe/app/api/submissions/read/route.ts
 *
 * GET  /api/submissions/read
 *    - Continues to support query: submissionId, projectId, freelancerAddress
 * POST /api/submissions/read
 *    - Enhanced to handle role=freelancer or role=company
 *    - If freelancer => fetch all that belong to them
 *    - If company => fetch all that belong to that company's projects
 *    - If projectId is provided => further filter to that single project
 ****************************************************************************************/

import { NextRequest } from 'next/server';
import { eq, and, desc, sql } from 'drizzle-orm';

import { db } from '@/db/db';
import { projectSubmissionsTable } from '@/db/schema/project-submissions-schema';
import { freelancerTable } from '@/db/schema/freelancer-schema';
import { companyTable } from '@/db/schema/company-schema';
import { projectsTable } from '@/db/schema/projects-schema';

import {
  successResponse,
  errorResponse,
  serverErrorResponse,
  logApiRequest,
} from '@/app/api/api-utils';
import { withCors } from '@/lib/cors';

/**
 * GET /api/submissions/read
 * 
 * Query parameters:
 * - submissionId: string => if present, return that single submission
 * - projectId: string => if present, filter by that project
 * - freelancerAddress: string => if present, filter by that freelancer
 */
async function getSubmissions(req: NextRequest) {
  try {
    logApiRequest('GET', '/api/submissions/read', req.ip || 'unknown');

    const { searchParams } = new URL(req.url);
    const submissionId = searchParams.get('submissionId') || '';
    const projectId = searchParams.get('projectId') || '';
    const freelancerAddress = searchParams.get('freelancerAddress') || '';

    // 1) If user provides a "submissionId," return exactly that submission
    if (submissionId) {
      const [singleSub] = await db
        .select()
        .from(projectSubmissionsTable)
        .where(eq(projectSubmissionsTable.submissionId, submissionId))
        .limit(1);

      if (!singleSub) {
        return errorResponse('Submission not found', 404);
      }

      return successResponse(singleSub);
    }

    // 2) If user provides projectId or freelancerAddress, filter accordingly
    if (projectId || freelancerAddress) {
      const conditions: any[] = [];

      if (projectId) {
        conditions.push(eq(projectSubmissionsTable.projectId, projectId));
      }

      if (freelancerAddress) {
        conditions.push(
          eq(projectSubmissionsTable.freelancerAddress, freelancerAddress.toLowerCase())
        );
      }

      const filteredSubs = await db
        .select()
        .from(projectSubmissionsTable)
        .where(and(...conditions))
        .orderBy(desc(projectSubmissionsTable.createdAt));

      return successResponse(filteredSubs);
    }

    // 3) Otherwise, return all (with a limit of 50)
    const allSubs = await db
      .select()
      .from(projectSubmissionsTable)
      .orderBy(desc(projectSubmissionsTable.createdAt))
      .limit(50);

    return successResponse(allSubs);
  } catch (error) {
    console.error('[GET /api/submissions/read] =>', error);
    return serverErrorResponse(error);
  }
}

/**
 * POST /api/submissions/read
 * Body can contain:
 * {
 *   "role": "freelancer" | "company",
 *   "walletEns": "string",       // mandatory
 *   "walletAddress": "string",   // mandatory
 *   "projectId": "uuid"          // optional
 * }
 *
 * Logic:
 * If role=freelancer => Return all submissions by that freelancer's walletAddress.
 *    If projectId is provided => filter to that project only.
 *
 * If role=company => Return all submissions for the projects owned by that company (via walletEns or walletAddress).
 *    If projectId is provided => only submissions for that single project (still must be owned by the company).
 */
async function getSubmissionsPost(req: NextRequest) {
  try {
    logApiRequest('POST', '/api/submissions/read', req.ip || 'unknown');

    const body = await req.json().catch(() => ({}));

    // Destructuring the request body to extract the role, walletEns, walletAddress, and projectId.
    // If walletEns, walletAddress, or projectId are not provided in the body, they default to empty strings.
    const { role, walletEns = '', walletAddress = '', projectId = '' } = body;
    console.log('role inside getSubmissionsPost =>', role)
    console.log('walletEns inside getSubmissionsPost =>', walletEns)
    console.log('walletAddress inside getSubmissionsPost =>', walletAddress)
    console.log('projectId inside getSubmissionsPost =>', projectId)
    // Basic checks
    if (!role || (role !== 'freelancer' && role !== 'company')) {
      return errorResponse('Missing or invalid role (must be freelancer|company)', 400);
    }
    if (!walletEns || !walletAddress) {
      return errorResponse('Must provide both walletEns and walletAddress', 400);
    }

    if (role === 'freelancer') {
      // 1) find the freelancer by walletEns if possible
      const lowerEns = walletEns.trim().toLowerCase();
      let freelancerRow: any = null;

      const [foundByEns] = await db
        .select()
        .from(freelancerTable)
        .where(eq(freelancerTable.walletEns, lowerEns))
        .limit(1);
      freelancerRow = foundByEns || null;

      if (!freelancerRow) {
        // fallback: check walletAddress
        const lowerAddr = walletAddress.toLowerCase();
        const [foundByAddr] = await db
          .select()
          .from(freelancerTable)
          .where(eq(freelancerTable.walletAddress, lowerAddr))
          .limit(1);

        freelancerRow = foundByAddr || null;
      }

      if (!freelancerRow) {
        return errorResponse(`Freelancer profile not found for ENS=${walletEns}`, 404);
      }

      const finalFreelancerAddr = freelancerRow.walletAddress.toLowerCase();

      // 2) Build conditions
      const conditions: any[] = [eq(projectSubmissionsTable.freelancerWalletAddress, finalFreelancerAddr)];
      if (projectId) {
        conditions.push(eq(projectSubmissionsTable.projectId, projectId));
      }

      // 3) Query submissions
      const subs = await db
        .select()
        .from(projectSubmissionsTable)
        .where(and(...conditions))
        .orderBy(desc(projectSubmissionsTable.createdAt));

      return successResponse(subs);
    } else {
      // role=company
      // 1) find company by walletEns
      const lowerEns = walletEns.trim().toLowerCase();
      let companyRow: any = null;

      const [foundByEns] = await db
        .select()
        .from(companyTable)
        .where(eq(companyTable.walletEns, lowerEns))
        .limit(1);
      companyRow = foundByEns || null;

      console.log('companyRow inside getSubmissionsPost =>', companyRow)
      if (!companyRow) {
        // fallback: check walletAddress
        const lowerAddr = walletAddress.toLowerCase();
        const [foundByAddr] = await db
          .select()
          .from(companyTable)
          .where(eq(companyTable.walletAddress, lowerAddr))
          .limit(1);

        companyRow = foundByAddr || null;
      }

      if (!companyRow) {
        return errorResponse(`Company profile not found for ENS=${walletEns}`, 404);
      }

      // 2) find all projects owned by that company
      const finalCompanyWalletEns = companyRow.walletEns.toLowerCase();
      console.log('finalCompanyWalletEns inside getSubmissionsPost =>', finalCompanyWalletEns)
      // If projectId is provided, we'll confirm that project is owned by this company
      if (projectId) {
        // 2a) find that specific project and check ownership
        const [proj] = await db
          .select()
          .from(projectsTable)
          .where(eq(projectsTable.projectId, projectId))
          .limit(1);

        if (!proj) {
          return errorResponse(`Project not found: ${projectId}`, 404);
        }
        if (proj.projectOwnerWalletEns.toLowerCase() !== finalCompanyWalletEns) {
          return errorResponse(
            `Project ${projectId} is not owned by this company (walletEns=${walletEns})`,
            403
          );
        }

        // 2b) fetch submissions for that single project
        const subs = await db
          .select()
          .from(projectSubmissionsTable)
          .where(eq(projectSubmissionsTable.projectId, projectId))
          .orderBy(desc(projectSubmissionsTable.createdAt));

        return successResponse(subs);
      } else {
        // No single projectId => get all projects for this owner, then all submissions for those
        const ownedProjects = await db
          .select({
            projectId: projectsTable.projectId
          })
          .from(projectsTable)
          .where(eq(projectsTable.projectOwnerWalletEns, finalCompanyWalletEns));

        if (ownedProjects.length === 0) {
          // no projects => no submissions
          return successResponse([]);
        }

        const projectIds = ownedProjects.map(p => p.projectId);
        
        if (projectIds.length === 0) {
          // no projects => no submissions
          return successResponse([]);
        }

        // Query approach that works with basic Drizzle functionality
        let allSubmissions: any[] = [];
        
        // Process each project individually and combine results
        for (const pid of projectIds) {
          const projectSubs = await db
            .select()
            .from(projectSubmissionsTable)
            .where(eq(projectSubmissionsTable.projectId, pid))
            .orderBy(desc(projectSubmissionsTable.createdAt));
            
          allSubmissions = [...allSubmissions, ...projectSubs];
        }
        
        // Sort all submissions by creation date
        allSubmissions.sort((a, b) => {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });
        
        return successResponse(allSubmissions);
      }
    }
  } catch (error) {
    console.error('[POST /api/submissions/read] =>', error);
    return serverErrorResponse(error);
  }
}

// Export with CORS
export const GET = withCors(getSubmissions);
export const POST = withCors(getSubmissionsPost);
export const OPTIONS = withCors(async () => new Response(null, { status: 204 }));