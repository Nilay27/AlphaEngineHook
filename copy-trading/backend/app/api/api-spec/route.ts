import { NextResponse } from 'next/server';
import apiSchema from '@/lib/openapi';
import { withCors } from '@/lib/cors';

// @ts-nocheck
// Force this API route to be dynamic
export const dynamic = 'force-dynamic';

async function getApiSpec() {
  return NextResponse.json(apiSchema);
}

export const GET = withCors(getApiSpec); 