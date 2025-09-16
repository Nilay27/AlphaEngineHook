/**********************************************************************
 * File: /Users/sattu/Library/CloudStorage/Dropbox/blockchain/teachnook/api_for_fe/app/api/userProfile/route.ts
 **********************************************************************/
import { NextRequest, NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';

import { db } from '@/db/db';
import { companyTable } from '@/db/schema/company-schema';
import { freelancerTable } from '@/db/schema/freelancer-schema';
import { userBalancesTable } from '@/db/schema/user-balances-schema';
import { userSkillsTable } from '@/db/schema/user-skills-schema';
import { projectSubmissionsTable } from '@/db/schema/project-submissions-schema';

import {
  successResponse,
  errorResponse,
  serverErrorResponse,
  validateRequiredFields,
  logApiRequest,
} from '@/app/api/api-utils';

import { withCors } from '@/lib/cors';

/** 
 * Utility to format the final response for either freelancer or company,
 * matching the requested output structure.
 * This is used for both CREATE/UPDATE so that the response matches the 
 * "Successfully registered profile" schema exactly as requested.
 */
function formatProfileResponse(role: 'freelancer' | 'company', row: any) {
  if (role === 'freelancer') {
    return {
      id: row.id,
      walletEns: row.walletEns,
      walletAddress: row.walletAddress,
      freelancerName: row.freelancerName,
      skills: row.skills,
      profilePicUrl: row.profilePicUrl,
      githubProfileUsername: row.githubProfileUsername,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  } else {
    // role = company
    return {
      id: row.id,
      walletEns: row.walletEns,
      walletAddress: row.walletAddress,
      companyName: row.companyName,
      shortDescription: row.shortDescription,
      logoUrl: row.logoUrl,
      githubProfileUsername: row.githubProfileUsername,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }
}

/**
 * GET /api/userProfile?role=freelancer|company &walletAddress=... or &walletEns=...
 * Fetches a user profile (freelancer or company).
 */
async function getUserProfile(req: NextRequest) {
  try {
    logApiRequest('GET', '/api/userProfile', req.ip || 'unknown');
    
    const url = new URL(req.url);
    const role = (url.searchParams.get('role') || '').toLowerCase();
    const walletAddress = (url.searchParams.get('walletAddress') || '').toLowerCase().trim();
    const walletEns = (url.searchParams.get('walletEns') || '').toLowerCase().trim();

    if (!role || (role !== 'freelancer' && role !== 'company')) {
      return errorResponse(
        'Missing or invalid `role` query param (must be freelancer|company)',
        400
      );
    }
    if (!walletAddress && !walletEns) {
      return errorResponse(
        'Missing at least one of: `walletAddress` or `walletEns`',
        400
      );
    }

    let row: any = null;

    if (role === 'company') {
      // Try by walletEns first, else by walletAddress
      if (walletEns) {
        const [resByEns] = await db
          .select()
          .from(companyTable)
          .where(eq(companyTable.walletEns, walletEns))
          .limit(1);
        row = resByEns || null;
      }
      if (!row && walletAddress) {
        const [resByAddr] = await db
          .select()
          .from(companyTable)
          .where(eq(companyTable.walletAddress, walletAddress))
          .limit(1);
        row = resByAddr || null;
      }
    } else {
      // freelancer
      if (walletEns) {
        const [resFEns] = await db
          .select()
          .from(freelancerTable)
          .where(eq(freelancerTable.walletEns, walletEns))
          .limit(1);
        row = resFEns || null;
      }
      if (!row && walletAddress) {
        const [resFAddr] = await db
          .select()
          .from(freelancerTable)
          .where(eq(freelancerTable.walletAddress, walletAddress))
          .limit(1);
        row = resFAddr || null;
      }
    }

    if (!row) {
      return errorResponse(`${role} profile not found`, 404);
    }

    return successResponse(formatProfileResponse(role, row));
  } catch (error) {
    console.error('[GET /api/userProfile] error =>', error);
    return serverErrorResponse(error);
  }
}

/**
 * PUT /api/userProfile
 * Body:
 * {
 *   "role": "freelancer" | "company",
 *   "walletEns": "consentsam",
 *   "walletAddress": "0xa1a7efeb3841....",
 *   // FREELANCER fields
 *   "freelancerName": "...",
 *   "skills": "...",
 *   "profilePicUrl": "...",
 *   "githubProfileUsername": "...",
 *
 *   // COMPANY fields
 *   "companyName": "...",
 *   "shortDescription": "...",
 *   "logoUrl": "...",
 *   "githubProfileUsername": "...",
 * }
 *
 * Conditions/validations:
 * - role is required
 * - walletEns is required (since user wants it as "primary" for uniqueness)
 * - walletAddress is also required
 * - We'll first find the existing profile by walletEns. If not found => 404.
 * - Then update. Return the response in the exact "creation-like" format requested.
 */
async function updateUserProfile(req: NextRequest) {
  try {
    logApiRequest('PUT', '/api/userProfile', req.ip || 'unknown');

    const body = await req.json();

    // Validate required fields
    const v = validateRequiredFields(body, ['role', 'walletEns', 'walletAddress']);
    if (!v.isValid) {
      return errorResponse(
        `Missing required fields: ${v.missingFields.join(', ')}`,
        400
      );
    }

    const role = (body.role || '').toLowerCase().trim();
    if (role !== 'freelancer' && role !== 'company') {
      return errorResponse('Invalid role (must be freelancer or company)', 400);
    }

    const walletEns = (body.walletEns || '').toLowerCase().trim();
    const walletAddress = (body.walletAddress || '').toLowerCase().trim();

    // 1) find the existing row by walletEns
    let existing: any = null;

    if (role === 'freelancer') {
      const [found] = await db
        .select()
        .from(freelancerTable)
        .where(eq(freelancerTable.walletEns, walletEns))
        .limit(1);
      existing = found || null;

      if (!existing) {
        return errorResponse(
          `Freelancer profile not found by walletEns: ${walletEns}`,
          404
        );
      }

      // 2) Perform the update
      const updatedRows = await db
        .update(freelancerTable)
        .set({
          walletAddress,
          freelancerName:
            body.freelancerName !== undefined
              ? body.freelancerName
              : existing.freelancerName,
          skills:
            body.skills !== undefined ? body.skills : existing.skills,
          profilePicUrl:
            body.profilePicUrl !== undefined
              ? body.profilePicUrl
              : existing.profilePicUrl,
          githubProfileUsername:
            body.githubProfileUsername !== undefined
              ? body.githubProfileUsername
              : existing.githubProfileUsername,
          updatedAt: new Date(),
        })
        .where(eq(freelancerTable.id, existing.id))
        .returning();

      const updated = Array.isArray(updatedRows) && updatedRows.length > 0
        ? updatedRows[0]
        : existing;

      return NextResponse.json({
        isSuccess: true,
        message: 'Successfully updated profile',
        data: formatProfileResponse('freelancer', updated),
      }, { status: 200 });
    } else {
      // role=company
      const [found] = await db
        .select()
        .from(companyTable)
        .where(eq(companyTable.walletEns, walletEns))
        .limit(1);
      existing = found || null;

      if (!existing) {
        return errorResponse(
          `Company profile not found by walletEns: ${walletEns}`,
          404
        );
      }

      // update
      const updatedRows = await db
        .update(companyTable)
        .set({
          walletAddress,
          companyName:
            body.companyName !== undefined ? body.companyName : existing.companyName,
          shortDescription:
            body.shortDescription !== undefined ? body.shortDescription : existing.shortDescription,
          logoUrl:
            body.logoUrl !== undefined ? body.logoUrl : existing.logoUrl,
          githubProfileUsername:
            body.githubProfileUsername !== undefined
              ? body.githubProfileUsername
              : existing.githubProfileUsername,
          updatedAt: new Date(),
        })
        .where(eq(companyTable.id, existing.id))
        .returning();

      const updated = Array.isArray(updatedRows) && updatedRows.length > 0
        ? updatedRows[0]
        : existing;

      return NextResponse.json({
        isSuccess: true,
        message: 'Successfully updated profile',
        data: formatProfileResponse('company', updated),
      }, { status: 200 });
    }
  } catch (error) {
    console.error('[PUT /api/userProfile] error =>', error);
    return serverErrorResponse(error);
  }
}

/**
 * DELETE /api/userProfile
 * Body:
 * {
 *   "role": "freelancer" | "company",
 *   "walletAddress": "...",
 *   "walletEns": "..." (optional or required depending on your rules)
 * }
 *
 * Updated to ensure all user-related data is also removed:
 *  - For freelancers: remove all submissions, user balances, user_skills,
 *    and finally remove the freelancer row.
 *  - For companies: remove the user balances, and finally remove the company row.
 *  - Return the relevant info (walletAddress, walletEns, id) in the response data.
 */
async function deleteUserProfile(req: NextRequest) {
  try {
    logApiRequest('DELETE', '/api/userProfile', req.ip || 'unknown');

    const body = await req.json();
    const check = validateRequiredFields(body, ['role', 'walletAddress','walletEns']);
    if (!check.isValid) {
      return errorResponse(
        `Missing required fields: ${check.missingFields.join(', ')}`,
        400
      );
    }

    const role = (body.role || '').toLowerCase().trim();
    if (role !== 'freelancer' && role !== 'company') {
      return errorResponse('Invalid role (must be freelancer or company)', 400);
    }

    const walletAddress = (body.walletAddress || '').toLowerCase().trim();
    const walletEns = (body.walletEns || '').toLowerCase().trim();
    if (role === 'company') {
      // 1) find the company
      const [company] = await db
        .select()
        .from(companyTable)
        .where(eq(companyTable.walletEns, walletEns))
        .limit(1);

      if (!company) {
        return errorResponse('No matching company found', 404);
      }

      // 2) delete any balances for this company
      await db
        .delete(userBalancesTable)
        .where(eq(userBalancesTable.walletEns, walletEns));

      // (No submissions to delete for company, as companies typically do not submit.)

      // 3) finally, remove from company table
      await db
        .delete(companyTable)
        .where(eq(companyTable.walletEns, walletEns));

      return NextResponse.json(
        {
          isSuccess: true,
          message: 'Company profile deleted successfully',
          data: {
            walletAddress: company.walletAddress,
            walletEns: company.walletEns,
            Id: company.id,
          },
        },
        { status: 200 }
      );
    } else {
      // role=freelancer
      const [freelancer] = await db
        .select()
        .from(freelancerTable)
        .where(eq(freelancerTable.walletEns, walletEns))
        .limit(1);

      if (!freelancer) {
        return errorResponse('No matching freelancer found', 404);
      }

      // 1) Remove all submissions from projectSubmissionsTable for this freelancer
      await db
        .delete(projectSubmissionsTable)
        .where(eq(projectSubmissionsTable.freelancerWalletEns, walletEns));

      // 2) Remove user balances for this freelancer
      await db
        .delete(userBalancesTable)
        .where(eq(userBalancesTable.walletEns, walletEns));

      // 3) Remove user skills bridging records
      await db
        .delete(userSkillsTable)
        .where(eq(userSkillsTable.walletEns, walletEns));

      // 4) finally remove from the freelancer table
      await db
        .delete(freelancerTable)
        .where(eq(freelancerTable.walletEns, walletEns));

      return NextResponse.json(
        {
          isSuccess: true,
          message: 'Freelancer profile deleted successfully',
          data: {
            walletAddress: freelancer.walletAddress,
            walletEns: freelancer.walletEns,
            id: freelancer.id,
          },
        },
        { status: 200 }
      );
    }
  } catch (error) {
    console.error('[DELETE /api/userProfile] error =>', error);
    return serverErrorResponse(error);
  }
}

/**
 * OPTIONAL: POST /api/userProfile
 * If you need a body-based fetch approach. 
 */
async function postFetchUserProfile(req: NextRequest) {
  try {
    logApiRequest('POST', '/api/userProfile', req.ip || 'unknown');

    const body = await req.json();
    const v = validateRequiredFields(body, ['role']);
    if (!v.isValid) {
      return errorResponse(
        `Missing field(s): ${v.missingFields.join(', ')}`,
        400
      );
    }
    const role = body.role.toLowerCase();
    if (role !== 'freelancer' && role !== 'company') {
      return errorResponse('role must be either freelancer or company', 400);
    }
    const walletAddress = (body.walletAddress || '').toLowerCase().trim();
    const walletEns = (body.walletEns || '').toLowerCase().trim();

    if (!walletAddress && !walletEns) {
      return errorResponse(
        'Must provide at least one: `walletAddress` or `walletEns`',
        400
      );
    }

    // Just replicate the GET logic to find the row:
    let row: any = null;
    if (role === 'company') {
      if (walletEns) {
        const [cByEns] = await db
          .select()
          .from(companyTable)
          .where(eq(companyTable.walletEns, walletEns))
          .limit(1);
        row = cByEns || null;
      }
      if (!row && walletAddress) {
        const [cByAddr] = await db
          .select()
          .from(companyTable)
          .where(eq(companyTable.walletAddress, walletAddress))
          .limit(1);
        row = cByAddr || null;
      }
    } else {
      // freelancer
      if (walletEns) {
        const [fEns] = await db
          .select()
          .from(freelancerTable)
          .where(eq(freelancerTable.walletEns, walletEns))
          .limit(1);
        row = fEns || null;
      }
      if (!row && walletAddress) {
        const [fAddr] = await db
          .select()
          .from(freelancerTable)
          .where(eq(freelancerTable.walletAddress, walletAddress))
          .limit(1);
        row = fAddr || null;
      }
    }

    if (!row) {
      return errorResponse(`${role} profile not found`, 404);
    }

    return successResponse(formatProfileResponse(role, row));
  } catch (error) {
    console.error('[POST /api/userProfile/fetch] error =>', error);
    return serverErrorResponse(error);
  }
}

// Export route handlers, all wrapped with CORS
export const GET = withCors(getUserProfile);
export const PUT = withCors(updateUserProfile);
export const DELETE = withCors(deleteUserProfile);
export const POST = withCors(postFetchUserProfile);

export const OPTIONS = withCors(async () => new Response(null, { status: 204 }));