/**
 * File: /app/api/freelancer/earnings/route.ts
 * 
 * POST or GET body:
 * {
 *   "role": "freelancer",
 *   "walletAddress": "...",
 *   "walletEns": "consentsam"
 * }
 *
 * Return:
 * {
 *   "totalEarnings": number,
 *   "currency": "EDU",
 *   "growthPercent": 5,
 *   "earningsHistory": [
 *     {
 *       "projectId": string,
 *       "projectTitle": string,
 *       "amountEarned": number,
 *       "payoutDate": string
 *     },
 *     ...
 *   ]
 * }
 */
import { NextRequest, NextResponse } from 'next/server'
import { withCors } from '@/lib/cors'
import { db } from '@/db/db'
import { freelancerTable } from '@/db/schema/freelancer-schema'
import { projectSubmissionsTable } from '@/db/schema/project-submissions-schema'
import { projectsTable } from '@/db/schema/projects-schema'
import { eq, and, sql } from 'drizzle-orm'

async function handleFreelancerEarnings(req: NextRequest) {
  // Add request ID for correlation in logs
  const requestId = Math.random().toString(36).substring(2, 10);
  console.log(`[Freelancer Earnings ${requestId}] Processing new request`);
  
  try {
    let walletEns = ''
    let walletAddress = ''

    if (req.method === 'GET') {
      const url = new URL(req.url)
      walletEns = (url.searchParams.get('walletEns') || '').toLowerCase().trim()
      walletAddress = (url.searchParams.get('walletAddress') || '').toLowerCase().trim()
      console.log(`[Freelancer Earnings ${requestId}] GET request with params:`, { walletEns, walletAddress });
    } else {
      try {
        const body = await req.json()
        console.log(`[Freelancer Earnings ${requestId}] Received body:`, JSON.stringify(body))
        walletEns = (body.walletEns || '').toLowerCase().trim()
        walletAddress = (body.walletAddress || '').toLowerCase().trim()
      } catch (parseError) {
        console.error(`[Freelancer Earnings ${requestId}] Error parsing request body:`, parseError)
        return NextResponse.json({
          isSuccess: false,
          message: 'Invalid request body format'
        }, { status: 400 })
      }
    }

    console.log(`[Freelancer Earnings ${requestId}] walletEns:`, walletEns, ' walletAddress:', walletAddress)

    // Check if either walletEns or walletAddress is provided
    if (!walletEns && !walletAddress) {
      return NextResponse.json({
        isSuccess: false,
        message: 'Either walletEns or walletAddress must be provided'
      }, { status: 400 })
    }

    // find freelancer
    console.log(`[Freelancer Earnings ${requestId}] Looking up freelancer by ENS:`, walletEns);
    let freelancer: any = null;
    
    if (walletEns) {
      const [foundByEns] = await db
        .select()
        .from(freelancerTable)
        .where(eq(freelancerTable.walletEns, walletEns))
        .limit(1);
      
      if (foundByEns) {
        freelancer = foundByEns;
        console.log(`[Freelancer Earnings ${requestId}] Found freelancer by ENS`);
      }
    }
    
    // If not found by ENS, try wallet address
    if (!freelancer && walletAddress) {
      console.log(`[Freelancer Earnings ${requestId}] Looking up freelancer by wallet address:`, walletAddress);
      const [foundByAddr] = await db
        .select()
        .from(freelancerTable)
        .where(eq(freelancerTable.walletAddress, walletAddress))
        .limit(1);
        
      if (foundByAddr) {
        freelancer = foundByAddr;
        console.log(`[Freelancer Earnings ${requestId}] Found freelancer by wallet address`);
      }
    }

    if (!freelancer) {
      return NextResponse.json({
        isSuccess: false,
        message: `Freelancer not found for walletEns=${walletEns} or walletAddress=${walletAddress}`
      }, { status: 404 })
    }

    const finalWalletAddress = freelancer.walletAddress.toLowerCase()
    const finalWalletEns = freelancer.walletEns.toLowerCase()
    
    console.log(`[Freelancer Earnings ${requestId}] Using wallet details from DB record:`, {
      finalWalletAddress,
      finalWalletEns
    });

    // fetch all submissions with status='approved'
    console.log(`[Freelancer Earnings ${requestId}] Querying approved submissions`);
    
    // Query using the correct column name
    const subs = await db
      .select()
      .from(projectSubmissionsTable)
      .where(
        and(
          eq(projectSubmissionsTable.freelancerWalletAddress, finalWalletAddress),
          eq(projectSubmissionsTable.status, 'approved')
        )
      );
    
    console.log(`[Freelancer Earnings ${requestId}] Found ${subs.length} approved submissions`);

    if (subs.length === 0) {
      // no approved submissions => zero
      console.log(`[Freelancer Earnings ${requestId}] No approved submissions, returning zero earnings`);
      return NextResponse.json({
        totalEarnings: 0,
        currency: 'EDU',
        growthPercent: 0,
        earningsHistory: []
      }, { status: 200 })
    }

    // get relevant projects - extract using the right field names
    const uniqueProjectIds = [...new Set(subs.map(s => s.projectId))];
    console.log(`[Freelancer Earnings ${requestId}] Querying ${uniqueProjectIds.length} unique projects:`, uniqueProjectIds);
    
    // Safer approach: query each project individually
    const projectsData: any[] = [];
    
    for (const projectId of uniqueProjectIds) {
      try {
        const projectResult = await db
          .select()
          .from(projectsTable)
          .where(eq(projectsTable.projectId, projectId));
          
        projectsData.push(...projectResult);
      } catch (projError) {
        console.error(`[Freelancer Earnings ${requestId}] Error querying project ${projectId}:`, projError);
        // Continue with other projects
      }
    }
    
    console.log(`[Freelancer Earnings ${requestId}] Found ${projectsData.length} projects`);

    // build a quick map: projectId => project
    const projectMap = new Map<string, any>();
    projectsData.forEach(p => projectMap.set(p.projectId, p));

    // Build an earningsHistory array
    console.log(`[Freelancer Earnings ${requestId}] Building earnings history`);
    const earningsHistory = subs.map(s => {
      const proj = projectMap.get(s.projectId);
      let amountEarned = 0;
      
      if (proj && proj.prizeAmount) {
        try {
          amountEarned = parseFloat(proj.prizeAmount.toString()) || 0;
        } catch (parseError) {
          console.error(`[Freelancer Earnings ${requestId}] Error parsing prize amount:`, parseError);
        }
      }
      
      return {
        projectId: s.projectId,
        projectTitle: proj ? proj.projectName : '',
        amountEarned,
        payoutDate: s.updatedAt ? new Date(s.updatedAt).toISOString() : new Date().toISOString()
      }
    });

    // totalEarnings => sum of all the amounts from each project
    let totalEarnings = 0;
    earningsHistory.forEach(e => { totalEarnings += e.amountEarned });
    
    console.log(`[Freelancer Earnings ${requestId}] Calculated total earnings: ${totalEarnings}`);

    // growthPercent => if you do not have a transaction log or date-based approach, do a naive approach:
    const growthPercent = 5;

    const responseData = {
      isSuccess: true,
      totalEarnings,
      currency: 'EDU',
      growthPercent,
      earningsHistory
    };

    return NextResponse.json(responseData, { status: 200 });
  } catch (error: any) {
    console.error(`[Freelancer Earnings ${requestId}] Error:`, error);
    
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
    }, { status: 500 });
  }
}

export const GET = withCors(handleFreelancerEarnings)
export const POST = withCors(handleFreelancerEarnings)
export const OPTIONS = withCors(async () => new Response(null, { status: 204 }))