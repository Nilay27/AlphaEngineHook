import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// This is a catch-all API route handler that forwards requests to the appropriate handlers
export async function GET(
  request: NextRequest,
  { params }: { params: { route?: string[] } }
) {
  const routePath = params.route?.join('/') || '';
  const url = new URL(request.url);
  
  try {
    // If this is the root API path, return API documentation info
    if (!routePath) {
      return NextResponse.json({
        name: "LearnLedger API",
        version: "1.0.0",
        description: "API for LearnLedger - a blockchain-based project management platform",
        status: {
          database: "CONNECTED" // We're not using mock database anymore
        },
        endpoints: {
          "/api/projects": "Get all projects or create a new project",
          "/api/projects/search": "Search projects by keywords",
          "/api/projects/stats": "Get project statistics",
          "/api/projects/{projectId}": "Get, update or delete a specific project",
          "/api/register": "Register a new user (company or freelancer)",
          "/api/userProfile": "Get or update user profile",
          "/api/submissions/read": "Read project submissions",
          "/api/submissions/create": "Create a new project submission",
        },
        documentation: "For detailed API documentation, see /docs/api"
      });
    }
    
    // Forward to the appropriate API route handler
    let response;
    
    if (routePath === 'projects/search') {
      const projectsModule = await import('../projects/search/route');
      response = await projectsModule.GET(request);
    } else if (routePath === 'projects/stats') {
      const projectsModule = await import('../projects/stats/route');
      response = await projectsModule.GET(request);
    } else if (routePath === 'projects') {
      const projectsModule = await import('../projects/route');
      response = await projectsModule.GET(request);
    } else if (routePath === 'api-spec') {
      const apiSpecModule = await import('../api-spec/route');
      response = await apiSpecModule.GET(request);
    } else {
      return NextResponse.json({ error: 'API route not found' }, { status: 404 });
    }
    
    return response;
  } catch (error) {
    console.error('API route error:', error);
    
    // Check if it's a database connection error
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const isDbConnectionError = 
      errorMessage.includes('getaddrinfo') || 
      errorMessage.includes('ENOTFOUND') ||
      errorMessage.includes('database');
      
    if (isDbConnectionError) {
      return NextResponse.json(
        { 
          error: 'Database connection error', 
          message: 'Unable to connect to the Supabase database. Please check your DATABASE_URL configuration.'
        },
        { status: 503 }
      );
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { route?: string[] } }
) {
  const routePath = params.route?.join('/') || '';
  
  try {
    // Forward to the appropriate API route handler
    let response;
    
    if (routePath === 'projects') {
      const projectsModule = await import('../projects/route');
      response = await projectsModule.POST(request);
    } else if (routePath === 'client-logs') {
      const clientLogsModule = await import('../client-logs/route');
      response = await clientLogsModule.POST(request);
    } else if (routePath === 'submissions/create') {
      const submissionsModule = await import('../submissions/create/route');
      response = await submissionsModule.POST(request);
    } else {
      return NextResponse.json({ error: 'API route not found' }, { status: 404 });
    }
    
    return response;
  } catch (error) {
    console.error('API route error:', error);
    
    // Check if it's a database connection error
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const isDbConnectionError = 
      errorMessage.includes('getaddrinfo') || 
      errorMessage.includes('ENOTFOUND') ||
      errorMessage.includes('database');
      
    if (isDbConnectionError) {
      return NextResponse.json(
        { 
          error: 'Database connection error', 
          message: 'Unable to connect to the Supabase database. Please check your DATABASE_URL configuration.'
        },
        { status: 503 }
      );
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 