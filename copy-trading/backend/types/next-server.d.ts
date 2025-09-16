// Type declarations for next/server
declare module 'next/server' {
  import { NextRequest as OriginalNextRequest, NextResponse as OriginalNextResponse } from 'next';
  
  export type NextRequest = OriginalNextRequest;
  export type NextResponse = OriginalNextResponse;
  
  export const NextResponse: {
    json: (body: any, options?: { status?: number; headers?: Record<string, string> }) => NextResponse;
    redirect: (url: string, options?: { status?: number }) => NextResponse;
    rewrite: (url: string) => NextResponse;
    next: () => NextResponse;
  };
} 