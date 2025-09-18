import { ethers } from 'ethers';
import { FhenixClient } from 'fhenixjs';
import { db } from '@/db/db';
import { addressMappingsTable } from '@/db/schema';
import { eq, and, sql } from 'drizzle-orm';

export class FHEEncryptionService {
  private fhenixClient: FhenixClient | null = null;
  private provider: ethers.Provider;
  private initialized = false;

  constructor() {
    // Validate required environment variables - prefer FHENIX_NETWORK_URL but fall back to BLOCKCHAIN_RPC_URL
    const rpcUrl = process.env.FHENIX_NETWORK_URL || process.env.BLOCKCHAIN_RPC_URL;
    if (!rpcUrl) {
      throw new Error(
        '[FHEEncryption] Either FHENIX_NETWORK_URL or BLOCKCHAIN_RPC_URL environment variable is required. ' +
        'Please set it to your Fhenix/blockchain RPC endpoint (e.g., https://api.helium.fhenix.zone for Fhenix mainnet, ' +
        'http://localhost:8545 for local development).'
      );
    }

    // Log the RPC URL being used (masked for security)
    console.log(
      `[FHEEncryption] Initializing with RPC URL: ${rpcUrl.includes('localhost') ? rpcUrl : rpcUrl.replace(/\/\/([^:]+):([^@]+)@/, '//*****:*****@')}`
    );

    this.provider = new ethers.JsonRpcProvider(rpcUrl);
  }

  private async initializeFHE() {
    if (this.initialized) return;
    
    try {
      this.fhenixClient = new FhenixClient({ provider: this.provider });
      this.initialized = true;
      console.log('[FHEEncryptionService] Initialized successfully');
    } catch (error) {
      console.error('[FHEEncryptionService] Initialization failed:', error);
      throw new Error('Failed to initialize FHE client');
    }
  }

  async encryptAddress(
    realAddress: string, 
    generatorAddress: string
  ): Promise<{ 
    encryptedAddress: string; 
    encryptedData: any; 
  }> {
    await this.initializeFHE();
    
    if (!ethers.isAddress(realAddress) || !ethers.isAddress(generatorAddress)) {
      throw new Error('Invalid address format');
    }
    
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
    
    const encrypted = await this.fhenixClient!.encrypt(realAddress, 'address');
    
    const encryptedIdentifier = ethers.keccak256(
      ethers.solidityPacked(
        ['address', 'address', 'bytes'],
        [generatorAddress, realAddress, ethers.toUtf8Bytes('FHE_V1')]
      )
    );
    
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

  async resolveEncryptedAddresses(encryptedAddresses: string[]): Promise<Map<string, string>> {
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

  async prepareForContract(encryptedData: any): Promise<{ 
    data: string; 
    proof: string; 
  }> {
    if (typeof encryptedData === 'string') {
      encryptedData = JSON.parse(encryptedData);
    }
    
    return { 
      data: encryptedData.data || encryptedData.ciphertext || '0x', 
      proof: encryptedData.proof || '0x' 
    };
  }

  async encryptAmount(amount: bigint | string | number): Promise<any> {
    await this.initializeFHE();
    
    if (!this.fhenixClient) {
      throw new Error('FHE client not initialized');
    }
    
    const amountBigInt = BigInt(amount);
    return await this.fhenixClient.encrypt(amountBigInt, 'uint256');
  }

  async encryptBoolean(value: boolean): Promise<any> {
    await this.initializeFHE();
    
    if (!this.fhenixClient) {
      throw new Error('FHE client not initialized');
    }
    
    return await this.fhenixClient.encrypt(value, 'bool');
  }
}

export const encryptionService = new FHEEncryptionService();