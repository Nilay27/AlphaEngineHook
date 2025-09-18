import { NextRequest } from 'next/server'
import { db } from '@/db/db'
import { tradeConfirmationsTable } from '@/db/schema/trade-confirmations-schema'
import { eq, and } from 'drizzle-orm'
import { successResponse, errorResponse, serverErrorResponse } from '@/app/api/api-utils'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    const address = req.nextUrl.searchParams.get('address')
    if (!address) {
      return errorResponse('address parameter is required', 400, req)
    }

    const data = await db.select().from(tradeConfirmationsTable).where(
      and(
        eq(tradeConfirmationsTable.alphaConsumerAddress, address),
        eq(tradeConfirmationsTable.isExecuted, false)
      )
    )

    // Map the data to match the TradeNotification interface expected by frontend
    const pendingTrades = data.map(trade => {
      // Parse executionParams from JSONB
      const executionParams = typeof trade.executionParams === 'object' && trade.executionParams
        ? trade.executionParams as any
        : {};

      return {
        confirmationId: trade.confirmationId || '',
        alphaGeneratorAddress: '', // Not available in current schema
        alphaConsumerAddress: trade.alphaConsumerAddress || '',
        executionParams: {
          protocol: executionParams.protocol || '',
          action: executionParams.action || '',
          tokenIn: executionParams.tokenIn || undefined,
          tokenOut: executionParams.tokenOut || undefined,
          amount: executionParams.amount || '0',
          slippage: executionParams.slippage || undefined,
          data: executionParams.data || {},
        },
        gasEstimate: trade.gasEstimate || '0',
        tradeStatus: 'pending' as const, // Since we're filtering for non-executed trades
        expiryTimestamp: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 minutes from now as default
        protocolMetadata: {
          displayName: executionParams.protocol || 'Unknown Protocol',
          icon: undefined,
          requiresApproval: false,
          description: `Trade on ${executionParams.protocol || 'Unknown Protocol'}`,
        },
      };
    });

    return successResponse(pendingTrades, 'OK', 200, req)
  } catch (e: any) {
    return serverErrorResponse(e, req)
  }
}