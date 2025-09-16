/**
 * @file app/api/company/dashboard/metrics/route.ts
 *
 * @description
 * Provides an API endpoint to fetch "company" dashboard metrics, either via GET
 * query parameters or POST JSON body. We treat `walletEns` as the primary key
 * for the company. If no matching row by `walletEns` is found, we fallback to
 * matching by `walletAddress`.
 *
 * Example requests:
 *   -- GET --
 *   GET /api/company/dashboard/metrics?walletEns=someEns&walletAddress=0xABC
 *
 *   -- POST --
 *   POST /api/company/dashboard/metrics
 *   {
 *     "role": "company",
 *     "walletEns": "someEns",
 *     "walletAddress": "0xABC",
 *     "timeframe": "24h"
 *   }
 *
 * Return shape (example):
 * {
 *   "isSuccess": true,
 *   "totalSubmissions": number,
 *   "approvedSubmissions": number,
 *   "rejectedSubmissions": number,
 *   "totalProjects": number,
 *   "activeProjects": number,
 *   "closedProjects": number,
 *   "pullRequests": {
 *     "timeFrame": "24h",
 *     "count": number,
 *     "growthPercent": number
 *   },
 *   "statsUpdatedAt": string
 * }
 */

import { NextRequest, NextResponse } from 'next/server'
import { withCors } from '@/lib/cors'
import { db } from '@/db/db'
import { companyTable } from '@/db/schema/company-schema'
import { projectsTable } from '@/db/schema/projects-schema'
import { projectSubmissionsTable } from '@/db/schema/project-submissions-schema'
import { eq, sql } from 'drizzle-orm'

