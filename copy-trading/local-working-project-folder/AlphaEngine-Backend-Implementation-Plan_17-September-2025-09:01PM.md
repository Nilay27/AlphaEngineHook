# AlphaEngine Backend Implementation Plan

**File Created**: 17-September-2025-09:01PM IST
**Version**: 1.0.0
**Status**: READY FOR EXECUTION
**Track**: BACKEND (B)

## CHANGELOG
- **17-September-2025-09:01PM IST**: Initial creation of Backend implementation plan with 5 atomic steps
- **17-September-2025-10:36PM IST**: Added Foundry migration notes for contract ABI verification and deployment paths

---

## Execution Plan - Backend Track

<execution-plan track="backend">

<step-format>
- [ ] **Step B1: Create database schema migrations**
    - **Task**: Create and apply database schema for address mappings and subscription enhancements
    - **EXPLANATION**:
        - **What** → Database tables for encrypted address storage and protocol configurations
        - **Where** → `/Users/consentsam/blockchain/copy-trading/backend/db/schema/address-mappings-schema.ts`
        - **Why** → Foundation for storing FHE-encrypted addresses and subscription mappings
    - **Files to Check/Create/Update**: address-mappings-schema.ts, subscriptions-schema.ts, index.ts
    - **Step Dependencies**: None
    - **Step Completion Summary (YYYY-MM-DD HH:MM)**: {{placeholder}}
    - **Status**: To Do
    - **Prompt for verification of elizaOS**: Verify that the database schema includes address_mappings table with columns for real_address, encrypted_address, encrypted_data, and alpha_generator_address
    - **Files Modified/Created**:
        - address-mappings-schema.ts
            <filePath="/Users/consentsam/blockchain/copy-trading/backend/db/schema/address-mappings-schema.ts">
```typescript
import { pgTable, uuid, text, varchar, jsonb, timestamp, index, uniqueIndex } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const addressMappingsTable = pgTable("address_mappings", {
  mappingId: uuid("mapping_id").primaryKey().default(sql`gen_random_uuid()`),
  realAddress: varchar("real_address", { length: 42 }).notNull(),
  encryptedAddress: text("encrypted_address").notNull().unique(),
  encryptedData: text("encrypted_data").notNull(),  // Stores full encrypted FHE data
  alphaGeneratorAddress: varchar("alpha_generator_address", { length: 42 }).notNull(),
  subscriptionId: uuid("subscription_id"),  // Optional reference to subscriptions table
  createdAt: timestamp("created_at", { withTimezone: true }).default(sql`now()`).notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).default(sql`now()`).notNull(),
}, (table) => {
  return {
    realAddressIdx: index("idx_address_mappings_real").on(table.realAddress),
    encryptedAddressIdx: index("idx_address_mappings_encrypted").on(table.encryptedAddress),
    generatorIdx: index("idx_address_mappings_generator").on(table.alphaGeneratorAddress),
    subscriptionIdx: index("idx_address_mappings_subscription").on(table.subscriptionId),
    lookupIdx: index("idx_address_mapping_lookup").on(table.realAddress, table.alphaGeneratorAddress),
    uniqueMapping: uniqueIndex("unique_subscription_mapping").on(table.realAddress, table.alphaGeneratorAddress),
  }
});

export type AddressMapping = typeof addressMappingsTable.$inferSelect;
export type NewAddressMapping = typeof addressMappingsTable.$inferInsert;
```
            </filePath>
        - subscriptions-schema.ts
            <filePath="/Users/consentsam/blockchain/copy-trading/backend/db/schema/subscriptions-schema.ts">
```typescript
import { pgTable, uuid, varchar, text, timestamp, boolean, jsonb, integer } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

// Enhanced subscriptions table with FHE support
export const subscriptionsTable = pgTable("subscriptions", {
  subscriptionId: uuid("subscription_id").primaryKey().default(sql`gen_random_uuid()`),
  alphaGeneratorAddress: varchar("alpha_generator_address", { length: 42 }),
  alphaConsumerAddress: varchar("alpha_consumer_address", { length: 42 }).notNull(),
  encryptedConsumerAddress: text("encrypted_consumer_address"),
  subscriptionType: varchar("subscription_type", { length: 20 }).default("generator"),
  encryptionVersion: integer("encryption_version").default(1),
  subscriptionTxHash: varchar("subscription_tx_hash", { length: 66 }),
  isActive: boolean("is_active").default(true),
  metadata: jsonb("metadata").default({}),
  createdAt: timestamp("created_at", { withTimezone: true }).default(sql`now()`).notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).default(sql`now()`).notNull(),
});

export type Subscription = typeof subscriptionsTable.$inferSelect;
export type NewSubscription = typeof subscriptionsTable.$inferInsert;
```
            </filePath>
        - index.ts
            <filePath="/Users/consentsam/blockchain/copy-trading/backend/db/schema/index.ts">
```typescript
export * from "./address-mappings-schema";
export * from "./subscriptions-schema";
export * from "./alpha-generators-schema";
export * from "./trade-confirmations-schema";
export * from "./protocols-schema";
```
            </filePath>
    - **Summary of Changes & Reasoning**: Created comprehensive database schema for FHE-encrypted address mappings with proper indexing for efficient lookups. Added support for subscription types and encryption versioning for backward compatibility.
    - **IMPORTANT NOTE**: The alpha_generators table schema must include a `performanceFee` field (integer for basis points where 100 = 1%) to match the Smart Contract structure.
