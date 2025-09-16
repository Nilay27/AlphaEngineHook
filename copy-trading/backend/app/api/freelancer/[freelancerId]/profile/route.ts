import { NextRequest, NextResponse } from 'next/server'
import { eq } from 'drizzle-orm'

import { db } from '@/db/db'
import { freelancerTable } from '@/db/schema/freelancer-schema'

/**
 * GET /api/freelancer/:freelancerId/profile
 * Return JSON for the freelancer’s profile
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { freelancerId: string } }
) {
  try {
    const [f] = await db
      .select()
      .from(freelancerTable)
      .where(eq(freelancerTable.id, params.freelancerId))
      .limit(1)

    if (!f) {
      return NextResponse.json({ message: 'Not found' }, { status: 404 })
    }

    return NextResponse.json({
      freelancer: f,
    })
  } catch (error) {
    console.error('[GET /api/freelancer/:freelancerId/profile] Error:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}