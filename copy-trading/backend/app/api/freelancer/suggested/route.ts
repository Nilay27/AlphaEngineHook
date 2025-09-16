/**
 * File: /app/api/freelancer/suggested/route.ts
 * 
 * This endpoint returns suggested projects for a freelancer.
 * Currently, it returns random projects, but will be replaced with
 * AI-based suggestions in the future.
 *
 * GET /api/freelancer/suggested?walletEns={userEns}
 * 
 * Response:
 * {
 *   "isSuccess": true,
 *   "data": [
 *     {project1},
 *     {project2},
 *     ...
 *   ]
 * }
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db/db';
import { projectsTable } from '@/db/schema/projects-schema';
import { freelancerTable } from '@/db/schema/freelancer-schema';
import { eq, and, sql } from 'drizzle-orm';
import { withCors } from '@/lib/cors';

// Number of random projects to return
const MAX_SUGGESTED_PROJECTS = 5;

// GET - Get suggested projects for a freelancer
async function getSuggestedProjects(req: NextRequest) {
  // Add request ID for correlation in logs
  const requestId = Math.random().toString(36).substring(2, 10);
  console.log(`[Suggested Projects ${requestId}] Processing new request`);
  
  try {
    // Get walletEns from query params
    const { searchParams } = new URL(req.url);
    const walletEns = (searchParams.get('walletEns') || '').toLowerCase().trim();
    
    if (!walletEns) {
      return NextResponse.json({
        isSuccess: false,
        message: 'walletEns query parameter is required'
      }, { status: 400 });
    }
    
    // Verify freelancer exists
    const [freelancer] = await db
      .select()
      .from(freelancerTable)
      .where(eq(freelancerTable.walletEns, walletEns))
      .limit(1);
      
    if (!freelancer) {
      return NextResponse.json({
        isSuccess: false,
        message: `Freelancer not found for walletEns=${walletEns}`
      }, { status: 404 });
    }
    
    // Get random open projects
    // Note: PostgreSQL-specific random() function
    const suggestedProjects = await db
      .select()
      .from(projectsTable)
      .where(eq(projectsTable.projectStatus, 'open'))
      .orderBy(sql`RANDOM()`)
      .limit(MAX_SUGGESTED_PROJECTS);
    
    console.log(`[Suggested Projects ${requestId}] Found ${suggestedProjects.length} suggested projects for ${walletEns}`);
    
    return NextResponse.json({
      isSuccess: true,
      data: suggestedProjects
    });
  } catch (error: any) {
    console.error(`[Suggested Projects ${requestId}] Error:`, error);
    
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

// Export the GET handler with CORS support
export const GET = withCors(getSuggestedProjects);

// Export the OPTIONS handler with CORS support
export const OPTIONS = withCors(async () => {
  return new Response(null, { status: 204 });
}); 