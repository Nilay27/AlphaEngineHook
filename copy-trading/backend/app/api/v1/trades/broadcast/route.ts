import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db/db';
import { alphaGeneratorsTable } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { ethers } from 'ethers';
import { z } from 'zod';
import { tradeLifecycleService } from '@/lib/services/trade-lifecycle.service';
import { ProtocolConfigService } from '@/lib/services/protocol-config.service';
import { ProtocolAction } from '@/lib/protocols/action-mappings';

const BroadcastTradeSchema = z.object({
  generatorAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
  protocolId: z.string(),
  action: z.nativeEnum(ProtocolAction),
  params: z.record(z.any()),
  expiryMinutes: z.number().min(1).max(60).default(5),
  gasLimit: z.string().optional(),
  value: z.string().optional(),
  metadata: z.record(z.any()).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    const validation = BroadcastTradeSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({
        error: 'Invalid request data',
        details: validation.error.errors,
      }, { status: 400 });
    }
    
    const { 
      generatorAddress, 
      protocolId, 
      action, 
      params, 
      expiryMinutes,
      gasLimit,
      value,
      metadata 
    } = validation.data;
    
    const [generator] = await db
      .select()
      .from(alphaGeneratorsTable)
      .where(eq(alphaGeneratorsTable.generatorAddress, generatorAddress))
      .limit(1);
    
    if (!generator || !generator.isActive) {
      return NextResponse.json({
        error: 'Generator not found or inactive',
      }, { status: 404 });
    }
    
    const protocolValidation = await ProtocolConfigService.validateProtocolAction(
      protocolId,
      action,
      params
    );
    
    if (!protocolValidation.valid) {
      return NextResponse.json({
        error: 'Invalid protocol action',
        details: protocolValidation.errors,
      }, { status: 400 });
    }
    
    const encodedData = await ProtocolConfigService.encodeExecutionData({
      protocolId,
      action,
      params,
      gasLimit: gasLimit ? BigInt(gasLimit) : undefined,
      value: value ? BigInt(value) : undefined,
    });
    
    const expiryTime = new Date(Date.now() + expiryMinutes * 60 * 1000);
    
    const confirmationIds = await tradeLifecycleService.broadcastTrade({
      generatorAddress,
      protocolId,
      action,
      executionData: encodedData.encoded,
      expiryTime,
      gasEstimate: encodedData.gasEstimate,
      metadata: {
        ...metadata,
        protocolAddress: encodedData.protocolAddress,
        value: encodedData.value.toString(),
        params,
      },
    });
    
    await db
      .update(alphaGeneratorsTable)
      .set({
        performanceStats: {
          totalTrades: (generator.performanceStats as any)?.totalTrades + 1 || 1,
          successRate: (generator.performanceStats as any)?.successRate || 0,
          avgReturns: (generator.performanceStats as any)?.avgReturns || 0,
          totalVolume: (generator.performanceStats as any)?.totalVolume || 0,
        },
        updatedAt: new Date(),
      })
      .where(eq(alphaGeneratorsTable.generatorAddress, generatorAddress));
    
    console.log(
      `[BroadcastTrade] Broadcasted trade from ${generatorAddress}: ${protocolId}/${action}`
    );
    
    return NextResponse.json({
      data: {
        confirmationIds,
        subscriberCount: confirmationIds.length,
        expiryTime,
        trade: {
          generatorAddress,
          protocolId,
          action,
          params,
          gasEstimate: encodedData.gasEstimate.toString(),
        },
      },
      message: `Trade broadcasted to ${confirmationIds.length} subscribers`,
    }, { status: 201 });
  } catch (error: any) {
    console.error('[BroadcastTrade] Error:', error);
    return NextResponse.json({
      error: 'Failed to broadcast trade',
      details: error.message,
    }, { status: 500 });
  }
}