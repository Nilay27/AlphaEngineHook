/**
 * @file app/api/freelancer/dashboard/metrics/route.ts
 *
 * @description
 * Provides an API endpoint to fetch "freelancer" dashboard metrics, either via GET
 * query parameters or POST JSON body. We treat `walletEns` as the primary key
 * for the freelancer. If not found by `walletEns`, we fallback to `walletAddress`.
 *
 * Example requests:
 *   -- GET --
 *   GET /api/freelancer/dashboard/metrics?walletEns=someEns&walletAddress=0xABC
 *
 *   -- POST --
 *   POST /api/freelancer/dashboard/metrics
 *   {
 *     "role": "freelancer",
 *     "walletEns": "someEns",
 *     "walletAddress": "0xABC"
 *   }
 *
 * Return shape (example):
 * {
 *    "isSuccess": true,
 *    "totalSubmissions": number,
 *    "approvedSubmissions": number,
 *    "rejectedSubmissions": number,
 *    "activeProjects": number,
 *    "completedProjects": number,
 *    "earnings": {
 *      "amount": number,
 *      "currency": "EDU",
 *      "growthPercent": number
 *    },
 *    "statsUpdatedAt": string
 * }
 */

import { NextRequest, NextResponse } from 'next/server'
import { withCors } from '@/lib/cors'
import { db } from '@/db/db'
import { freelancerTable } from '@/db/schema/freelancer-schema'
import { projectSubmissionsTable } from '@/db/schema/project-submissions-schema'
import { projectsTable } from '@/db/schema/projects-schema'
import { userBalancesTable } from '@/db/schema/user-balances-schema'
import { eq, sql, and } from 'drizzle-orm'