async function handleCompanyDashboardMetrics(req: NextRequest) {
  // Add request ID for correlation in logs
  const requestId = Math.random().toString(36).substring(2, 10);
  console.log(`[Company Metrics ${requestId}] Processing new request`);
  
  try {
    let walletEns = ''
    let walletAddress = ''
    let timeframe = '24h'

    // 1) parse from GET or POST
    if (req.method === 'GET') {
      const url = new URL(req.url)
      walletEns = (url.searchParams.get('walletEns') || '').trim().toLowerCase()
      walletAddress = (url.searchParams.get('walletAddress') || '').trim().toLowerCase()
      timeframe = (url.searchParams.get('timeframe') || '24h').toLowerCase().trim()
      console.log(`[Company Metrics ${requestId}] GET request with params:`, { walletEns, walletAddress, timeframe });
    } else {
      // POST
      try {
        const body = await req.json()
        console.log(`[Company Metrics ${requestId}] Received body:`, JSON.stringify(body))
        walletEns = (body.walletEns || '').trim().toLowerCase()
        walletAddress = (body.walletAddress || '').trim().toLowerCase()
        timeframe = (body.timeframe || '24h').toLowerCase().trim()
      } catch (parseError) {
        console.error(`[Company Metrics ${requestId}] Error parsing request body:`, parseError)
        return NextResponse.json({
          isSuccess: false,
          message: 'Invalid request body format'
        }, { status: 400 })
      }
    }

    console.log(`[Company Metrics ${requestId}] walletEns:`, walletEns, ' walletAddress:', walletAddress)

    // Check if either walletEns or walletAddress is provided
    if (!walletEns && !walletAddress) {
      return NextResponse.json({
        isSuccess: false,
        message: 'Either walletEns or walletAddress must be provided'
      }, { status: 400 })
    }

    // 2) Find the company by ENS first
    let companyRecord: any = null

    if (walletEns) {
      console.log(`[Company Metrics ${requestId}] Looking up company by ENS:`, walletEns);
      const [byEns] = await db
        .select()
        .from(companyTable)
        .where(eq(companyTable.walletEns, walletEns))
        .limit(1)
      if (byEns) {
        companyRecord = byEns
        console.log(`[Company Metrics ${requestId}] Found company by ENS`);
      }
    }

    // fallback if not found or empty
    if (!companyRecord && walletAddress) {
      console.log(`[Company Metrics ${requestId}] Looking up company by wallet address:`, walletAddress);
      const [byAddr] = await db
        .select()
        .from(companyTable)
        .where(eq(companyTable.walletAddress, walletAddress))
        .limit(1)
      if (byAddr) {
        companyRecord = byAddr
        console.log(`[Company Metrics ${requestId}] Found company by wallet address`);
      }
    }

    // If still no record => 404
    if (!companyRecord) {
      return NextResponse.json({
        isSuccess: false,
        message: `No company found for walletEns=${walletEns || ''} or walletAddress=${walletAddress || ''}`
      }, { status: 404 })
    }

    const finalWalletAddress = companyRecord.walletAddress.toLowerCase()
    const finalWalletEns = companyRecord.walletEns.toLowerCase()
    
    console.log(`[Company Metrics ${requestId}] Using wallet details from DB record:`, {
      finalWalletAddress,
      finalWalletEns
    })

    // 3) find all projects - use correct column names
    console.log(`[Company Metrics ${requestId}] Querying projects for company: ${finalWalletEns}`);
    const allProjects = await db
      .select()
      .from(projectsTable)
      .where(eq(projectsTable.projectOwnerWalletEns, finalWalletEns));

    console.log(`[Company Metrics ${requestId}] Found ${allProjects.length} projects`);

    const totalProjects = allProjects.length
    const closedProjects = allProjects.filter(p => p.projectStatus === 'closed').length
    const activeProjects = allProjects.filter(p => p.projectStatus === 'open').length

    if (totalProjects === 0) {
      // trivial
      console.log(`[Company Metrics ${requestId}] No projects found, returning empty metrics`);
      return NextResponse.json({
        isSuccess: true,
        totalSubmissions: 0,
        awardedSubmissions: 0,
        rejectedSubmissions: 0,
        totalProjects,
        activeProjects,
        closedProjects,
        pullRequests: {
          timeFrame: timeframe,
          count: 0,
          growthPercent: 0
        },
        statsUpdatedAt: new Date().toISOString()
      }, { status: 200 })
    }

    // 4) find all submissions for these projects - use safer query approach
    // Extract project IDs using the correct field name
    const projectIds = allProjects.map(p => p.projectId)
    console.log(`[Company Metrics ${requestId}] Querying submissions for ${projectIds.length} projects:`, projectIds);
    
    let allSubmissions: any[] = [];
    
    // Query each project's submissions separately to avoid ANY syntax issues
    for (const projectId of projectIds) {
      try {
        const projectSubmissions = await db
          .select()
          .from(projectSubmissionsTable)
          .where(eq(projectSubmissionsTable.projectId, projectId));
          
        allSubmissions = [...allSubmissions, ...projectSubmissions];
      } catch (subError) {
        console.error(`[Company Metrics ${requestId}] Error querying submissions for project ${projectId}:`, subError);
        // Continue with other projects
      }
    }
    
    console.log(`[Company Metrics ${requestId}] Found ${allSubmissions.length} total submissions`);

    const totalSubmissions = allSubmissions.length
    const awardedSubmissions = allSubmissions.filter(s => s.status === 'awarded').length
    const rejectedSubmissions = allSubmissions.filter(s => s.status === 'rejected').length

    // 5) timeframe logic: parse "24h" -> hours
    let hours = 24
    if (timeframe.endsWith('h')) {
      const val = parseInt(timeframe, 10)
      hours = isNaN(val) ? 24 : val
    } else if (timeframe.endsWith('d')) {
      const val = parseInt(timeframe, 10)
      hours = isNaN(val) ? 24 : val * 24
    }

    const now = new Date()
    const dateCutoff = new Date(now.getTime() - hours * 3600_000)
    const recentSubs = allSubmissions.filter(s => new Date(s.createdAt) > dateCutoff)

    // growth comparison: previous hours
    const prevPeriodStart = new Date(now.getTime() - 2 * hours * 3600_000)
    const prevPeriodEnd = dateCutoff
    const prevSubs = allSubmissions.filter(s => 
      new Date(s.createdAt) >= prevPeriodStart && new Date(s.createdAt) <= prevPeriodEnd
    )

    const pullRequestsCount = recentSubs.length
    let growthPercent = 0
    if (prevSubs.length > 0) {
      growthPercent = ((pullRequestsCount - prevSubs.length) / prevSubs.length) * 100
    }

    console.log(`[Company Metrics ${requestId}] Calculated metrics:`, {
      totalSubmissions,
      awardedSubmissions,
      rejectedSubmissions,
      pullRequestsCount,
      growthPercent
    });

    // 6) Return final JSON
    return NextResponse.json({
      isSuccess: true,
      totalSubmissions,
      awardedSubmissions,
      rejectedSubmissions,
      totalProjects,
      activeProjects,
      closedProjects,
      pullRequests: {
        timeFrame: timeframe,
        count: pullRequestsCount,
        growthPercent: Math.round(growthPercent)
      },
      statsUpdatedAt: new Date().toISOString()
    }, { status: 200 })
  } catch (error: any) {
    console.error(`[Company Metrics ${requestId}] Error:`, error)
    
    // Provide more detailed error information for debugging
    let errorMessage = 'Internal server error';
    let debugInfo: any = null;
    
    if (error.message && error.message.includes('syntax error')) {
      errorMessage = 'Database syntax error. This might be due to a mismatch between code and schema.';
      debugInfo = {
        message: error.message,
        stack: error.stack,
        hint: 'Check column names in SQL queries against your schema definitions.',
        requestId
      };
    } else if (error.code === '42P01') {
      errorMessage = 'Relation does not exist error. Table might be missing.';
      debugInfo = {
        message: error.message,
        details: error.detail || 'No additional details',
        requestId
      };
    } else {
      // Generic error handling
      debugInfo = {
        message: error.message || 'Unknown error',
        stack: error.stack,
        requestId
      };
    }
    
    return NextResponse.json({
      isSuccess: false,
      message: errorMessage,
      ...(debugInfo ? { debugInfo } : {})
    }, { status: 500 })
  }
}

export const GET = withCors(handleCompanyDashboardMetrics)
export const POST = withCors(handleCompanyDashboardMetrics)
export const OPTIONS = withCors(async () => new Response(null, { status: 204 }))