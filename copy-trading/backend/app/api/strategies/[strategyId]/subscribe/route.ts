import { NextRequest } from 'next/server'
import { db } from '@/db/db'
import { subscriptionsTable } from '@/db/schema/subscriptions-schema'
import { strategiesTable } from '@/db/schema/strategies-schema'
import { sql, and, eq } from 'drizzle-orm'
import { successResponse, errorResponse, serverErrorResponse } from '@/app/api/api-utils'
import { ethers } from 'ethers'

export async function POST(req: NextRequest, { params }: { params: { strategyId: string }}) {
  try {
    const strategyId = params.strategyId
    const { alphaConsumerAddress, subscriptionTxHash } = await req.json()

    if (!alphaConsumerAddress || !subscriptionTxHash) {
      return errorResponse('alphaConsumerAddress and subscriptionTxHash are required', 400, req)
    }

    // Check if strategy exists
    const [strategy] = await db.select().from(strategiesTable).where(eq(strategiesTable.strategyId, strategyId)).limit(1)
    if (!strategy) {
      return errorResponse('Strategy not found', 404, req)
    }

    // Only verify blockchain transaction in production
    if (process.env.NODE_ENV === 'production') {
      if (!process.env.BLOCKCHAIN_RPC_URL) {
        return errorResponse('Blockchain RPC not configured', 500, req)
      }
      
      const provider = new ethers.JsonRpcProvider(process.env.BLOCKCHAIN_RPC_URL)
      const receipt = await provider.getTransactionReceipt(subscriptionTxHash)
      if (!receipt || receipt.status !== 1) {
        return errorResponse('Subscription tx not found or failed', 400, req)
      }
    }

    const [existing] = await db.select().from(subscriptionsTable).where(
      and(eq(subscriptionsTable.strategyId, strategyId), eq(subscriptionsTable.alphaConsumerAddress, alphaConsumerAddress))
    ).limit(1)

    if (existing?.isActive) {
      return successResponse(existing, 'Already subscribed', 200, req)
    }

    const [row] = await db.insert(subscriptionsTable).values({
      strategyId,
      alphaConsumerAddress,
      subscriptionTxHash,
      isActive: true
    }).returning()

    await db.execute(sql`UPDATE strategies SET subscriber_count = subscriber_count + 1 WHERE strategy_id = ${strategyId}`)
    return successResponse(row, 'Subscribed', 201, req)
  } catch (e: any) {
    return serverErrorResponse(e, req)
  }
}