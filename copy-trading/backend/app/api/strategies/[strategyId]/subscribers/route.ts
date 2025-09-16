import { NextRequest } from 'next/server'
import { db } from '@/db/db'
import { subscriptionsTable } from '@/db/schema/subscriptions-schema'
import { eq } from 'drizzle-orm'
import { successResponse, serverErrorResponse } from '@/app/api/api-utils'

export async function GET(req: NextRequest, { params }: { params: { strategyId: string } }) {
  try {
    const data = await db.select({
      alphaConsumerAddress: subscriptionsTable.alphaConsumerAddress,
      subscribedAt: subscriptionsTable.subscribedAt,
      isActive: subscriptionsTable.isActive
    }).from(subscriptionsTable).where(eq(subscriptionsTable.strategyId, params.strategyId))
    return successResponse(data, 'OK', 200, req)
  } catch (e: any) {
    return serverErrorResponse(e, req)
  }
}