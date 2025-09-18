import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db/db';
import { tradeConfirmationsTable } from '@/db/schema';
import { eq, and, desc, or } from 'drizzle-orm';
import { ethers } from 'ethers';
import { z } from 'zod';
import { tradeLifecycleService, TradeStatus } from '@/lib/services/trade-lifecycle.service';
import { encryptionService } from '@/lib/services/encryption.service';

const GetTradesSchema = z.object({
  address: z.string().regex(/^0x[a-fA-F0-9]{40}$/).optional(),
  status: z.enum(['pending', 'executed', 'rejected', 'expired']).optional(),
  generatorAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/).optional(),
  limit: z.number().min(1).max(100).default(50),
  offset: z.number().min(0).default(0),
});

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    
    const params = {
      address: searchParams.get('address') || undefined,
      status: searchParams.get('status') as TradeStatus | undefined,
      generatorAddress: searchParams.get('generator') || undefined,
      limit: parseInt(searchParams.get('limit') || '50'),
      offset: parseInt(searchParams.get('offset') || '0'),
    };
    
    const validation = GetTradesSchema.safeParse(params);
    if (!validation.success) {
      return NextResponse.json({
        error: 'Invalid query parameters',
        details: validation.error.errors,
      }, { status: 400 });
    }
    
    const { address, status, generatorAddress, limit, offset } = validation.data;
    
    let trades: any[] = [];
    
    if (address) {
      trades = await tradeLifecycleService.getTradesByConsumer(address, status);
    } else {
      let query = db
        .select()
        .from(tradeConfirmationsTable)
        .orderBy(desc(tradeConfirmationsTable.createdAt))
        .limit(limit)
        .offset(offset);
      
      const conditions: any[] = [];
      
      if (status) {
        conditions.push(eq(tradeConfirmationsTable.status, status));
      }
      
      if (generatorAddress) {
        conditions.push(eq(tradeConfirmationsTable.alphaGeneratorAddress, generatorAddress));
      }
      
      if (conditions.length > 0) {
        query = query.where(and(...conditions));
      }
      
      trades = await query;
    }
    
    const decryptedTrades = await Promise.all(
      trades.map(async (trade) => {
        try {
          const realAddress = await encryptionService.decryptAddress(
            trade.alphaConsumerAddress,
            trade.alphaGeneratorAddress
          );
          return {
            ...trade,
            realConsumerAddress: realAddress,
            encryptedConsumerAddress: trade.alphaConsumerAddress,
          };
        } catch {
          return {
            ...trade,
            realConsumerAddress: null,
            encryptedConsumerAddress: trade.alphaConsumerAddress,
          };
        }
      })
    );
    
    return NextResponse.json({
      data: decryptedTrades,
      count: decryptedTrades.length,
      pagination: {
        limit,
        offset,
        hasMore: trades.length === limit,
      },
    }, { status: 200 });
  } catch (error: any) {
    console.error('[Trades] GET error:', error);
    return NextResponse.json({
      error: 'Failed to fetch trades',
      details: error.message,
    }, { status: 500 });
  }
}