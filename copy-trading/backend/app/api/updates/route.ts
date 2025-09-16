
// File: /Users/sattu/Library/CloudStorage/Dropbox/blockchain/teachnook/api_for_fe/app/api/updates/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { withCors } from '@/lib/cors'

/**
 * GET /api/updates?limit=5&role=company|freelancer
 * 
 * Returns a mock list of updates/announcements for the given role.
 * If no "role" is provided, or if it's not recognized, returns an error.
 *
 * Sample usage:
 *   GET /api/updates?limit=5&role=freelancer
 */
async function getUpdates(req: NextRequest) {
  try {
    const url = new URL(req.url)
    const limitStr = url.searchParams.get('limit') || '5'
    const role = url.searchParams.get('role') || ''

    const limit = parseInt(limitStr, 10) || 5
    if (!role || !['company', 'freelancer'].includes(role.toLowerCase())) {
      return NextResponse.json({
        isSuccess: false,
        message: `Please provide a valid role (company|freelancer) in the query. e.g. ?role=freelancer`
      }, { status: 400 })
    }

    // Just a mock. In real usage, you'd query from "updates" DB table or so.
    const roleType = role.toLowerCase()
    const mockUpdates = [
      {
        id: 'upd_001',
        title: `New Feature Released for ${roleType}`,
        summary: 'We just launched feature X to help your workflow...',
        createdAt: new Date(Date.now() - 2_000_000).toISOString(),
      },
      {
        id: 'upd_002',
        title: `Maintenance Scheduled for ${roleType}`,
        summary: 'Server downtime on some date/time...',
        createdAt: new Date(Date.now() - 1_000_000).toISOString(),
      },
      {
        id: 'upd_003',
        title: `Your Dashboard Upgraded`,
        summary: `Some improvements for ${roleType} dashboards...`,
        createdAt: new Date().toISOString(),
      },
    ]

    // Return "limit" items
    const data = mockUpdates.slice(0, limit)

    return NextResponse.json({
      isSuccess: true,
      updates: data,
    }, { status: 200 })
  } catch (error: any) {
    console.error('[GET /api/updates] Error:', error)
    return NextResponse.json({
      isSuccess: false,
      message: 'Internal Server Error',
    }, { status: 500 })
  }
}

// Use CORS wrapper
export const GET = withCors(getUpdates);
export const OPTIONS = withCors(async () => new Response(null, { status: 204 }));