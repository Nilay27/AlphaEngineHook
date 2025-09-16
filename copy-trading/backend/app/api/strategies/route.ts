import { NextRequest } from 'next/server'
import { db } from '@/db/db'
import { strategiesTable } from '@/db/schema/strategies-schema'
import { desc } from 'drizzle-orm'
import { successResponse, errorResponse, serverErrorResponse } from '@/app/api/api-utils'

export async function GET(req: NextRequest) {
  try {
    const data = await db.select().from(strategiesTable).orderBy(desc(strategiesTable.createdAt));
    return successResponse(data, 'OK', 200, req)
  } catch (e: any) {
    return serverErrorResponse(e, req)
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    // Validate required fields
    if (!body.strategyName || !body.alphaGeneratorAddress) {
      return errorResponse('strategyName and alphaGeneratorAddress are required', 400, req)
    }

    // Validate alphaGeneratorAddress format (basic Ethereum address check)
    if (!/^0x[a-fA-F0-9]{40}$/.test(body.alphaGeneratorAddress)) {
      return errorResponse('Invalid alphaGeneratorAddress format', 400, req)
    }

    const [row] = await db.insert(strategiesTable).values({
      strategyName: body.strategyName,
      strategyDescription: body.strategyDescription || '',
      subscriptionFee: body.subscriptionFee || '0',
      supportedProtocols: body.supportedProtocols || [],
      strategyJSON: body.strategyJSON || {},
      alphaGeneratorAddress: body.alphaGeneratorAddress,
    }).returning()
    return successResponse(row, 'Created', 201, req)
  } catch (e: any) {
    return serverErrorResponse(e, req)
  }
}