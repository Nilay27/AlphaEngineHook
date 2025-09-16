import { NextRequest } from 'next/server'
import { db } from '@/db/db'
import { tradeConfirmationsTable } from '@/db/schema/trade-confirmations-schema'
import { eq, and } from 'drizzle-orm'
import { successResponse, errorResponse, serverErrorResponse } from '@/app/api/api-utils'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    const addr = req.nextUrl.searchParams.get('alphaConsumerAddress')
    if (!addr) {
      return errorResponse('alphaConsumerAddress is required', 400, req)
    }
    
    const data = await db.select().from(tradeConfirmationsTable).where(
      and(
        eq(tradeConfirmationsTable.alphaConsumerAddress, addr), 
        eq(tradeConfirmationsTable.isExecuted, false)
      )
    )
    
    return successResponse(data, 'OK', 200, req)
  } catch (e: any) {
    return serverErrorResponse(e, req)
  }
}