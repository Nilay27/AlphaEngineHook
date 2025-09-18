import { NextRequest } from 'next/server'
import { db } from '@/db/db'
import { subscriptionsTable } from '@/db/schema/subscriptions-schema'
import { alphaGeneratorsTable } from '@/db/schema/alpha-generators-schema'
import { eq, and } from 'drizzle-orm'
import { successResponse, errorResponse, serverErrorResponse } from '@/app/api/api-utils'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    const alphaConsumerAddress = req.nextUrl.searchParams.get('alphaConsumerAddress')
    if (!alphaConsumerAddress) {
      return errorResponse('alphaConsumerAddress is required', 400, req)
    }

    // Fetch user's active subscriptions with alpha generator details
    const subscriptions = await db
      .select({
        subscriptionId: subscriptionsTable.subscriptionId,
        alphaConsumerAddress: subscriptionsTable.alphaConsumerAddress,
        alphaGeneratorAddress: subscriptionsTable.alphaGeneratorAddress,
        subscriptionTxHash: subscriptionsTable.subscriptionTxHash,
        subscribedAt: subscriptionsTable.createdAt,
        isActive: subscriptionsTable.isActive,
        generatorName: alphaGeneratorsTable.name,
        generatorDescription: alphaGeneratorsTable.description,
        feePercentage: alphaGeneratorsTable.feePercentage,
        minSubscriptionAmount: alphaGeneratorsTable.minSubscriptionAmount,
      })
      .from(subscriptionsTable)
      .leftJoin(alphaGeneratorsTable, eq(subscriptionsTable.alphaGeneratorAddress, alphaGeneratorsTable.generatorAddress))
      .where(
        and(
          eq(subscriptionsTable.alphaConsumerAddress, alphaConsumerAddress),
          eq(subscriptionsTable.isActive, true)
        )
      )
      .orderBy(subscriptionsTable.createdAt)

    // Ensure subscriptions is an array and handle any null/undefined fields
    const sanitizedSubscriptions = Array.isArray(subscriptions) ? subscriptions.map(sub => ({
      subscriptionId: sub.subscriptionId || null,
      alphaConsumerAddress: sub.alphaConsumerAddress || null,
      alphaGeneratorAddress: sub.alphaGeneratorAddress || null,
      subscriptionTxHash: sub.subscriptionTxHash || null,
      subscribedAt: sub.subscribedAt || null,
      isActive: sub.isActive ?? false,
      generatorName: sub.generatorName || null,
      generatorDescription: sub.generatorDescription || null,
      feePercentage: sub.feePercentage || '0',
      minSubscriptionAmount: sub.minSubscriptionAmount || '0',
    })) : [];

    return successResponse(sanitizedSubscriptions, 'OK', 200, req)
  } catch (e: any) {
    return serverErrorResponse(e, req)
  }
}