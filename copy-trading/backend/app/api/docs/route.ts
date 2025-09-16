import { NextRequest, NextResponse } from 'next/server';
import { withCors } from '@/lib/cors';

// @ts-nocheck
// Force this API route to be dynamic
export const dynamic = 'force-dynamic';

async function getApiDocs(req: NextRequest) {
  // Return a simplified schema in production to avoid build issues
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({
      openapi: '3.0.0',
      info: {
        title: 'LearnLedger API',
        version: '1.0.0',
        description: 'Full schema temporarily unavailable in production. Please refer to documentation.'
      },
      paths: {
        '/api': {
          get: {
            summary: 'API root',
            responses: {
              '200': {
                description: 'OK'
              }
            }
          }
        }
      }
    });
  }
  
  // Only import the full schema in development
  const { default: apiSchema } = await import('@/lib/openapi');
  return NextResponse.json(apiSchema);
}

// Apply CORS to route handler
export const GET = withCors(getApiDocs);
export const OPTIONS = withCors(async () => {
  // Empty handler, the CORS middleware will create the proper OPTIONS response
  return new Response(null, { status: 204 });
}); 