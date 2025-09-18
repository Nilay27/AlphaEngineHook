import { NextRequest } from 'next/server'
import { db } from '@/db/db'
import { subscriptionsTable } from '@/db/schema/subscriptions-schema'
import { strategiesTable } from '@/db/schema/strategies-schema'
import { eq, and } from 'drizzle-orm'
import { successResponse, errorResponse, serverErrorResponse } from '@/app/api/api-utils'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    const consumerAddress = req.nextUrl.searchParams.get('consumer')
    if (!consumerAddress) {
      return errorResponse('consumer parameter is required', 400, req)
    }

    // Fetch user's active subscriptions with strategy details
    const subscriptions = await db
      .select({
        subscriptionId: subscriptionsTable.subscriptionId,
        alphaGeneratorAddress: subscriptionsTable.alphaGeneratorAddress,
        alphaConsumerAddress: subscriptionsTable.alphaConsumerAddress,
        encryptedConsumerAddress: subscriptionsTable.encryptedConsumerAddress,
        subscriptionType: subscriptionsTable.subscriptionType,
        encryptionVersion: subscriptionsTable.encryptionVersion,
        subscriptionTxHash: subscriptionsTable.subscriptionTxHash,
        isActive: subscriptionsTable.isActive,
        metadata: subscriptionsTable.metadata,
        createdAt: subscriptionsTable.createdAt,
        updatedAt: subscriptionsTable.updatedAt,
      })
      .from(subscriptionsTable)
      .where(
        and(
          eq(subscriptionsTable.alphaConsumerAddress, consumerAddress),
          eq(subscriptionsTable.isActive, true)
        )
      )
      .orderBy(subscriptionsTable.subscribedAt)

    // Ensure subscriptions is an array and handle any null/undefined fields
    const sanitizedSubscriptions = Array.isArray(subscriptions) ? subscriptions.map(sub => ({
      subscriptionId: sub.subscriptionId || '',
      alphaGeneratorAddress: sub.alphaGeneratorAddress || '',
      alphaConsumerAddress: sub.alphaConsumerAddress || '',
      encryptedConsumerAddress: sub.encryptedConsumerAddress || '',
      subscriptionType: sub.subscriptionType || 'generator',
      encryptionVersion: sub.encryptionVersion || 1,
      subscriptionTxHash: sub.subscriptionTxHash || '',
      isActive: sub.isActive ?? false,
      metadata: sub.metadata || {},
      createdAt: sub.createdAt ? sub.createdAt.toISOString() : new Date().toISOString(),
      updatedAt: sub.updatedAt ? sub.updatedAt.toISOString() : new Date().toISOString(),
    })) : [];

    return successResponse(sanitizedSubscriptions, 'OK', 200, req)
  } catch (e: any) {
    return serverErrorResponse(e, req)
  }
}