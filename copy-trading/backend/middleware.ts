import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Note: Telemetry cannot be used in middleware because it runs in Edge Runtime
// which doesn't support Node.js modules like 'path' and 'fs'
// Telemetry will be used in API routes instead

// Environment-based CORS configuration
const CORS_CONFIG = {
  development: {
    origins: [
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:3002',
      'http://localhost:3003',
      'http://localhost:3004',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:3001',
      'http://127.0.0.1:3002',
      'http://127.0.0.1:3003',
      'http://127.0.0.1:3004',
    ],
    credentials: true
  },
  production: {
    origins: [
      'https://learn-ledger-api.vercel.app',
      'https://learn-ledger.vercel.app',
      'https://learnledger.xyz',
      'https://www.learnledger.xyz',
      'https://api.learnledger.xyz',
      'https://www.api.learnledger.xyz',
      // Add subdomains to handle all possible variations
      'https://*.learnledger.xyz',
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:3002',
      'http://localhost:3003',
      'http://localhost:3004',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:3001',
      'http://127.0.0.1:3002',
      'http://127.0.0.1:3003',
      'http://127.0.0.1:3004',
    ],
    credentials: true
  }
};

// Get allowed origins based on environment
const getAllowedOrigins = () => {
  const env = process.env.NODE_ENV || 'development';
  return CORS_CONFIG[env as keyof typeof CORS_CONFIG].origins;
};

// Check if origin matches including wildcard support
const isOriginAllowed = (origin: string | null): boolean => {
  if (!origin) return true; // Allow requests with no origin
  
  const allowedOrigins = getAllowedOrigins();
  
  return allowedOrigins.some(allowedOrigin => {
    if (allowedOrigin === origin) return true;
    if (allowedOrigin.includes('*')) {
      const pattern = new RegExp('^' + allowedOrigin.replace('*.', '([^.]+\\.)+') + '$');
      return pattern.test(origin);
    }
    return false;
  });
};

// Comprehensive list of allowed headers
const DEFAULT_ALLOWED_HEADERS = [
  'Content-Type',
  'Authorization',
  'X-Requested-With',
  'Accept',
  'Accept-Version',
  'Content-Length',
  'Content-MD5',
  'Date',
  'X-Api-Version',
  'Origin',
  'Cache-Control',
  'If-Match',
  'If-None-Match',
  'If-Modified-Since',
  'If-Unmodified-Since',
  'X-Requested-With',
  // Client Hints headers
  'Sec-CH-UA',
  'Sec-CH-UA-Platform',
  'Sec-CH-UA-Platform-Version',
  'Sec-CH-UA-Mobile',
  'Sec-CH-UA-Model',
  'Sec-CH-UA-Full-Version',
  'Sec-CH-UA-Full-Version-List',
  // Custom headers if needed
  'X-Custom-Header'
];

// This middleware runs on the edge and ensures proper handling of API routes
export async function middleware(request: NextRequest) {
  const startTime = Date.now();
  const correlationId = request.headers.get('x-correlation-id') || crypto.randomUUID();

  // Enhanced logging for debugging CORS issues
  const origin = request.headers.get('origin');
  const method = request.method;
  const path = request.nextUrl.pathname;

  // Log all requests using console (Edge Runtime compatible)
  console.log(`[Middleware] ${method} ${path} - Origin: ${origin} - Correlation: ${correlationId}`);
  
  // Handle CORS for API routes
  if (request.nextUrl.pathname.startsWith('/api/')) {
    console.log(`[Middleware] Path starts with /api/ - CORS handling applies: ${path}`);
    // Check if route uses withCors already
    // Since we can't directly check this, we'll add a test if the URL contains `/userProfile/` which
    // we know uses withCors. In a more complete solution, we would either:
    // 1. Add logic to detect all routes using withCors
    // 2. Add a query parameter or header to indicate withCors is being used
    // For now, we'll use a simple check for known routes
    
    const routesWithCorsMidware = [
      '/api/userProfile',
      '/api/freelancer',
      '/api/projects',
      '/api/register',
      '/api/submissions',
      '/api/docs',
      '/api/updates',
      '/api/api-spec'
    ];
    
    // Check if the current path matches any of the routes with CORS middleware
    const useRouteLevelCORS = routesWithCorsMidware.some(route => 
      request.nextUrl.pathname.startsWith(route)
    );
    
    console.log(`[Middleware] CORS route check - Use route level: ${useRouteLevelCORS}`);
    
    if (useRouteLevelCORS) {
      console.log(`[Middleware] Skipping CORS handling for route with its own CORS: ${path}`);
      // Pass through to let route handle CORS
      return NextResponse.next();
    }
    
    // Handle preflight OPTIONS request
    if (request.method === 'OPTIONS') {
      console.log(`[Middleware] Handling OPTIONS preflight request: ${path} from ${origin}`);
      const headers = new Headers();
      headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH, HEAD');
      headers.set('Access-Control-Allow-Headers', DEFAULT_ALLOWED_HEADERS.join(', '));
      headers.set('Access-Control-Max-Age', '86400'); // 24 hours
      headers.set('Vary', 'Origin');

      // Check if the origin is allowed before setting CORS headers
      if (origin && isOriginAllowed(origin)) {
        console.log(`[Middleware] Origin allowed - adding CORS headers for preflight: ${origin}`);
        headers.set('Access-Control-Allow-Origin', origin);
        headers.set('Access-Control-Allow-Credentials', 'true');
      } else {
        console.warn(`[Middleware] Denying OPTIONS request from origin: ${origin || 'none'}`);
      }
      
      // Add correlation ID to preflight response
      headers.set('x-correlation-id', correlationId);

      // Return 204 No Content for preflight
      const response = new Response(null, {
        status: 204,
        headers: headers,
      });

      console.log(`[Middleware] Preflight response completed - Correlation: ${correlationId} - Duration: ${Date.now() - startTime}ms`);
      return response;
    }
    
    // For non-OPTIONS methods, continue but add CORS headers to the response
    const response = NextResponse.next();
    console.log(`[Middleware] Non-OPTIONS request - proceeding to add CORS headers: ${method} ${path}`);
    
    // Check if the origin is allowed before adding headers to the actual response
    if (origin && isOriginAllowed(origin)) {
      console.log(`[Middleware] Origin allowed - adding CORS headers to response: ${origin}`);
      response.headers.set('Access-Control-Allow-Origin', origin);
      response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH, HEAD');
      response.headers.set('Access-Control-Allow-Headers', DEFAULT_ALLOWED_HEADERS.join(', '));
      response.headers.set('Vary', 'Origin');
      response.headers.set('Access-Control-Allow-Credentials', 'true');
    } else if (!origin) {
      console.log(`[Middleware] No origin header present - not adding CORS headers`);
    } else {
      console.warn(`[Middleware] Blocking request from disallowed origin: ${origin}`);
    }
    
    // Add correlation ID to all responses
    response.headers.set('x-correlation-id', correlationId);

    console.log(`[Middleware] Request completed - Correlation: ${correlationId} - Duration: ${Date.now() - startTime}ms`);
    return response;
  }

  // Pass through for non-API routes
  console.log(`[Middleware] Path does not start with /api/ - no CORS handling: ${path}`);

  const response = NextResponse.next();
  response.headers.set('x-correlation-id', correlationId);

  console.log(`[Middleware] Request completed (non-API) - Correlation: ${correlationId} - Duration: ${Date.now() - startTime}ms`);
  return response;
}

// Configure the paths where middleware will be invoked
export const config = {
  matcher: [
    '/api/:path*',
  ],
} 