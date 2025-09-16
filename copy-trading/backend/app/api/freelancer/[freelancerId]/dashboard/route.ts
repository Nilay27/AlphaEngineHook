import { NextRequest, NextResponse } from 'next/server'
import { eq } from 'drizzle-orm'

import { db } from '@/db/db'
import { freelancerTable } from '@/db/schema/freelancer-schema'

export async function GET(
  req: NextRequest,
  { params }: { params: { freelancerId: string } }
) {
  try {
    const { freelancerId } = params
    const [freelancer] = await db
      .select()
      .from(freelancerTable)
      .where(eq(freelancerTable.id, freelancerId))
      .limit(1)

    if (!freelancer) {
      return NextResponse.json(
        { isSuccess: false, message: 'Freelancer not found' },
        { status: 404 }
      )
    }

    // Some stats or placeholders:
    const stats = {
      openProjectsCount: 12,
      activeSubmissions: 3,
    }

    return NextResponse.json({
      isSuccess: true,
      data: {
        freelancer,
        stats,
      },
    })
  } catch (error) {
    console.error('Error GET /api/freelancer/[id]/dashboard:', error)
    return NextResponse.json(
      { isSuccess: false, message: 'Internal error' },
      { status: 500 }
    )
  }
}