</step-format>

<step-format>
- [ ] **Step B2: Implement FHE encryption service**
    - **Task**: Create FhenixClient-based encryption service for address encryption and decryption
    - **EXPLANATION**:
        - **What** → Core service for encrypting addresses using Fhenix FHE library
        - **Where** → `/Users/consentsam/blockchain/copy-trading/backend/src/services/encryption.service.ts`
        - **Why** → Required for privacy-preserving subscription system with encrypted addresses
    - **Files to Check/Create/Update**: encryption.service.ts, package.json
    - **Step Dependencies**: B1
    - **Step Completion Summary (YYYY-MM-DD HH:MM)**: {{placeholder}}
    - **Status**: To Do
    - **Prompt for verification of elizaOS**: Test that the encryption service can successfully encrypt an Ethereum address and store the mapping in the database
    - **Files Modified/Created**:
        - encryption.service.ts
            <filePath="/Users/consentsam/blockchain/copy-trading/backend/src/services/encryption.service.ts">
```typescript
import { ethers } from 'ethers';
import { FhenixClient } from 'fhenixjs';
import { db } from '@/db/db';
import { addressMappingsTable } from '@/db/schema';
import { eq, and, sql } from 'drizzle-orm';

export class FHEEncryptionService {
  private fhenixClient: FhenixClient;
  private provider: ethers.Provider;
  private initialized = false;

  constructor() {
    this.provider = new ethers.JsonRpcProvider(process.env.FHENIX_NETWORK_URL || 'http://localhost:8545');
    // Contract address should be in environment variable
    // process.env.ALPHAENGINE_CONTRACT_ADDRESS
    this.initializeFHE();
  }

  private async initializeFHE() {
    if (this.initialized) return;

    // Initialize Fhenix client with provider
    this.fhenixClient = new FhenixClient({
      provider: this.provider
    });

    this.initialized = true;
  }

  /**
   * Encrypt an address for a specific generator
   */
  async encryptAddress(
    realAddress: string,
    generatorAddress: string
  ): Promise<{
    encryptedAddress: string;
    encryptedData: any;
  }> {
    await this.initializeFHE();

    // Validate addresses
    if (!ethers.isAddress(realAddress) || !ethers.isAddress(generatorAddress)) {
      throw new Error('Invalid address format');
    }

    // Check for existing mapping
    const existing = await db
      .select()
      .from(addressMappingsTable)
      .where(
        and(
          eq(addressMappingsTable.realAddress, realAddress),
          eq(addressMappingsTable.alphaGeneratorAddress, generatorAddress)
        )
      )
      .limit(1);

    if (existing.length > 0) {
      return {
        encryptedAddress: existing[0].encryptedAddress,
        encryptedData: JSON.parse(existing[0].encryptedData || '{}')
      };
    }

    // Encrypt using Fhenix client - no encryption key parameter
    const encrypted = await this.fhenixClient.encrypt(
      realAddress,
      'address'
    );

    // Generate identifier for database storage (not for encryption)
    const encryptedIdentifier = ethers.keccak256(
      ethers.solidityPacked(
        ['address', 'address', 'bytes'],
        [generatorAddress, realAddress, ethers.toUtf8Bytes('FHE_V1')]
      )
    );

    // Store mapping in database
    const [mapping] = await db
      .insert(addressMappingsTable)
      .values({
        realAddress,
        encryptedAddress: encryptedIdentifier,
        encryptedData: JSON.stringify(encrypted),
        alphaGeneratorAddress: generatorAddress,
      })
      .returning();

    return {
      encryptedAddress: mapping.encryptedAddress,
      encryptedData: encrypted
    };
  }

  /**
   * Resolve encrypted addresses to real addresses
   */
  async resolveEncryptedAddresses(
    encryptedAddresses: string[]
  ): Promise<Map<string, string>> {
    const mappings = await db
      .select()
      .from(addressMappingsTable)
      .where(sql`${addressMappingsTable.encryptedAddress} = ANY(${encryptedAddresses})`);

    const addressMap = new Map<string, string>();
    for (const mapping of mappings) {
      addressMap.set(mapping.encryptedAddress, mapping.realAddress);
    }

    return addressMap;
  }

  /**
   * Decrypt address (internal use only)
   */
  async decryptAddress(
    encryptedAddress: string,
    generatorAddress: string
  ): Promise<string | null> {
    const [mapping] = await db
      .select()
      .from(addressMappingsTable)
      .where(
        and(
          eq(addressMappingsTable.encryptedAddress, encryptedAddress),
          eq(addressMappingsTable.alphaGeneratorAddress, generatorAddress)
        )
      )
      .limit(1);

    return mapping?.realAddress || null;
  }

  /**
   * Prepare encrypted data for smart contract call
   */
  async prepareForContract(encryptedData: any): Promise<{
    data: string;
    proof: string;
  }> {
    if (typeof encryptedData === 'string') {
      encryptedData = JSON.parse(encryptedData);
    }

    return {
      data: encryptedData.data || encryptedData.ciphertext,
      proof: encryptedData.proof || '0x'
    };
  }
}

export const encryptionService = new FHEEncryptionService();
```
            </filePath>
        - package.json
            <filePath="/Users/consentsam/blockchain/copy-trading/backend/package.json">