async function handleFreelancerMetrics(req: NextRequest) {
  // Add request ID for correlation in logs
  const requestId = Math.random().toString(36).substring(2, 10);
  console.log(`[Freelancer Metrics ${requestId}] Processing new request`);
  
  try {
    let walletEns = ''
    let walletAddress = ''

    // 1) Parse from GET or POST
    if (req.method === 'GET') {
      const url = new URL(req.url)
      walletEns = (url.searchParams.get('walletEns') || '').trim().toLowerCase()
      walletAddress = (url.searchParams.get('walletAddress') || '').trim().toLowerCase()
      console.log(`[Freelancer Metrics ${requestId}] GET request with params:`, { walletEns, walletAddress });
    } else {
      // POST
      try {
        const body = await req.json()
        console.log(`[Freelancer Metrics ${requestId}] Received body:`, JSON.stringify(body))
        walletEns = (body.walletEns || '').trim().toLowerCase()
        walletAddress = (body.walletAddress || '').trim().toLowerCase()
      } catch (parseError) {
        console.error(`[Freelancer Metrics ${requestId}] Error parsing request body:`, parseError)
        return NextResponse.json({
          isSuccess: false,
          message: 'Invalid request body format'
        }, { status: 400 })
      }
    }

    // If you see this logs empty, check what's actually being passed
    console.log(`[Freelancer Metrics ${requestId}] walletEns:`, walletEns, ' walletAddress:', walletAddress)

    // Check if either walletEns or walletAddress is provided
    if (!walletEns && !walletAddress) {
      return NextResponse.json({
        isSuccess: false,
        message: 'Either walletEns or walletAddress must be provided'
      }, { status: 400 })
    }

    // 2) Attempt to find the freelancer row (ENS first, fallback to address)
    let freelancerRecord: any = null

    if (walletEns) {
      console.log(`[Freelancer Metrics ${requestId}] Looking up freelancer by ENS:`, walletEns);
      const [byEns] = await db
        .select()
        .from(freelancerTable)
        .where(eq(freelancerTable.walletEns, walletEns))
        .limit(1)
      freelancerRecord = byEns || null
      if (freelancerRecord) {
        console.log(`[Freelancer Metrics ${requestId}] Found freelancer by ENS`);
      }
    }

    if (!freelancerRecord && walletAddress) {
      console.log(`[Freelancer Metrics ${requestId}] Looking up freelancer by wallet address:`, walletAddress);
      const [byAddr] = await db
        .select()
        .from(freelancerTable)
        .where(eq(freelancerTable.walletAddress, walletAddress))
        .limit(1)
      if (byAddr) {
        freelancerRecord = byAddr
        console.log(`[Freelancer Metrics ${requestId}] Found freelancer by wallet address`);
      }
    }

    // If still none found => 404
    if (!freelancerRecord) {
      return NextResponse.json({
        isSuccess: false,
        message: `No freelancer found for walletEns=${walletEns || ''} or walletAddress=${walletAddress || ''}`
      }, { status: 404 })
    }

    // 3) final wallet address from DB row (since the DB row might differ from the request)
    const finalWalletAddress = freelancerRecord.walletAddress.toLowerCase()
    const finalWalletEns = freelancerRecord.walletEns.toLowerCase()
    
    console.log(`[Freelancer Metrics ${requestId}] Using wallet details from DB record:`, {
      finalWalletAddress,
      finalWalletEns
    })

    // 4) Submissions: query with proper columns
    // Use a more flexible query structure that checks either ENS or address
    let submissionsConditions: any[] = [];
    
    // Add conditions for both ENS and address, connected with OR logic
    if (finalWalletEns) {
      submissionsConditions.push(
        eq(projectSubmissionsTable.freelancerWalletEns, finalWalletEns)
      );
    }
    
    if (finalWalletAddress) {
      submissionsConditions.push(
        eq(projectSubmissionsTable.freelancerWalletAddress, finalWalletAddress)
      );
    }
    
    // If no conditions could be built, return empty metrics
    if (submissionsConditions.length === 0) {
      console.log(`[Freelancer Metrics ${requestId}] No conditions could be built, returning empty metrics`);
      return NextResponse.json({
        isSuccess: true,
        totalSubmissions: 0,
        approvedSubmissions: 0,
        rejectedSubmissions: 0,
        activeProjects: 0, 
        completedProjects: 0,
        earnings: {
          amount: 0,
          currency: "EDU",
          growthPercent: 0
        },
        statsUpdatedAt: new Date().toISOString()
      });
    }
    
    console.log(`[Freelancer Metrics ${requestId}] Running submissions query with conditions for:`, 
      submissionsConditions.length === 2 ? 'both ENS and address' : 'single identifier')
    
    // We want submissions where EITHER the ENS OR the address matches
    let allSubs: any[] = [];
    
    // Query for each condition separately to avoid SQL syntax complexity
    for (const condition of submissionsConditions) {
      const subs = await db
        .select()
        .from(projectSubmissionsTable)
        .where(condition);
        
      allSubs = [...allSubs, ...subs];
    }
    
    // Remove duplicates if any
    const subIds = new Set();
    allSubs = allSubs.filter(sub => {
      if (subIds.has(sub.submissionId)) return false;
      subIds.add(sub.submissionId);
      return true;
    });
    
    console.log(`[Freelancer Metrics ${requestId}] Found ${allSubs.length} total submissions`)

    const totalSubmissions = allSubs.length
    const approvedSubmissions = allSubs.filter(s => s.status === 'awarded').length
    const rejectedSubmissions = allSubs.filter(s => s.status === 'rejected').length

    // 5) Distinct project IDs from those submissions
    const projectIds = [...new Set(allSubs.map(s => s.projectId))]
    let activeProjects = 0
    let completedProjects = 0

    if (projectIds.length > 0) {
      console.log(`[Freelancer Metrics ${requestId}] Found ${projectIds.length} distinct project IDs:`, projectIds);
      
      try {
        // Safer approach: query projects one by one instead of using ANY
        let projectRows: any[] = [];
        
        for (const pid of projectIds) {
          console.log(`[Freelancer Metrics ${requestId}] Querying project:`, pid);
          try {
            const projResult = await db
              .select()
              .from(projectsTable)
              .where(eq(projectsTable.projectId, pid));
              
            projectRows = [...projectRows, ...projResult];
          } catch (projectQueryError) {
            console.error(`[Freelancer Metrics ${requestId}] Error querying project ${pid}:`, projectQueryError);
            // Continue with other projects
          }
        }
        
        console.log(`[Freelancer Metrics ${requestId}] Found ${projectRows.length} matching projects`);

        for (const proj of projectRows) {
          // gather submissions for this project
          const subsForProj = allSubs.filter(s => s.projectId === proj.projectId)
          // if any submission has status='approved' => that project is "completed"
          if (subsForProj.some(s => s.status === 'approved')) {
            completedProjects++
          } else {
            // if there's at least one 'pending' and project is not closed => "active"
            const hasPending = subsForProj.some(s => s.status === 'pending')
            const isProjectOpen = (proj.projectStatus !== 'closed')
            if (hasPending && isProjectOpen) {
              activeProjects++
            }
          }
        }
      } catch (projectQueryError: any) {
        console.error(`[Freelancer Metrics ${requestId}] Error querying projects:`, projectQueryError);
        throw projectQueryError; // Let the main error handler catch this
      }
    }

    // 6) total earnings from userBalancesTable
    let totalEarningsFromBalance = 0
    
    try {
      console.log(`[Freelancer Metrics ${requestId}] Querying user balances with wallet address:`, finalWalletAddress);
      
      // Use a simpler approach to avoid potential SQL issues
      const balanceRows = await db
        .select()
        .from(userBalancesTable);
        
      console.log(`[Freelancer Metrics ${requestId}] Found ${balanceRows.length} total balance records`);
      
      // Filter manually to find the matching record
      const matchingBalances = balanceRows.filter(row => 
        row.userId && row.userId.toLowerCase() === finalWalletAddress.toLowerCase()
      );
      
      if (matchingBalances.length > 0) {
        console.log(`[Freelancer Metrics ${requestId}] Found matching balance record:`, matchingBalances[0]);
        totalEarningsFromBalance = parseFloat(matchingBalances[0].balance?.toString() || '0') || 0;
      } else {
        console.log(`[Freelancer Metrics ${requestId}] No matching balance record found for address:`, finalWalletAddress);
      }
    } catch (balanceError) {
      console.error(`[Freelancer Metrics ${requestId}] Error fetching user balance:`, balanceError);
      // Continue execution despite balance error
      // This way we can still return other metrics
    }

    // 7) Growth percent is a placeholder
    const growthPercent = 5

    // 8) Return final JSON
    return NextResponse.json({
      isSuccess: true,
      totalSubmissions,
      approvedSubmissions,
      rejectedSubmissions,
      activeProjects,
      completedProjects,
      earnings: {
        amount: totalEarningsFromBalance,
        currency: 'EDU',
        growthPercent
      },
      statsUpdatedAt: new Date().toISOString()
    }, { status: 200 })

  } catch (error: any) {
    console.error(`[Freelancer Metrics ${requestId}] Unhandled error:`, error)
    return NextResponse.json({
      isSuccess: false,
      message: error.message || 'Internal server error'
    }, { status: 500 })
  }
}

export const POST = withCors(handleFreelancerMetrics)
export const GET = withCors(handleFreelancerMetrics)

// For CORS preflight
export const OPTIONS = withCors(async () => {
  return new Response(null, { status: 204 })
})