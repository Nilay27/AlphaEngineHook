import { NextRequest, NextResponse } from 'next/server'
import { eq } from 'drizzle-orm'

import { db } from '@/db/db'
import { companyTable } from '@/db/schema/company-schema'

/**
 * GET /api/company/:companyId/profile
 * Returns JSON with the profile fields from the "company" table.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { companyId: string } }
) {
  try {
    const [company] = await db
      .select()
      .from(companyTable)
      .where(eq(companyTable.id, params.companyId))
      .limit(1)

    if (!company) {
      return NextResponse.json({ message: 'Not found' }, { status: 404 })
    }

    return NextResponse.json({
      company,
    })
  } catch (error) {
    console.error('[GET /api/company/:companyId/profile] Error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}