```json
{
  "name": "alphaengine-backend",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "db:push": "drizzle-kit push:pg",
    "db:migrate": "drizzle-kit migrate",
    "db:studio": "drizzle-kit studio"
  },
  "dependencies": {
    "@types/node": "^20.11.5",
    "@types/react": "^18.2.48",
    "drizzle-orm": "^0.30.1",
    "drizzle-kit": "^0.21.0",
    "ethers": "^6.10.0",
    "fhenixjs": "^0.2.0",
    "next": "^14.1.0",
    "postgres": "^3.4.3",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "typescript": "^5.3.3",
    "zod": "^3.22.4"
  },
  "devDependencies": {
    "@types/node": "^20.11.5",
    "eslint": "^8.56.0",
    "prettier": "^3.2.4"
  }
}
```
            </filePath>
    - **Summary of Changes & Reasoning**: Implemented FHE encryption service using FhenixClient for secure address encryption. Service handles address validation, database storage, and provides methods for contract interaction preparation.
</step-format>

<step-format>
- [ ] **Step B3: Create protocol configuration service**
    - **Task**: Implement flexible protocol action mapping system for multiple DeFi protocols
    - **EXPLANATION**:
        - **What** → Service for managing protocol-specific actions without smart contract changes
        - **Where** → `/Users/consentsam/blockchain/copy-trading/backend/src/lib/protocols/action-mappings.ts`
        - **Why** → Enables support for unlimited protocol actions dynamically
    - **Files to Check/Create/Update**: action-mappings.ts, protocol-config.service.ts
    - **Step Dependencies**: B1
    - **Step Completion Summary (YYYY-MM-DD HH:MM)**: {{placeholder}}
    - **Status**: To Do
    - **Prompt for verification of elizaOS**: Verify that the protocol configuration service supports Uniswap, Aave, GMX, and can validate actions like swap, buy, sell, deposit
    - **Files Modified/Created**:
        - action-mappings.ts
            <filePath="/Users/consentsam/blockchain/copy-trading/backend/src/lib/protocols/action-mappings.ts">
