/**
 * File: /app/api/freelancer/bookmarks/route.ts
 * 
 * This endpoint handles bookmarking functionality:
 * 1. GET - Get all bookmarked projects for a freelancer
 * 2. POST - Add a bookmark (projectId + walletEns)
 * 3. DELETE - Remove a bookmark
 *
 * GET /api/freelancer/bookmarks?walletEns=freelancer
 * 
 * POST /api/freelancer/bookmarks
 * {
 *   "walletEns": "freelancer",
 *   "walletAddress": "0x...",
 *   "projectId": "project-uuid"
 * }
 * 
 * DELETE /api/freelancer/bookmarks
 * {
 *   "walletEns": "freelancer",
 *   "projectId": "project-uuid"
 * }
 *
 * Response:
 * {
 *   "isSuccess": true,
 *   "message": "Bookmark added/removed successfully"
 * }
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db/db';
import { projectsTable } from '@/db/schema/projects-schema';
import { bookmarksTable } from '@/db/schema/bookmarks-schema';
import { freelancerTable } from '@/db/schema/freelancer-schema';
import { eq, and } from 'drizzle-orm';

// GET - Get all bookmarked projects for a freelancer
export async function GET(req: NextRequest) {
  // Add request ID for correlation in logs
  const requestId = Math.random().toString(36).substring(2, 10);
  console.log(`[Bookmark Get ${requestId}] Processing new request`);
  
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
    
    // First get all bookmark IDs
    const bookmarks = await db
      .select()
      .from(bookmarksTable)
      .where(eq(bookmarksTable.walletEns, walletEns));
    
    if (bookmarks.length === 0) {
      return NextResponse.json({
        isSuccess: true,
        data: []
      });
    }
    
    // Now fetch the project details for each bookmark
    const bookmarkedProjects: Array<any> = [];
    for (const bookmark of bookmarks) {
      const [project] = await db
        .select()
        .from(projectsTable)
        .where(eq(projectsTable.projectId, bookmark.projectId));
      
      if (project) {
        bookmarkedProjects.push({
          bookmarkId: bookmark.bookmarkId,
          walletEns: bookmark.walletEns,
          projectId: bookmark.projectId,
          createdAt: bookmark.createdAt,
          projectName: project.projectName,
          projectDescription: project.projectDescription,
          prizeAmount: project.prizeAmount,
          projectStatus: project.projectStatus,
          projectOwnerWalletEns: project.projectOwnerWalletEns
        });
      }
    }
    
    console.log(`[Bookmark Get ${requestId}] Found ${bookmarkedProjects.length} bookmarks for ${walletEns}`);
    
    return NextResponse.json({
      isSuccess: true,
      data: bookmarkedProjects
    });
  } catch (error: any) {
    console.error(`[Bookmark Get ${requestId}] Error:`, error);
    
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

// POST - Add a bookmark
export async function POST(req: NextRequest) {
  // Add request ID for correlation in logs
  const requestId = Math.random().toString(36).substring(2, 10);
  console.log(`[Bookmark Add ${requestId}] Processing new request`);
  
  try {
    // Parse request body - using text first to handle potential JSON issues
    const bodyText = await req.text();
    console.log(`[Bookmark Add ${requestId}] Raw request body:`, bodyText);
    console.log(`[Bookmark Add ${requestId}] Raw request body length:`, bodyText.length);
    console.log(`[Bookmark Add ${requestId}] Raw request body (escaped):`, JSON.stringify(bodyText));
    
    let body;
    try {
      body = JSON.parse(bodyText);
    } catch (e: any) {
      console.error(`[Bookmark Add ${requestId}] JSON parse error:`, e);
      
      // Enhanced debugging for malformed JSON
      let debugInfo: any = {
        message: e.message,
        requestId
      };
      
      // If error is about unexpected character, add more debug info
      if (e.message.includes('Unexpected')) {
        // Find the position mentioned in the error
        const positionMatch = e.message.match(/position (\d+)/);
        const position = positionMatch ? parseInt(positionMatch[1]) : -1;
        
        if (position >= 0) {
          const start = Math.max(0, position - 20);
          const end = Math.min(bodyText.length, position + 20);
          
          debugInfo = {
            ...debugInfo,
            position,
            contextAround: bodyText.substring(start, end),
            charCode: position < bodyText.length ? bodyText.charCodeAt(position) : null,
            fullTextLength: bodyText.length,
            suggestion: "Check for extra characters, trailing commas, or invisible characters in your JSON"
          };
        }
      }
      
      return NextResponse.json({
        isSuccess: false,
        message: 'Invalid JSON in request body',
        debugInfo
      }, { status: 400 });
    }
    
    console.log(`[Bookmark Add ${requestId}] Parsed body:`, body);
    
    const walletEns = (body.walletEns || '').toLowerCase().trim();
    const walletAddress = (body.walletAddress || '').toLowerCase().trim();
    const projectId = (body.projectId || '').trim();
    
    // Validate required fields
    if (!walletEns || !projectId) {
      return NextResponse.json({
        isSuccess: false,
        message: 'walletEns and projectId are required'
      }, { status: 400 });
    }
    
    // Verify freelancer exists
    let freelancerFound = false;
    
    // Check by walletEns
    const [freelancerByEns] = await db
      .select()
      .from(freelancerTable)
      .where(eq(freelancerTable.walletEns, walletEns))
      .limit(1);
      
    if (freelancerByEns) {
      freelancerFound = true;
    } else if (walletAddress) {
      // Try finding by wallet address if provided
      const [freelancerByAddress] = await db
        .select()
        .from(freelancerTable)
        .where(eq(freelancerTable.walletAddress, walletAddress))
        .limit(1);
        
      if (freelancerByAddress) {
        freelancerFound = true;
      }
    }
    
    if (!freelancerFound) {
      return NextResponse.json({
        isSuccess: false,
        message: `Freelancer not found for walletEns=${walletEns}${walletAddress ? ` or walletAddress=${walletAddress}` : ''}`
      }, { status: 404 });
    }
    
    // Verify project exists
    const [project] = await db
      .select()
      .from(projectsTable)
      .where(eq(projectsTable.projectId, projectId))
      .limit(1);
      
    if (!project) {
      return NextResponse.json({
        isSuccess: false,
        message: `Project not found for projectId=${projectId}`
      }, { status: 404 });
    }
    
    // Check if bookmark already exists
    const [existingBookmark] = await db
      .select()
      .from(bookmarksTable)
      .where(
        and(
          eq(bookmarksTable.walletEns, walletEns),
          eq(bookmarksTable.projectId, projectId)
        )
      )
      .limit(1);
      
    if (existingBookmark) {
      return NextResponse.json({
        isSuccess: true,
        message: 'Bookmark already exists'
      });
    }
    
    // Add bookmark
    await db
      .insert(bookmarksTable)
      .values({
        walletEns,
        walletAddress,
        projectId
      });
      
    console.log(`[Bookmark Add ${requestId}] Bookmark added for project ${projectId} by ${walletEns}`);
    
    return NextResponse.json({
      isSuccess: true,
      message: 'Bookmark added successfully'
    });
  } catch (error: any) {
    console.error(`[Bookmark Add ${requestId}] Error:`, error);
    
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

// DELETE - Remove a bookmark
export async function DELETE(req: NextRequest) {
  // Add request ID for correlation in logs
  const requestId = Math.random().toString(36).substring(2, 10);
  console.log(`[Bookmark Remove ${requestId}] Processing new request`);
  
  try {
    // Parse request body - using text first to handle potential JSON issues
    const bodyText = await req.text();
    console.log(`[Bookmark Remove ${requestId}] Raw request body:`, bodyText);
    console.log(`[Bookmark Remove ${requestId}] Raw request body length:`, bodyText.length);
    console.log(`[Bookmark Remove ${requestId}] Raw request body (escaped):`, JSON.stringify(bodyText));
    
    let body;
    try {
      body = JSON.parse(bodyText);
    } catch (e: any) {
      console.error(`[Bookmark Remove ${requestId}] JSON parse error:`, e);
      
      // Enhanced debugging for malformed JSON
      let debugInfo: any = {
        message: e.message,
        requestId
      };
      
      // If error is about unexpected character, add more debug info
      if (e.message.includes('Unexpected')) {
        // Find the position mentioned in the error
        const positionMatch = e.message.match(/position (\d+)/);
        const position = positionMatch ? parseInt(positionMatch[1]) : -1;
        
        if (position >= 0) {
          const start = Math.max(0, position - 20);
          const end = Math.min(bodyText.length, position + 20);
          
          debugInfo = {
            ...debugInfo,
            position,
            contextAround: bodyText.substring(start, end),
            charCode: position < bodyText.length ? bodyText.charCodeAt(position) : null,
            fullTextLength: bodyText.length,
            suggestion: "Check for extra characters, trailing commas, or invisible characters in your JSON"
          };
        }
      }
      
      return NextResponse.json({
        isSuccess: false,
        message: 'Invalid JSON in request body',
        debugInfo
      }, { status: 400 });
    }
    
    const walletEns = (body.walletEns || '').toLowerCase().trim();
    const projectId = (body.projectId || '').trim();
    
    // Validate required fields
    if (!walletEns || !projectId) {
      return NextResponse.json({
        isSuccess: false,
        message: 'walletEns and projectId are required'
      }, { status: 400 });
    }
    
    // Remove bookmark
    await db
      .delete(bookmarksTable)
      .where(
        and(
          eq(bookmarksTable.walletEns, walletEns),
          eq(bookmarksTable.projectId, projectId)
        )
      );
      
    console.log(`[Bookmark Remove ${requestId}] Bookmark removed for project ${projectId} by ${walletEns}`);
    
    return NextResponse.json({
      isSuccess: true,
      message: 'Bookmark removed successfully'
    });
  } catch (error: any) {
    console.error(`[Bookmark Remove ${requestId}] Error:`, error);
    
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

// OPTIONS handler for CORS
export async function OPTIONS() {
  return new Response(null, { 
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400'
    }
  });
} 