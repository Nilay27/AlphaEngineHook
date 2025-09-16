import { NextRequest } from 'next/server'
import { db } from '@/db/db'
import { subscriptionsTable } from '@/db/schema/subscriptions-schema'
import { tradeConfirmationsTable } from '@/db/schema/trade-confirmations-schema'
import { strategiesTable } from '@/db/schema/strategies-schema'
import { eq } from 'drizzle-orm'
import { successResponse, errorResponse, serverErrorResponse } from '@/app/api/api-utils'
import { emitConfirmationEvent } from '@/app/api/confirmations/stream/bus'

export async function POST(req: NextRequest) {
  try {
    const { strategyId, executionParams, gasEstimate } = await req.json()

    // Check if strategy exists
    const [strategy] = await db.select().from(strategiesTable).where(eq(strategiesTable.strategyId, strategyId)).limit(1)
    if (!strategy) {
      return errorResponse('Strategy not found', 404, req)
    }

    // Get all active subscribers for this strategy
    const subs = await db.select().from(subscriptionsTable).where(eq(subscriptionsTable.strategyId, strategyId))
    
    if (!subs.length) {
      return successResponse({ created: 0 }, 'No subscribers', 200, req)
    }

    let created = 0
    for (const s of subs) {
      const [row] = await db.insert(tradeConfirmationsTable).values({
        strategyId,
        alphaConsumerAddress: s.alphaConsumerAddress,
        executionParams,
        gasEstimate
      }).returning()
      
      created += 1
      
      // Emit SSE event for real-time notification
      emitConfirmationEvent(row)
    }
    
    return successResponse({ created }, 'Broadcasted', 201, req)
  } catch (e: any) {
    return serverErrorResponse(e, req)
  }
}