```typescript
export type ProtocolAction = {
  name: string;
  displayName: string;
  description: string;
  icon: string;
  requiresTokenIn: boolean;
  requiresTokenOut: boolean;
  gasMultiplier?: number;
  requiresApproval?: boolean;
  additionalParams?: string[];
};

export const PROTOCOL_CONFIGS: Record<string, {
  name: string;
  actions: Record<string, ProtocolAction>;
}> = {
  uniswap: {
    name: 'Uniswap V3',
    actions: {
      buy: {
        name: 'buy',
        displayName: 'Buy Token',
        description: 'Buy tokens with ETH or stablecoins',
        icon: '🟢',
        requiresTokenIn: true,
        requiresTokenOut: true,
        requiresApproval: false,
      },
      sell: {
        name: 'sell',
        displayName: 'Sell Token',
        description: 'Sell tokens for ETH or stablecoins',
        icon: '🔴',
        requiresTokenIn: true,
        requiresTokenOut: true,
        requiresApproval: true,
      },
      swap: {
        name: 'swap',
        displayName: 'Swap Tokens',
        description: 'Exchange between any two tokens',
        icon: '🔄',
        requiresTokenIn: true,
        requiresTokenOut: true,
        requiresApproval: true,
      },
      addLiquidity: {
        name: 'addLiquidity',
        displayName: 'Add Liquidity',
        description: 'Provide liquidity to a pool',
        icon: '➕',
        requiresTokenIn: true,
        requiresTokenOut: true,
        requiresApproval: true,
        additionalParams: ['tickLower', 'tickUpper', 'fee'],
        gasMultiplier: 1.5,
      },
      removeLiquidity: {
        name: 'removeLiquidity',
        displayName: 'Remove Liquidity',
        description: 'Remove liquidity from a pool',
        icon: '➖',
        requiresTokenIn: false,
        requiresTokenOut: false,
        additionalParams: ['tokenId', 'liquidity'],
        gasMultiplier: 1.3,
      },
    },
  },
  aave: {
    name: 'Aave V3',
    actions: {
      deposit: {
        name: 'deposit',
        displayName: 'Deposit',
        description: 'Deposit assets to earn yield',
        icon: '💰',
        requiresTokenIn: true,
        requiresTokenOut: false,
        requiresApproval: true,
      },
      withdraw: {
        name: 'withdraw',
        displayName: 'Withdraw',
        description: 'Withdraw deposited assets',
        icon: '📤',
        requiresTokenIn: false,
        requiresTokenOut: true,
        requiresApproval: false,
      },
      borrow: {
        name: 'borrow',
        displayName: 'Borrow',
        description: 'Borrow against collateral',
        icon: '🏦',
        requiresTokenIn: false,
        requiresTokenOut: true,
        requiresApproval: false,
        additionalParams: ['interestRateMode'],
      },
      repay: {
        name: 'repay',
        displayName: 'Repay',
        description: 'Repay borrowed assets',
        icon: '💸',
        requiresTokenIn: true,
        requiresTokenOut: false,
        requiresApproval: true,
        additionalParams: ['interestRateMode'],
      },
    },
  },
  gmx: {
    name: 'GMX V2',
    actions: {
      openLong: {
        name: 'openLong',
        displayName: 'Long Position',
        description: 'Open leveraged long position',
        icon: '📈',
        requiresTokenIn: true,
        requiresTokenOut: false,
        requiresApproval: true,
        additionalParams: ['leverage', 'indexToken', 'collateralToken'],
        gasMultiplier: 2.0,
      },
      openShort: {
        name: 'openShort',
        displayName: 'Short Position',
        description: 'Open leveraged short position',
        icon: '📉',
        requiresTokenIn: true,
        requiresTokenOut: false,
        requiresApproval: true,
        additionalParams: ['leverage', 'indexToken', 'collateralToken'],
        gasMultiplier: 2.0,
      },
      closePosition: {
        name: 'closePosition',
        displayName: 'Close Position',
        description: 'Close existing position',
        icon: '✖️',
        requiresTokenIn: false,
        requiresTokenOut: true,
        additionalParams: ['positionKey', 'sizeDelta'],
        gasMultiplier: 1.5,
      },
    },
  },
  '1inch': {
    name: '1inch Aggregator',
    actions: {
      swap: {
        name: 'swap',
        displayName: 'Optimized Swap',
        description: 'Best rate swap through aggregation',
        icon: '🦄',
        requiresTokenIn: true,
        requiresTokenOut: true,
        requiresApproval: true,
        additionalParams: ['routeData', 'permitData'],
      },
      limitOrder: {
        name: 'limitOrder',
        displayName: 'Limit Order',
        description: 'Place limit order',
        icon: '📊',
        requiresTokenIn: true,
        requiresTokenOut: true,
        requiresApproval: true,
        additionalParams: ['makerRate', 'expiry', 'nonce'],
        gasMultiplier: 0.8,
      },
    },
  },
  generic: {
    name: 'Generic Protocol',
    actions: {
      execute: {
        name: 'execute',
        displayName: 'Execute Trade',
        description: 'Generic trade execution',
        icon: '⚡',
        requiresTokenIn: false,
        requiresTokenOut: false,
        additionalParams: ['customData'],
      },
    },
  },
};

export function getProtocolActions(protocol: string): string[] {
  const config = PROTOCOL_CONFIGS[protocol.toLowerCase()] || PROTOCOL_CONFIGS.generic;
  return Object.keys(config.actions);
}

export function isValidAction(protocol: string, action: string): boolean {
  const actions = getProtocolActions(protocol);
  return actions.includes(action);
}

export function getActionConfig(protocol: string, action: string): ProtocolAction | null {
  const config = PROTOCOL_CONFIGS[protocol.toLowerCase()] || PROTOCOL_CONFIGS.generic;
  return config?.actions[action] || null;
}

export function getSupportedProtocols(): string[] {
  return Object.keys(PROTOCOL_CONFIGS).filter(p => p !== 'generic');
}
```
            </filePath>
        - protocol-config.service.ts
            <filePath="/Users/consentsam/blockchain/copy-trading/backend/src/services/protocol-config.service.ts">
```typescript
import { ethers } from 'ethers';

export class ProtocolConfigService {
  /**
   * Encode execution parameters for smart contract
   * The smart contract receives this as bytes and doesn't need to understand it
   */
  static encodeExecutionData(params: {
    protocol: string;
    action: string;
    params: any;
  }): string {
    // Create a structured encoding that can be decoded later
    const encoded = ethers.AbiCoder.defaultAbiCoder().encode(
      ['string', 'string', 'bytes'],
      [
        params.protocol,
        params.action,
        ethers.AbiCoder.defaultAbiCoder().encode(
          ['address', 'address', 'uint256', 'uint256', 'bytes'],
          [
            params.params.tokenIn || ethers.ZeroAddress,
            params.params.tokenOut || ethers.ZeroAddress,
            ethers.parseEther(params.params.amount || '0'),
            params.params.slippage || 50, // 0.5% default
            ethers.toUtf8Bytes(JSON.stringify(params.params.data || {}))
          ]
        )
      ]
    );

    return encoded;
  }

  /**
   * Decode execution data from smart contract
   */
  static decodeExecutionData(encodedData: string): {
    protocol: string;
    action: string;
    tokenIn: string;
    tokenOut: string;
    amount: string;
    slippage: number;
    data: any;
  } {
    const [protocol, action, paramsBytes] = ethers.AbiCoder.defaultAbiCoder().decode(
      ['string', 'string', 'bytes'],
      encodedData
    );

    const [tokenIn, tokenOut, amount, slippage, dataBytes] =
      ethers.AbiCoder.defaultAbiCoder().decode(
        ['address', 'address', 'uint256', 'uint256', 'bytes'],
        paramsBytes
      );

    return {
      protocol,
      action,
      tokenIn,
      tokenOut,
      amount: ethers.formatEther(amount),
      slippage,
      data: JSON.parse(ethers.toUtf8String(dataBytes))
    };
  }

  /**
   * Validate execution parameters
   */
  static validateExecutionParams(params: any): boolean {
    if (!params.protocol || !params.action) {
      return false;
    }

    // Validate amounts if present
    if (params.amount) {
      try {
        ethers.parseEther(params.amount);
      } catch {
        return false;
      }
    }

    // Validate addresses if present
    if (params.tokenIn && !ethers.isAddress(params.tokenIn)) {
      return false;
    }
    if (params.tokenOut && !ethers.isAddress(params.tokenOut)) {
      return false;
    }

    return true;
  }
}
```
            </filePath>
    - **Summary of Changes & Reasoning**: Created comprehensive protocol configuration service supporting multiple DeFi protocols. System allows unlimited protocol actions without smart contract modifications through flexible string-based validation and encoding.
