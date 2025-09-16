import { NextRequest } from 'next/server'
import { db } from '@/db/db'
import { tradeConfirmationsTable } from '@/db/schema/trade-confirmations-schema'
import { eq } from 'drizzle-orm'
import { successResponse, errorResponse, serverErrorResponse } from '@/app/api/api-utils'
import { emitConfirmationEvent } from '@/app/api/confirmations/stream/bus'

export async function PATCH(
  req: NextRequest,
  { params }: { params: { confirmationId: string } }
) {
  try {
    const { confirmationId } = params
    const body = await req.json()
    const { isExecuted, executionTxHash } = body

    // Validate input
    if (typeof isExecuted !== 'boolean') {
      return errorResponse('isExecuted must be a boolean', 400, req)
    }

    // Check if confirmation exists
    const [confirmation] = await db
      .select()
      .from(tradeConfirmationsTable)
      .where(eq(tradeConfirmationsTable.confirmationId, confirmationId))
      .limit(1)

    if (!confirmation) {
      return errorResponse('Confirmation not found', 404, req)
    }

    // Update confirmation
    const updateData: any = {
      isExecuted,
      updatedAt: new Date()
    }

    if (executionTxHash) {
      updateData.executionTxHash = executionTxHash
    }

    const [updated] = await db
      .update(tradeConfirmationsTable)
      .set(updateData)
      .where(eq(tradeConfirmationsTable.confirmationId, confirmationId))
      .returning()

    // Emit SSE event for real-time updates
    emitConfirmationEvent(updated)

    return successResponse(updated, 'Confirmation updated', 200, req)
  } catch (e: any) {
    return serverErrorResponse(e, req)
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: { confirmationId: string } }
) {
  try {
    const { confirmationId } = params

    const [confirmation] = await db
      .select()
      .from(tradeConfirmationsTable)
      .where(eq(tradeConfirmationsTable.confirmationId, confirmationId))
      .limit(1)

    if (!confirmation) {
      return errorResponse('Confirmation not found', 404, req)
    }

    return successResponse(confirmation, 'Confirmation retrieved', 200, req)
  } catch (e: any) {
    return serverErrorResponse(e, req)
  }
}