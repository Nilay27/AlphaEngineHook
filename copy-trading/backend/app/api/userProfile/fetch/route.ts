import { NextRequest, NextResponse } from 'next/server'
import { eq } from 'drizzle-orm'

import { db } from '@/db/db'
import { companyTable, Company } from '@/db/schema/company-schema'
import { freelancerTable, Freelancer } from '@/db/schema/freelancer-schema'

import {
  successResponse,
  errorResponse,
  serverErrorResponse,
  validateRequiredFields,
  logApiRequest
} from '@/app/api/api-utils'

import { withCors } from '@/lib/cors'

async function fetchUserProfile(req: NextRequest) {
  try {
    logApiRequest('POST', '/api/userProfile/fetch', req.ip || 'unknown')

    const body = await req.json()
    // We do minimal validation – must have role
    const v = validateRequiredFields(body, ['role'])
    if (!v.isValid) {
      return errorResponse(`Missing field(s): ${v.missingFields.join(', ')}`, 400, undefined, req)
    }
    if (body.role !== 'freelancer' && body.role !== 'company') {
      return errorResponse('role must be either freelancer or company', 400, undefined, req)
    }

    const role = body.role.toLowerCase()
    const walletAddress = (body.walletAddress || '').toLowerCase().trim()
    const walletEns = (body.walletEns || '').toLowerCase().trim()
    console.log('[POST /api/userProfile/fetch] walletAddress =>', walletAddress)
    console.log('[POST /api/userProfile/fetch] walletEns =>', walletEns)
    console.log('[POST /api/userProfile/fetch] role =>', role)

    if (!walletAddress && !walletEns) {
      return errorResponse('Must provide at least one: `walletAddress` or `walletEns`', 400, undefined, req)
    }

    // Fetch from DB
    const profile = await fetchProfileFromDb(role, walletAddress, walletEns)
    console.log('[POST /api/userProfile/fetch] profile =>', profile)
    // Return a successful response whether the profile was found or not
    if (!profile) {
      return successResponse({ found: false, role: role }, `${role} profile not found`, 200, req)
    }

    // Return final shape
    const formatted = formatProfileData(profile, role)
    return successResponse({ found: true, role: role, profile: formatted }, undefined, 200, req)
  } catch (error) {
    console.error('[POST /api/userProfile/fetch] error =>', error)
    return serverErrorResponse(error, undefined, req)
  }
}

// Helper function: fetch profile from DB
async function fetchProfileFromDb(
  role: string,
  walletAddress: string,
  walletEns: string
) {
  // Decide which table
  if (role === 'company') {
    // Attempt walletAddress first
    let company: Company | null = null
    if (walletAddress) {
      const [c] = await db.select().from(companyTable)
        .where(eq(companyTable.walletAddress, walletAddress)).limit(1)
      company = c || null
    }
    // If not found, try walletEns
    if (!company && walletEns) {
      const [c2] = await db.select().from(companyTable)
        .where(eq(companyTable.walletEns, walletEns)).limit(1)
      company = c2 || null
    }
    return company
  } else {
    // role = freelancer
    let freelancer: Freelancer | null = null
    if (walletAddress) {
      const [f] = await db.select().from(freelancerTable)
        .where(eq(freelancerTable.walletAddress, walletAddress)).limit(1)
      freelancer = f || null
    }
    if (!freelancer && walletEns) {
      const [f2] = await db.select().from(freelancerTable)
        .where(eq(freelancerTable.walletEns, walletEns)).limit(1)
      freelancer = f2 || null
    }
    return freelancer
  }
}

// Helper function: formatProfileData
function formatProfileData(row: any, role: string) {
  if (!row) return {}
  
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
    }
  } else {
    // company
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
    }
  }
}

// Export POST handler with CORS middleware
export const POST = withCors(fetchUserProfile, {
  maxAge: 86400, // 24 hours
  allowedMethods: ['POST', 'OPTIONS', 'GET'],
  allowCredentials: true
});

// Handle OPTIONS for CORS preflight
export const OPTIONS = withCors(async (req: NextRequest) => {
  return new Response(null, { status: 204 });
}, {
  maxAge: 86400, // 24 hours
  allowedMethods: ['POST', 'OPTIONS', 'GET'],
  allowCredentials: true
}); 