</step-format>

<step-format>
- [ ] **Step B4: Implement subscription API endpoints**
    - **Task**: Create REST API endpoints for generator subscription management
    - **EXPLANATION**:
        - **What** → API endpoints for subscribing to generators and managing subscriptions
        - **Where** → `/Users/consentsam/blockchain/copy-trading/backend/app/api/v1/alpha-generators/`
        - **Why** → Enable frontend to interact with subscription system and blockchain
    - **Files to Check/Create/Update**: subscribe/route.ts, generators/route.ts, verify/route.ts
    - **Step Dependencies**: B1, B2, B3
    - **Step Completion Summary (YYYY-MM-DD HH:MM)**: {{placeholder}}
    - **Status**: To Do
    - **Prompt for verification of elizaOS**: Test that POST /api/v1/alpha-generators/[address]/subscribe creates encrypted address mapping and stores subscription
    - **Files Modified/Created**:
        - subscribe/route.ts
            <filePath="/Users/consentsam/blockchain/copy-trading/backend/app/api/v1/alpha-generators/[address]/subscribe/route.ts">
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db/db';
import { subscriptionsTable, addressMappingsTable } from '@/db/schema';
import { eq, and, sql } from 'drizzle-orm';
import { ethers } from 'ethers';
import { encryptionService } from '@/services/encryption.service';
import { z } from 'zod';

const SubscribeSchema = z.object({
  subscriberWallet: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
  subscriptionTxHash: z.string().regex(/^0x[a-fA-F0-9]{64}$/),
});

