import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db/db';
import { subscriptionsTable, addressMappingsTable, alphaGeneratorsTable } from '@/db/schema';
import { eq, and, sql } from 'drizzle-orm';
import { ethers } from 'ethers';
import { encryptionService } from '@/lib/services/encryption.service';
import { z } from 'zod';

const SubscribeSchema = z.object({
  subscriberWallet: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
  subscriptionTxHash: z.string().regex(/^0x[a-fA-F0-9]{64}$/),
  metadata: z.record(z.any()).optional(),
});

export async function POST(
  req: NextRequest, 
  { params }: { params: { address: string } }
) {
  try {
    const generatorAddress = params.address;
    const body = await req.json();
    
    const validation = SubscribeSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({
        error: 'Invalid request data',
        details: validation.error.errors,
      }, { status: 400 });
    }
    
    const { subscriberWallet, subscriptionTxHash, metadata } = validation.data;
    
    if (!ethers.isAddress(generatorAddress)) {
      return NextResponse.json({
        error: 'Invalid generator address format',
      }, { status: 400 });
    }
    
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
    
    const provider = new ethers.JsonRpcProvider(
      process.env.BLOCKCHAIN_RPC_URL || 'http://localhost:8545'
    );
    
    let receipt;
    try {
      receipt = await provider.getTransactionReceipt(subscriptionTxHash);
      if (!receipt || receipt.status !== 1) {
        return NextResponse.json({
          error: 'Invalid subscription transaction',
        }, { status: 400 });
      }
    } catch (txError) {
      console.log('[Subscribe] Could not verify transaction, proceeding anyway:', txError);
    }
    
    const { encryptedAddress, encryptedData } = await encryptionService.encryptAddress(
      subscriberWallet,
      generatorAddress
    );
    
    const [existing] = await db
      .select()
      .from(subscriptionsTable)
      .where(
        and(
          eq(subscriptionsTable.alphaGeneratorAddress, generatorAddress),
          eq(subscriptionsTable.alphaConsumerAddress, subscriberWallet),
          eq(subscriptionsTable.isActive, true)
        )
      )
      .limit(1);
    
    if (existing) {
      return NextResponse.json({
        data: existing,
        message: 'Already subscribed',
      }, { status: 200 });
    }
    
    const [subscription] = await db
      .insert(subscriptionsTable)
      .values({
        alphaGeneratorAddress: generatorAddress,
        alphaConsumerAddress: subscriberWallet,
        encryptedConsumerAddress: encryptedAddress,
        subscriptionTxHash,
        subscriptionType: 'generator',
        encryptionVersion: 1,
        isActive: true,
        metadata: {
          ...metadata,
          encryptedData: encryptedData,
        },
      })
      .returning();
    
    await db
      .update(alphaGeneratorsTable)
      .set({
        currentSubscribers: sql`COALESCE(${alphaGeneratorsTable.currentSubscribers}, 0)::numeric + 1`,
        updatedAt: new Date(),
      })
      .where(eq(alphaGeneratorsTable.generatorAddress, generatorAddress));
    
    console.log(`[Subscribe] New generator subscription: ${generatorAddress} <- ${subscriberWallet}`);
    
    return NextResponse.json({
      data: {
        ...subscription,
        encryptedAddress,
      },
      message: 'Successfully subscribed to alpha generator',
    }, { status: 201 });
  } catch (error: any) {
    console.error('[Subscribe] Error:', error);
    return NextResponse.json({
      error: 'Internal server error',
      details: error.message,
    }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest, 
  { params }: { params: { address: string } }
) {
  try {
    const generatorAddress = params.address;
    const searchParams = req.nextUrl.searchParams;
    const subscriberWallet = searchParams.get('subscriber');
    
    if (!subscriberWallet) {
      return NextResponse.json({
        error: 'Subscriber address is required',
      }, { status: 400 });
    }
    
    if (!ethers.isAddress(generatorAddress) || !ethers.isAddress(subscriberWallet)) {
      return NextResponse.json({
        error: 'Invalid address format',
      }, { status: 400 });
    }
    
    const [subscription] = await db
      .update(subscriptionsTable)
      .set({
        isActive: false,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(subscriptionsTable.alphaGeneratorAddress, generatorAddress),
          eq(subscriptionsTable.alphaConsumerAddress, subscriberWallet),
          eq(subscriptionsTable.isActive, true)
        )
      )
      .returning();
    
    if (!subscription) {
      return NextResponse.json({
        error: 'Subscription not found',
      }, { status: 404 });
    }
    
    await db
      .update(alphaGeneratorsTable)
      .set({
        currentSubscribers: sql`GREATEST(COALESCE(${alphaGeneratorsTable.currentSubscribers}, 1)::numeric - 1, 0)`,
        updatedAt: new Date(),
      })
      .where(eq(alphaGeneratorsTable.generatorAddress, generatorAddress));
    
    console.log(`[Unsubscribe] Cancelled subscription: ${generatorAddress} <- ${subscriberWallet}`);
    
    return NextResponse.json({
      data: subscription,
      message: 'Successfully unsubscribed',
    }, { status: 200 });
  } catch (error: any) {
    console.error('[Unsubscribe] Error:', error);
    return NextResponse.json({
      error: 'Internal server error',
      details: error.message,
    }, { status: 500 });
  }
}