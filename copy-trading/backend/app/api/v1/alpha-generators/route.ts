import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db/db';
import { alphaGeneratorsTable } from '@/db/schema';
import { eq, and, desc } from 'drizzle-orm';
import { ethers } from 'ethers';
import { z } from 'zod';
import { createLogger } from '@/lib/logger';

const logger = createLogger('AlphaGenerators');

const RegisterGeneratorSchema = z.object({
  generatorAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
  feePercentage: z.number().min(0).max(100).optional(),
  minSubscriptionAmount: z.string().optional(),
  maxSubscribers: z.number().min(1).optional(),
  metadata: z.record(z.any()).optional(),
});

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const isActive = searchParams.get('active') !== 'false';
    
    const generators = await db
      .select()
      .from(alphaGeneratorsTable)
      .where(eq(alphaGeneratorsTable.isActive, isActive))
      .orderBy(desc(alphaGeneratorsTable.registeredAt));

    // Transform snake_case to camelCase and extract metadata fields
    const transformedGenerators = generators.map(gen => {
      const metadata = gen.metadata as any || {};
      return {
        generatorId: gen.generatorId,
        walletAddress: metadata.walletAddress || gen.generatorAddress,
        displayName: metadata.displayName || gen.name,
        description: gen.description,
        subscriptionFee: metadata.subscriptionFee || gen.minSubscriptionAmount,
        performanceFee: Number(gen.feePercentage) || 0,
        totalSubscribers: Number(gen.currentSubscribers) || 0,
        totalVolume: metadata.totalVolume || '0',
        rating: metadata.rating || 0,
        isVerified: metadata.verified || false,
        isActive: gen.isActive,
        metadata: gen.metadata || {},
        createdAt: gen.registeredAt,
        updatedAt: gen.updatedAt,
      };
    });

    return NextResponse.json({
      data: transformedGenerators,
      count: transformedGenerators.length,
    }, { status: 200 });
  } catch (error: any) {
    logger.error('GET error:', error);
    return NextResponse.json({
      error: 'Failed to fetch alpha generators',
      details: error.message,
    }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    const validation = RegisterGeneratorSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({
        error: 'Invalid request data',
        details: validation.error.errors,
      }, { status: 400 });
    }
    
    const { 
      generatorAddress, 
      name, 
      description, 
      feePercentage,
      minSubscriptionAmount,
      maxSubscribers,
      metadata 
    } = validation.data;
    
    if (!ethers.isAddress(generatorAddress)) {
      return NextResponse.json({
        error: 'Invalid Ethereum address format',
      }, { status: 400 });
    }
    
    const [existing] = await db
      .select()
      .from(alphaGeneratorsTable)
      .where(eq(alphaGeneratorsTable.generatorAddress, generatorAddress))
      .limit(1);
    
    if (existing) {
      const [updated] = await db
        .update(alphaGeneratorsTable)
        .set({
          name: name || existing.name,
          description: description || existing.description,
          feePercentage: feePercentage?.toString() || existing.feePercentage,
          minSubscriptionAmount: minSubscriptionAmount || existing.minSubscriptionAmount,
          maxSubscribers: maxSubscribers?.toString() || existing.maxSubscribers,
          metadata: metadata || existing.metadata,
          isActive: true,
          updatedAt: new Date(),
        })
        .where(eq(alphaGeneratorsTable.generatorAddress, generatorAddress))
        .returning();
      
      return NextResponse.json({
        data: updated,
        message: 'Alpha generator updated successfully',
      }, { status: 200 });
    }
    
    const [generator] = await db
      .insert(alphaGeneratorsTable)
      .values({
        generatorAddress,
        name: name || `Generator ${generatorAddress.slice(0, 6)}...${generatorAddress.slice(-4)}`,
        description,
        feePercentage: feePercentage?.toString() || '1.00',
        minSubscriptionAmount: minSubscriptionAmount || '0',
        maxSubscribers: maxSubscribers?.toString(),
        encryptionSupport: true,
        isActive: true,
        metadata: metadata || {},
        performanceStats: {
          totalTrades: 0,
          successRate: 0,
          avgReturns: 0,
          totalVolume: 0,
        },
      })
      .returning();
    
    logger.info(`Registered new generator: ${generatorAddress}`);
    
    return NextResponse.json({
      data: generator,
      message: 'Alpha generator registered successfully',
    }, { status: 201 });
  } catch (error: any) {
    logger.error('POST error:', error);
    return NextResponse.json({
      error: 'Failed to register alpha generator',
      details: error.message,
    }, { status: 500 });
  }
}