export async function POST(
  req: NextRequest,
  { params }: { params: { address: string } }
) {
  try {
    const generatorAddress = params.address;
    const body = await req.json();

    // Validate request
    const validation = SubscribeSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: validation.error.errors },
        { status: 400 }
      );
    }

    const { subscriberWallet, subscriptionTxHash } = validation.data;

    // Validate generator address
    if (!ethers.isAddress(generatorAddress)) {
      return NextResponse.json(
        { error: 'Invalid generator address format' },
        { status: 400 }
      );
    }

    // Verify transaction on blockchain
    const provider = new ethers.JsonRpcProvider(process.env.BLOCKCHAIN_RPC_URL || 'http://localhost:8545');
    const receipt = await provider.getTransactionReceipt(subscriptionTxHash);

    if (!receipt || receipt.status !== 1) {
      return NextResponse.json(
        { error: 'Invalid subscription transaction' },
        { status: 400 }
      );
    }

    // Encrypt address for this generator
    const { encryptedAddress, encryptedData } = await encryptionService.encryptAddress(
      subscriberWallet,
      generatorAddress
    );

    // Check for existing subscription
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
      return NextResponse.json(
        {
          data: existing,
          message: 'Already subscribed'
        },
        { status: 200 }
      );
    }

    // Create subscription record
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
          encryptedData: encryptedData,
        },
      })
      .returning();

    console.log(
      `[Subscribe] New generator subscription: ${generatorAddress} <- ${subscriberWallet}`
    );

    return NextResponse.json(
      {
        data: {
          ...subscription,
          encryptedAddress,
        },
        message: 'Successfully subscribed to alpha generator'
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('[Subscribe] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: { address: string } }
) {
  try {
    const generatorAddress = params.address;

    // Get all active subscriptions for this generator
    const subscriptions = await db
      .select()
      .from(subscriptionsTable)
      .where(
        and(
          eq(subscriptionsTable.alphaGeneratorAddress, generatorAddress),
          eq(subscriptionsTable.isActive, true)
        )
      );

    return NextResponse.json(
      {
        data: subscriptions,
        count: subscriptions.length,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('[Subscribe GET] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
```
            </filePath>
        - generators/route.ts
            <filePath="/Users/consentsam/blockchain/copy-trading/backend/app/api/v1/alpha-generators/route.ts">
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db/db';
import { alphaGeneratorsTable } from '@/db/schema';
import { eq, desc, sql } from 'drizzle-orm';
import { z } from 'zod';

const CreateGeneratorSchema = z.object({
  walletAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
  displayName: z.string().optional(),
  description: z.string().optional(),
  subscriptionFee: z.string(),
  performanceFee: z.number().min(0).max(3000).default(0),
});

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const isActive = searchParams.get('active') !== 'false';

    // Get all generators
    const generators = await db
      .select()
      .from(alphaGeneratorsTable)
      .where(isActive ? eq(alphaGeneratorsTable.isActive, true) : undefined)
      .orderBy(desc(alphaGeneratorsTable.rating));

    return NextResponse.json(
      {
        data: generators,
        count: generators.length,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('[Generators GET] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Validate request
    const validation = CreateGeneratorSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: validation.error.errors },
        { status: 400 }
      );
    }

    const data = validation.data;

    // Check if generator already exists
    const [existing] = await db
      .select()
      .from(alphaGeneratorsTable)
      .where(eq(alphaGeneratorsTable.walletAddress, data.walletAddress))
      .limit(1);

    if (existing) {
      return NextResponse.json(
        { error: 'Generator already registered' },
        { status: 409 }
      );
    }

    // Create new generator
    const [generator] = await db
      .insert(alphaGeneratorsTable)
      .values({
        walletAddress: data.walletAddress,
        displayName: data.displayName,
        description: data.description,
        subscriptionFee: data.subscriptionFee,
        performanceFee: data.performanceFee,
        isActive: true,
      })
      .returning();

    console.log(`[Generator] New generator registered: ${data.walletAddress}`);

    return NextResponse.json(
      {
        data: generator,
        message: 'Generator successfully registered'
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('[Generators POST] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
```
            </filePath>
        - verify/route.ts
            <filePath="/Users/consentsam/blockchain/copy-trading/backend/app/api/v1/alpha-generators/verify/route.ts">
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db/db';
import { subscriptionsTable } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { z } from 'zod';
import { encryptionService } from '@/services/encryption.service';

const VerifySchema = z.object({
  consumerAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
  generatorAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Validate request
    const validation = VerifySchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: validation.error.errors },
        { status: 400 }
      );
    }

    const { consumerAddress, generatorAddress } = validation.data;

    // Check subscription in database
    const [subscription] = await db
      .select()
      .from(subscriptionsTable)
      .where(
        and(
          eq(subscriptionsTable.alphaConsumerAddress, consumerAddress),
          eq(subscriptionsTable.alphaGeneratorAddress, generatorAddress),
          eq(subscriptionsTable.isActive, true)
        )
      )
      .limit(1);

    if (!subscription) {
      return NextResponse.json(
        {
          isSubscribed: false,
          message: 'No active subscription found'
        },
        { status: 200 }
      );
    }

    // Get encrypted address for verification
    const { encryptedAddress } = await encryptionService.encryptAddress(
      consumerAddress,
      generatorAddress
    );

    return NextResponse.json(
      {
        isSubscribed: true,
        subscription: {
          subscriptionId: subscription.subscriptionId,
          encryptedAddress,
          createdAt: subscription.createdAt,
          metadata: subscription.metadata,
        },
        message: 'Active subscription verified'
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('[Verify] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
```
            </filePath>
    - **Summary of Changes & Reasoning**: Created comprehensive REST API endpoints for subscription management. Endpoints handle generator registration, subscription creation with FHE encryption, and verification with transaction validation on blockchain.
</step-format>

<step-format>
- [ ] **Step B5: Implement SSE notification service**
    - **Task**: Create Server-Sent Events service for real-time trade notifications
    - **EXPLANATION**:
        - **What** → Real-time notification system for trade updates and subscription events
        - **Where** → `/Users/consentsam/blockchain/copy-trading/backend/app/api/v1/trades/stream/route.ts`
        - **Why** → Enable instant notifications to subscribers about new trades
    - **Files to Check/Create/Update**: stream/route.ts, trade-lifecycle.service.ts, notification.service.ts
    - **Step Dependencies**: B1, B2, B4
    - **Step Completion Summary (YYYY-MM-DD HH:MM)**: {{placeholder}}
    - **Status**: To Do
    - **Prompt for verification of elizaOS**: Verify that SSE endpoint streams real-time trade notifications to connected consumers and handles connection lifecycle properly
    - **Files Modified/Created**:
        - stream/route.ts
            <filePath="/Users/consentsam/blockchain/copy-trading/backend/app/api/v1/trades/stream/route.ts">
```typescript
import { NextRequest } from 'next/server';
import { tradeLifecycleService } from '@/services/trade-lifecycle.service';

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const consumerAddress = searchParams.get('address');

  if (!consumerAddress) {
    return new Response('Missing address parameter', { status: 400 });
  }

  // Create SSE stream
  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder();

      // Send initial ping
      controller.enqueue(encoder.encode(':ping\n\n'));

      // Set up event listeners
      const onTradeCreated = (trade: any) => {
        if (trade.alphaConsumerAddress === consumerAddress) {
          const data = JSON.stringify({
            type: 'NEW_TRADE',
            trade,
            timestamp: new Date().toISOString(),
          });
          controller.enqueue(encoder.encode(`data: ${data}\n\n`));
        }
      };

      const onTradeStatusChanged = (trade: any) => {
        if (trade.alphaConsumerAddress === consumerAddress) {
          const data = JSON.stringify({
            type: 'STATUS_UPDATE',
            trade,
            timestamp: new Date().toISOString(),
          });
          controller.enqueue(encoder.encode(`data: ${data}\n\n`));
        }
      };

      const onExpiryWarning = (trade: any) => {
        if (trade.alphaConsumerAddress === consumerAddress) {
          const data = JSON.stringify({
            type: 'EXPIRY_WARNING',
            trade,
            timestamp: new Date().toISOString(),
          });
          controller.enqueue(encoder.encode(`data: ${data}\n\n`));
        }
      };

      const onSubscriptionUpdate = (update: any) => {
        if (update.consumerAddress === consumerAddress) {
          const data = JSON.stringify({
            type: 'SUBSCRIPTION_UPDATE',
            update,
            timestamp: new Date().toISOString(),
          });
          controller.enqueue(encoder.encode(`data: ${data}\n\n`));
        }
      };

      // Register listeners
      tradeLifecycleService.on('tradeCreated', onTradeCreated);
      tradeLifecycleService.on('tradeStatusChanged', onTradeStatusChanged);
      tradeLifecycleService.on('expiryWarning', onExpiryWarning);
      tradeLifecycleService.on('subscriptionUpdate', onSubscriptionUpdate);

      // Send ping every 30 seconds to keep connection alive
      const pingInterval = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(':ping\n\n'));
        } catch (error) {
          // Connection closed
          clearInterval(pingInterval);
        }
      }, 30000);

      // Clean up on close
      const cleanup = () => {
        clearInterval(pingInterval);
        tradeLifecycleService.off('tradeCreated', onTradeCreated);
        tradeLifecycleService.off('tradeStatusChanged', onTradeStatusChanged);
        tradeLifecycleService.off('expiryWarning', onExpiryWarning);
        tradeLifecycleService.off('subscriptionUpdate', onSubscriptionUpdate);
      };

      // Handle connection close
      req.signal.addEventListener('abort', () => {
        cleanup();
        controller.close();
      });
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no', // Disable Nginx buffering
    },
  });
}
```
            </filePath>
        - trade-lifecycle.service.ts
            <filePath="/Users/consentsam/blockchain/copy-trading/backend/src/services/trade-lifecycle.service.ts">
```typescript
import { db } from '@/db/db';
import { tradeConfirmationsTable } from '@/db/schema';
import { eq, lt, and, isNull, sql } from 'drizzle-orm';
import { EventEmitter } from 'events';
import { ethers } from 'ethers';
import { encryptionService } from './encryption.service';

export enum TradeStatus {
  PENDING = 'pending',
  EXECUTED = 'executed',
  REJECTED = 'rejected',
  EXPIRED = 'expired',
}

export class TradeLifecycleService extends EventEmitter {
  private expiryCheckInterval: NodeJS.Timeout | null = null;
  private contractInterface: ethers.Interface;

  constructor() {
    super();
    this.startExpiryMonitor();
    // Initialize contract interface for event parsing
    // Note: With Foundry, the full ABI would be loaded from out/AlphaEngineSubscription.sol/AlphaEngineSubscription.json
    const AlphaEngineABI = [
      'event SubscriptionCreated(address indexed generator, bytes32 encryptedSubscriber, uint256 timestamp)',  // eaddress compiles to bytes32
      'event TradeProposed(bytes32 indexed tradeId, address indexed generator, uint256 expiryTime, uint256 gasEstimate)',
      'event TradeExecuted(bytes32 indexed tradeId, address indexed executor, bool success)',
    ];
    this.contractInterface = new ethers.Interface(AlphaEngineABI);
  }

  /**
   * Create trade confirmations for all subscribers
   */
  async broadcastTrade(params: {
    alphaGeneratorAddress: string;
    executionParams: any;
    encodedExecutionData?: string;
    gasEstimate: string;
    expiryMinutes: number;
  }) {
    const {
      alphaGeneratorAddress,
      executionParams,
      encodedExecutionData,
      gasEstimate,
      expiryMinutes
    } = params;

    // Import protocol utilities
    const { getActionConfig } = await import('@/lib/protocols/action-mappings');
    const { ProtocolConfigService } = await import('@/services/protocol-config.service');

    // Get action config for gas adjustment
    const actionConfig = getActionConfig(
      executionParams.protocol || 'uniswap',
      executionParams.action || 'swap'
    );

    // Apply gas multiplier if specified
    const adjustedGasEstimate = actionConfig?.gasMultiplier
      ? (BigInt(gasEstimate) * BigInt(Math.floor(actionConfig.gasMultiplier * 100)) / 100n).toString()
      : gasEstimate;

    // Generate encoded data if not provided
    const finalEncodedData = encodedExecutionData || ProtocolConfigService.encodeExecutionData({
      protocol: executionParams.protocol || 'uniswap',
      action: executionParams.action || 'swap',
      params: executionParams,
    });

    // Get encrypted subscribers from blockchain
    const subscriberAddresses = await this.getEncryptedSubscribers(alphaGeneratorAddress);

    // Resolve to real addresses
    const addressMap = await encryptionService.resolveEncryptedAddresses(subscriberAddresses);

    // Create trade confirmations
    const trades = [];
    const expiryTime = new Date(Date.now() + expiryMinutes * 60 * 1000);

    for (const [encrypted, real] of addressMap.entries()) {
      const [trade] = await db
        .insert(tradeConfirmationsTable)
        .values({
          alphaGeneratorAddress,
          alphaConsumerAddress: real,
          encryptedConsumerAddress: encrypted,
          executionParams,
          encodedExecutionData: finalEncodedData,
          protocol: executionParams.protocol || 'uniswap',
          actionType: executionParams.action || 'swap',
          protocolMetadata: {
            displayName: actionConfig?.displayName,
            icon: actionConfig?.icon,
            requiresApproval: actionConfig?.requiresApproval,
            description: actionConfig?.description,
          },
          gasEstimate: adjustedGasEstimate,
          gasMultiplier: actionConfig?.gasMultiplier || 1.0,
          tradeStatus: TradeStatus.PENDING,
          expiryTimestamp: expiryTime,
          notificationSent: false,
        })
        .returning();

      trades.push(trade);

      // Emit event for real-time notification
      this.emit('tradeCreated', trade);
    }

    return trades;
  }

  /**
   * Update trade status
   */
  async updateTradeStatus(
    confirmationId: string,
    status: TradeStatus,
    additionalData?: {
      executionTxHash?: string;
      rejectionReason?: string;
      gasUsed?: string;
    }
  ) {
    const [updated] = await db
      .update(tradeConfirmationsTable)
      .set({
        tradeStatus: status,
        ...additionalData,
        updatedAt: new Date(),
      })
      .where(eq(tradeConfirmationsTable.confirmationId, confirmationId))
      .returning();

    // Emit status change event
    this.emit('tradeStatusChanged', updated);

    return updated;
  }

  /**
   * Monitor and expire trades
   */
  private startExpiryMonitor() {
    // Check every 5 minutes
    this.expiryCheckInterval = setInterval(async () => {
      const expiredTrades = await db
        .update(tradeConfirmationsTable)
        .set({
          tradeStatus: TradeStatus.EXPIRED,
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(tradeConfirmationsTable.tradeStatus, TradeStatus.PENDING),
            lt(tradeConfirmationsTable.expiryTimestamp, new Date())
          )
        )
        .returning();

      // Emit expiry events
      for (const trade of expiredTrades) {
        this.emit('tradeExpired', trade);
      }
    }, 5 * 60 * 1000);
  }

  /**
   * Get encrypted subscribers from blockchain
   */
  private async getEncryptedSubscribers(generatorAddress: string): Promise<string[]> {
    // This would call the smart contract
    // For now, returning mock data for testing
    const provider = new ethers.JsonRpcProvider(process.env.BLOCKCHAIN_RPC_URL || 'http://localhost:8545');

    // In production, this would call the actual contract
    // const contract = new ethers.Contract(contractAddress, abi, provider);
    // const encryptedAddresses = await contract.getEncryptedSubscribers(generatorAddress);

    // Mock implementation for testing
    const mockAddresses = await db
      .select()
      .from(subscriptionsTable)
      .where(
        and(
          eq(subscriptionsTable.alphaGeneratorAddress, generatorAddress),
          eq(subscriptionsTable.isActive, true)
        )
      );

    return mockAddresses
      .map(sub => sub.encryptedConsumerAddress)
      .filter(Boolean) as string[];
  }

  /**
   * Send expiry warning notifications
   */
  async sendExpiryWarnings() {
    const oneHourFromNow = new Date(Date.now() + 60 * 60 * 1000);

    const soonToExpire = await db
      .select()
      .from(tradeConfirmationsTable)
      .where(
        and(
          eq(tradeConfirmationsTable.tradeStatus, TradeStatus.PENDING),
          lt(tradeConfirmationsTable.expiryTimestamp, oneHourFromNow),
          eq(tradeConfirmationsTable.notificationSent, false)
        )
      );

    for (const trade of soonToExpire) {
      this.emit('expiryWarning', trade);

      // Mark notification as sent
      await db
        .update(tradeConfirmationsTable)
        .set({ notificationSent: true })
        .where(eq(tradeConfirmationsTable.confirmationId, trade.confirmationId));
    }
  }

  cleanup() {
    if (this.expiryCheckInterval) {
      clearInterval(this.expiryCheckInterval);
    }
  }
}

// Import necessary table schemas
import { subscriptionsTable, tradeConfirmationsTable as importedTradeConfirmationsTable } from '@/db/schema';

// Export singleton instance
export const tradeLifecycleService = new TradeLifecycleService();
```
            </filePath>
    - **Summary of Changes & Reasoning**: Implemented real-time notification system using Server-Sent Events for instant trade updates. Service handles connection lifecycle, keepalive pings, and emits events for trades, status changes, and expiry warnings.
</step-format>

</execution-plan>

---

## Implementation Notes

### Parallel Execution Strategy
- All steps in this track can be executed independently
- Database migrations (B1) should be applied first
- Services (B2, B3) can be developed simultaneously
- API endpoints (B4) depend on services but can be stubbed initially
- SSE service (B5) can be developed independently with mock data

### Testing Approach
1. Run database migrations: `bun run db:push`
2. Test encryption service with mock addresses
3. Validate API endpoints with Postman/curl
4. Monitor SSE stream with EventSource client
5. Verify protocol configurations with unit tests

### Environment Variables Required
```env
FHENIX_NETWORK_URL=http://localhost:8545
BLOCKCHAIN_RPC_URL=http://localhost:8545
ALPHAENGINE_CONTRACT_ADDRESS=0x...
DATABASE_URL=postgresql://user:pass@localhost:5432/alphaengine
```

### Success Criteria
✅ Database schema applied successfully
✅ Encryption service creates address mappings
✅ API endpoints return correct responses
✅ SSE stream delivers real-time notifications
✅ Protocol actions validated correctly