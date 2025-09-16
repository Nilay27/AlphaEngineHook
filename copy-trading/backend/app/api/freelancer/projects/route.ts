/**
 * File: /app/api/freelancer/projects/route.ts
 * 
 * This endpoint handles GET/POST requests for:
 * 1. Suggested projects (random projects for freelancers)
 * 2. Bookmarked projects (projects that a freelancer has bookmarked)
 *
 * GET or POST /api/freelancer/projects
 * {
 *   "walletEns": "freelancer",
 *   "tab": "suggested" | "bookmarked"  
 * }
 * 
 * Response:
 * {
 *   "isSuccess": true,
 *   "data": [
 *     {
 *       "projectId": "...",
 *       "projectName": "...",
 *       "projectDescription": "...",
 *       "prizeAmount": "100",
 *       "requiredSkills": "react, solidity",
 *       "isBookmarked": true,
 *       ...
 *     },
 *     ...
 *   ]
 * }
 */

import { NextRequest, NextResponse } from 'next/server';
import { withCors } from '@/lib/cors';
import { db } from '@/db/db';
import { projectsTable } from '@/db/schema/projects-schema';
import { bookmarksTable } from '@/db/schema/bookmarks-schema';
import { freelancerTable } from '@/db/schema/freelancer-schema';
import { eq, and, sql, desc } from 'drizzle-orm';

async function handleProjects(req: NextRequest) {
  // Add request ID for correlation in logs
  const requestId = Math.random().toString(36).substring(2, 10);
  console.log(`[Freelancer Projects ${requestId}] Processing new request`);
  
  try {
    let walletEns = '';
    let tab = 'suggested'; // Default tab

    // Parse parameters from either GET or POST
    if (req.method === 'GET') {
      const url = new URL(req.url);
      walletEns = (url.searchParams.get('walletEns') || '').toLowerCase().trim();
      tab = (url.searchParams.get('tab') || 'suggested').toLowerCase().trim();
      console.log(`[Freelancer Projects ${requestId}] GET params:`, { walletEns, tab });
    } else {
      try {
        const body = await req.json();
        console.log(`[Freelancer Projects ${requestId}] Request body:`, JSON.stringify(body));
        walletEns = (body.walletEns || '').toLowerCase().trim();
        tab = (body.tab || 'suggested').toLowerCase().trim();
      } catch (parseError) {
        console.error(`[Freelancer Projects ${requestId}] Error parsing request body:`, parseError);
        return NextResponse.json({
          isSuccess: false,
          message: 'Invalid request body format'
        }, { status: 400 });
      }
    }

    // Validate walletEns
    if (!walletEns) {
      return NextResponse.json({
        isSuccess: false,
        message: 'walletEns is required'
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

    console.log(`[Freelancer Projects ${requestId}] Found freelancer:`, freelancer.freelancerName);

    // Get user's bookmarks regardless of the tab
    let bookmarks: any[] = [];
    try {
      bookmarks = await db
        .select()
        .from(bookmarksTable)
        .where(eq(bookmarksTable.walletEns, walletEns));
      
      console.log(`[Freelancer Projects ${requestId}] Found ${bookmarks.length} bookmarks`);
    } catch (bookmarkError) {
      console.error(`[Freelancer Projects ${requestId}] Error fetching bookmarks:`, bookmarkError);
      // Continue without bookmarks
    }

    // Create a set of bookmarked project IDs for quick lookup
    const bookmarkedProjectIds = new Set(bookmarks.map(b => b.projectId));

    let projects: any[] = [];

    if (tab === 'bookmarked') {
      // Handle bookmarked projects tab
      if (bookmarks.length === 0) {
        // No bookmarks, return empty array
        console.log(`[Freelancer Projects ${requestId}] No bookmarks found, returning empty array`);
        return NextResponse.json({
          isSuccess: true,
          data: []
        });
      }

      // Query projects by IDs from bookmarks
      for (const bookmark of bookmarks) {
        try {
          const projectResults = await db
            .select()
            .from(projectsTable)
            .where(eq(projectsTable.projectId, bookmark.projectId));
          
          projects.push(...projectResults);
        } catch (projectError) {
          console.error(`[Freelancer Projects ${requestId}] Error fetching project ${bookmark.projectId}:`, projectError);
          // Continue with other projects
        }
      }
      
      console.log(`[Freelancer Projects ${requestId}] Found ${projects.length} bookmarked projects`);
    } else {
      // Handle suggested projects tab - get random open projects
      try {
        // Get all open projects, limited to recent ones
        const allProjects = await db
          .select()
          .from(projectsTable)
          .where(eq(projectsTable.projectStatus, 'open'))
          .orderBy(desc(projectsTable.createdAt))
          .limit(20);
        
        // Shuffle to get random projects
        projects = shuffleArray(allProjects).slice(0, 10);
        console.log(`[Freelancer Projects ${requestId}] Generated ${projects.length} random suggested projects`);
      } catch (projectError) {
        console.error(`[Freelancer Projects ${requestId}] Error fetching suggested projects:`, projectError);
        return NextResponse.json({
          isSuccess: false,
          message: 'Error fetching suggested projects'
        }, { status: 500 });
      }
    }

    // Enhance projects with bookmark information
    const enhancedProjects = projects.map(project => ({
      ...project,
      isBookmarked: bookmarkedProjectIds.has(project.projectId)
    }));

    return NextResponse.json({
      isSuccess: true,
      data: enhancedProjects
    });
  } catch (error: any) {
    console.error(`[Freelancer Projects ${requestId}] Error:`, error);
    
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

// Helper function to shuffle an array
function shuffleArray(array: any[]) {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

export const GET = withCors(handleProjects);
export const POST = withCors(handleProjects);
export const OPTIONS = withCors(async () => new Response(null, { status: 204 })); 