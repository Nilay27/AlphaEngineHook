import { NextRequest } from 'next/server';
import { withCors } from '@/lib/cors';
import { successResponse } from '@/app/api/api-utils';

/**
 * GET /api/debug/cors
 * 
 * A test endpoint to debug CORS issues.
 * It returns the origin and all headers of the request.
 */
async function debugCorsHandler(req: NextRequest) {
  // Get headers from the request
  const headers = Object.fromEntries([...req.headers.entries()]);
  
  // Extract the origin
  const origin = req.headers.get('origin');
  
  // Return a response with all info
  return successResponse({
    origin,
    headers,
    url: req.url,
    method: req.method,
    timestamp: new Date().toISOString(),
    serverEnvironment: process.env.NODE_ENV || 'unknown'
  }, 'CORS Debug Information', 200, req);
}

// Export the handler wrapped with CORS
export const GET = withCors(debugCorsHandler);
export const OPTIONS = withCors(async () => {
  return new Response(null, { status: 204 });
}); 