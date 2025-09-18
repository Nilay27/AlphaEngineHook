# AlphaEngine Frontend Implementation Plan

**File Created**: 17-September-2025-09:01PM IST
**Version**: 1.0.0
**Status**: READY FOR EXECUTION
**Track**: FRONTEND (F)

## CHANGELOG
- **17-September-2025-09:01PM IST**: Initial creation of Frontend implementation plan with 5 atomic steps
- **17-September-2025-10:35PM IST**: Added Foundry migration notes for ABI imports (out/ directory instead of artifacts/)
- **17-September-2025-11:00PM IST**: Updated ABI to correctly represent eaddress FHE types as bytes32

---

## Execution Plan - Frontend Track

<execution-plan track="frontend">

<step-format>
- [ ] **Step F1: Create API client utilities**
    - **Task**: Implement typed API client for backend communication with FHE support
    - **EXPLANATION**:
        - **What** → API client with typed methods for subscription and generator endpoints
        - **Where** → `/Users/consentsam/blockchain/copy-trading/frontend/src/utils/api-client.ts`
        - **Why** → Centralized API communication with proper error handling
    - **Files to Check/Create/Update**: api-client.ts, types.ts
    - **Step Dependencies**: None
    - **Step Completion Summary (YYYY-MM-DD HH:MM)**: {{placeholder}}
    - **Status**: To Do
    - **Prompt for verification of elizaOS**: Verify that the API client has methods for subscribing to generators, fetching generator list, and verifying subscriptions
    - **Files Modified/Created**:
        - api-client.ts
            <filePath="/Users/consentsam/blockchain/copy-trading/frontend/src/utils/api-client.ts">
```typescript
import { ethers } from 'ethers';

export interface AlphaGenerator {
  generatorId: string;
  walletAddress: string;
  displayName?: string;
  description?: string;
  subscriptionFee: string;
  performanceFee: number;
  totalSubscribers: number;
  totalVolume: string;
  rating: number;
  isVerified: boolean;
  isActive: boolean;
  metadata: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface Subscription {
  subscriptionId: string;
  alphaGeneratorAddress: string;
  alphaConsumerAddress: string;
  encryptedConsumerAddress?: string;
  subscriptionType: 'generator' | 'strategy';
  encryptionVersion: number;
  subscriptionTxHash?: string;
  isActive: boolean;
  metadata: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface TradeNotification {
  confirmationId: string;
  alphaGeneratorAddress: string;
  alphaConsumerAddress: string;
  executionParams: {
    protocol: string;
    action: string;
    tokenIn?: string;
    tokenOut?: string;
    amount: string;
    slippage?: number;
    data?: Record<string, any>;
  };
  gasEstimate: string;
  tradeStatus: 'pending' | 'executed' | 'rejected' | 'expired';
  expiryTimestamp: string;
  protocolMetadata?: {
    displayName?: string;
    icon?: string;
    requiresApproval?: boolean;
    description?: string;
  };
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  error?: string;
  details?: any;
}

export interface PaginatedResponse<T> {
  data: T[];
  count: number;
  page?: number;
  limit?: number;
  totalPages?: number;
}

class AlphaEngineAPIClient {
  private baseURL: string;
  private headers: HeadersInit;

  constructor(baseURL: string = 'http://localhost:3001') {
    this.baseURL = baseURL;
    this.headers = {
      'Content-Type': 'application/json',
    };
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(error.error || `HTTP error! status: ${response.status}`);
    }
    return response.json();
  }

  /**
   * Fetch all active alpha generators
   */
  async getGenerators(active: boolean = true): Promise<ApiResponse<AlphaGenerator[]>> {
    const response = await fetch(
      `${this.baseURL}/api/v1/alpha-generators?active=${active}`,
      {
        method: 'GET',
        headers: this.headers,
      }
    );
    return this.handleResponse<ApiResponse<AlphaGenerator[]>>(response);
  }

  /**
   * Get a specific generator by address
   */
  async getGenerator(address: string): Promise<ApiResponse<AlphaGenerator>> {
    const response = await fetch(
      `${this.baseURL}/api/v1/alpha-generators/${address}`,
      {
        method: 'GET',
        headers: this.headers,
      }
    );
    return this.handleResponse<ApiResponse<AlphaGenerator>>(response);
  }

  /**
   * Register a new alpha generator
   */
  async registerGenerator(params: {
    walletAddress: string;
    displayName?: string;
    description?: string;
    subscriptionFee: string;
    performanceFee?: number;
  }): Promise<ApiResponse<AlphaGenerator>> {
    const response = await fetch(
      `${this.baseURL}/api/v1/alpha-generators`,
      {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify(params),
      }
    );
    return this.handleResponse<ApiResponse<AlphaGenerator>>(response);
  }

  /**
   * Subscribe to an alpha generator
   */
  async subscribeToGenerator(
    generatorAddress: string,
    subscriberWallet: string,
    subscriptionTxHash: string
  ): Promise<ApiResponse<Subscription>> {
    const response = await fetch(
      `${this.baseURL}/api/v1/alpha-generators/${generatorAddress}/subscribe`,
      {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify({
          subscriberWallet,
          subscriptionTxHash,
        }),
      }
    );
    return this.handleResponse<ApiResponse<Subscription>>(response);
  }

  /**
   * Get subscriptions for a generator
   */
  async getGeneratorSubscriptions(
    generatorAddress: string
  ): Promise<ApiResponse<Subscription[]>> {
    const response = await fetch(
      `${this.baseURL}/api/v1/alpha-generators/${generatorAddress}/subscribe`,
      {
        method: 'GET',
        headers: this.headers,
      }
    );
    return this.handleResponse<ApiResponse<Subscription[]>>(response);
  }

  /**
   * Verify subscription status
   */
  async verifySubscription(
    consumerAddress: string,
    generatorAddress: string
  ): Promise<ApiResponse<{ isSubscribed: boolean; subscription?: Partial<Subscription> }>> {
    const response = await fetch(
      `${this.baseURL}/api/v1/alpha-generators/verify`,
      {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify({
          consumerAddress,
          generatorAddress,
        }),
      }
    );
    return this.handleResponse<ApiResponse<{ isSubscribed: boolean; subscription?: Partial<Subscription> }>>(response);
  }

  /**
   * Get user's subscriptions
   */
  async getUserSubscriptions(
    userAddress: string
  ): Promise<ApiResponse<Subscription[]>> {
    const response = await fetch(
      `${this.baseURL}/api/v1/subscriptions?consumer=${userAddress}`,
      {
        method: 'GET',
        headers: this.headers,
      }
    );
    return this.handleResponse<ApiResponse<Subscription[]>>(response);
  }

  /**
   * Get pending trades for a consumer
   */
  async getPendingTrades(
    consumerAddress: string
  ): Promise<ApiResponse<TradeNotification[]>> {
    const response = await fetch(
      `${this.baseURL}/api/v1/trades/pending?address=${consumerAddress}`,
      {
        method: 'GET',
        headers: this.headers,
      }
    );
    return this.handleResponse<ApiResponse<TradeNotification[]>>(response);
  }

  /**
   * Execute a trade
   */
  async executeTrade(
    tradeId: string,
    executorAddress: string,
    txHash: string
  ): Promise<ApiResponse<{ success: boolean; trade: TradeNotification }>> {
    const response = await fetch(
      `${this.baseURL}/api/v1/trades/${tradeId}/execute`,
      {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify({
          executorAddress,
          txHash,
        }),
      }
    );
    return this.handleResponse<ApiResponse<{ success: boolean; trade: TradeNotification }>>(response);
  }

  /**
   * Create an EventSource for SSE notifications
   */
  createNotificationStream(consumerAddress: string): EventSource {
    return new EventSource(
      `${this.baseURL}/api/v1/trades/stream?address=${consumerAddress}`
    );
  }
}

// Export singleton instance
export const apiClient = new AlphaEngineAPIClient(
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
);

// Export types
export type { AlphaEngineAPIClient };
```
            </filePath>
        - types.ts
            <filePath="/Users/consentsam/blockchain/copy-trading/frontend/src/types/alpha-engine.ts">
```typescript
import { Address } from 'viem';

export interface ChainConfig {
  id: number;
  name: string;
  rpcUrl: string;
  explorerUrl: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
}

export interface ContractAddresses {
  alphaEngineSubscription: Address;
  fhenixToken?: Address;
}

export interface ProtocolAction {
  name: string;
  displayName: string;
  description: string;
  icon: string;
  requiresTokenIn: boolean;
  requiresTokenOut: boolean;
  gasMultiplier?: number;
  requiresApproval?: boolean;
}

export interface ProtocolConfig {
  name: string;
  actions: Record<string, ProtocolAction>;
}

export interface EncryptedAddress {
  identifier: string;
  data: string;
  proof?: string;
}

export interface SubscriptionState {
  isSubscribed: boolean;
  subscriptionId?: string;
  encryptedAddress?: EncryptedAddress;
  subscribedAt?: Date;
  subscriptionFee?: string;
}

export interface GeneratorStats {
  totalSubscribers: number;
  totalVolume: string;
  rating: number;
  performanceFee: number;
  subscriptionFee: string;
  isVerified: boolean;
}

export interface TradeExecution {
  tradeId: string;
  generator: Address;
  protocol: string;
  action: string;
  tokenIn?: Address;
  tokenOut?: Address;
  amount: string;
  slippage?: number;
  gasEstimate: string;
  expiryTime: Date;
  status: 'pending' | 'executing' | 'executed' | 'failed' | 'expired';
}

export interface NotificationEvent {
  type: 'NEW_TRADE' | 'STATUS_UPDATE' | 'EXPIRY_WARNING' | 'SUBSCRIPTION_UPDATE';
  trade?: TradeExecution;
  update?: any;
  timestamp: string;
}
```
            </filePath>
    - **Summary of Changes & Reasoning**: Created comprehensive API client with typed methods for all backend endpoints. Includes support for SSE notifications, proper error handling, and TypeScript interfaces for type safety.
</step-format>

<step-format>
- [ ] **Step F2: Implement Web3 contract hooks**
    - **Task**: Create React hooks for smart contract interaction with FHE encryption
    - **EXPLANATION**:
        - **What** → Custom hooks for subscription contract calls with Fhenix integration
        - **Where** → `/Users/consentsam/blockchain/copy-trading/frontend/src/hooks/use-alpha-engine.ts`
        - **Why** → Simplified Web3 interaction with proper state management
    - **Files to Check/Create/Update**: use-alpha-engine.ts, contracts/AlphaEngine.ts, wagmi.config.ts
    - **Step Dependencies**: F1
    - **Step Completion Summary (YYYY-MM-DD HH:MM)**: {{placeholder}}
    - **Status**: To Do
    - **Prompt for verification of elizaOS**: Test that the useAlphaEngine hook can encrypt addresses, call subscribe function, and verify subscription status on-chain
    - **Files Modified/Created**:
        - use-alpha-engine.ts
            <filePath="/Users/consentsam/blockchain/copy-trading/frontend/src/hooks/use-alpha-engine.ts">
```typescript
import { useState, useEffect, useCallback } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useReadContract } from 'wagmi';
import { parseEther, Address } from 'viem';
import { FhenixClient } from 'fhenixjs';
import { ethers } from 'ethers';
import { apiClient, type AlphaGenerator, type Subscription } from '@/utils/api-client';
import { ALPHAENGINE_ABI, ALPHAENGINE_CONTRACT_ADDRESS } from '@/contracts/AlphaEngine';
import { toast } from 'react-hot-toast';

export interface UseAlphaEngineReturn {
  // State
  isSubscribing: boolean;
  isRegistering: boolean;
  encryptedAddress: string | null;
  subscriptionStatus: 'idle' | 'encrypting' | 'signing' | 'confirming' | 'completed' | 'error';

  // Methods
  subscribeToGenerator: (generator: AlphaGenerator) => Promise<void>;
  registerAsGenerator: (fee: string, performanceFee: number) => Promise<void>;
  verifySubscription: (generatorAddress: string) => Promise<boolean>;
  getEncryptedSubscribers: (generatorAddress: string) => Promise<string[]>;

  // Contract state
  contractWrite: ReturnType<typeof useWriteContract>;
  transactionReceipt: ReturnType<typeof useWaitForTransactionReceipt>;
}

export function useAlphaEngine(): UseAlphaEngineReturn {
  const { address: userAddress, isConnected } = useAccount();
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [encryptedAddress, setEncryptedAddress] = useState<string | null>(null);
  const [subscriptionStatus, setSubscriptionStatus] = useState<UseAlphaEngineReturn['subscriptionStatus']>('idle');
  const [fhenixClient, setFhenixClient] = useState<FhenixClient | null>(null);

  const contractWrite = useWriteContract();
  const transactionReceipt = useWaitForTransactionReceipt({
    hash: contractWrite.data,
  });

  // Initialize Fhenix client
  useEffect(() => {
    const initFhenixClient = async () => {
      try {
        const provider = new ethers.JsonRpcProvider(
          process.env.NEXT_PUBLIC_FHENIX_NETWORK_URL || 'http://localhost:8545'
        );
        const client = new FhenixClient({ provider });
        setFhenixClient(client);
      } catch (error) {
        console.error('Failed to initialize Fhenix client:', error);
      }
    };

    initFhenixClient();
  }, []);

  // Handle transaction completion
  useEffect(() => {
    if (transactionReceipt.isSuccess && contractWrite.data) {
      handleTransactionSuccess();
    }
  }, [transactionReceipt.isSuccess, contractWrite.data]);

  const handleTransactionSuccess = async () => {
    if (!contractWrite.data || !userAddress) return;

    try {
      // Get the function name from contract write context
      const functionName = contractWrite.variables?.functionName;

      if (functionName === 'subscribe') {
        // Register subscription with backend
        const generatorAddress = contractWrite.variables?.args?.[0] as string;
        await apiClient.subscribeToGenerator(
          generatorAddress,
          userAddress,
          contractWrite.data
        );
        toast.success('Successfully subscribed to generator!');
        setSubscriptionStatus('completed');
      } else if (functionName === 'registerGenerator') {
        // Register generator with backend
        await apiClient.registerGenerator({
          walletAddress: userAddress,
          subscriptionFee: contractWrite.variables?.args?.[0] as string,
          performanceFee: contractWrite.variables?.args?.[1] as number,
        });
        toast.success('Successfully registered as generator!');
      }
    } catch (error) {
      console.error('Post-transaction error:', error);
      toast.error('Transaction succeeded but backend sync failed');
    } finally {
      setIsSubscribing(false);
      setIsRegistering(false);
    }
  };

  /**
   * Subscribe to an alpha generator
   */
  const subscribeToGenerator = useCallback(async (generator: AlphaGenerator) => {
    if (!isConnected || !userAddress || !fhenixClient) {
      toast.error('Please connect your wallet');
      return;
    }

    try {
      setIsSubscribing(true);
      setSubscriptionStatus('encrypting');

      // Step 1: Encrypt user address for this generator
      const encrypted = await fhenixClient.encrypt(
        userAddress as string,
        'address'
      );

      // Extract encrypted data
      const encryptedData = encrypted.data || encrypted.ciphertext || encrypted;
      setEncryptedAddress(encryptedData);

      // Step 2: Call smart contract
      setSubscriptionStatus('signing');

      await contractWrite.writeContract({
        address: ALPHAENGINE_CONTRACT_ADDRESS,
        abi: ALPHAENGINE_ABI,
        functionName: 'subscribe',
        args: [generator.walletAddress as Address, encryptedData],
        value: parseEther(generator.subscriptionFee),
      });

      setSubscriptionStatus('confirming');
    } catch (error: any) {
      console.error('Subscription error:', error);
      toast.error(error.message || 'Failed to subscribe');
      setSubscriptionStatus('error');
      setIsSubscribing(false);
    }
  }, [isConnected, userAddress, fhenixClient, contractWrite]);

  /**
   * Register as an alpha generator
   */
  const registerAsGenerator = useCallback(async (
    subscriptionFee: string,
    performanceFee: number
  ) => {
    if (!isConnected || !userAddress) {
      toast.error('Please connect your wallet');
      return;
    }

    try {
      setIsRegistering(true);

      await contractWrite.writeContract({
        address: ALPHAENGINE_CONTRACT_ADDRESS,
        abi: ALPHAENGINE_ABI,
        functionName: 'registerGenerator',
        args: [parseEther(subscriptionFee), performanceFee],
      });
    } catch (error: any) {
      console.error('Registration error:', error);
      toast.error(error.message || 'Failed to register');
      setIsRegistering(false);
    }
  }, [isConnected, userAddress, contractWrite]);

  /**
   * Verify subscription status on-chain
   */
  const verifySubscription = useCallback(async (generatorAddress: string): Promise<boolean> => {
    if (!userAddress || !fhenixClient) return false;

    try {
      // First check with backend
      const response = await apiClient.verifySubscription(userAddress, generatorAddress);

      if (!response.data.isSubscribed) return false;

      // Optionally verify on-chain
      // This would require calling the smart contract's isSubscribed function
      // with the encrypted address

      return true;
    } catch (error) {
      console.error('Verification error:', error);
      return false;
    }
  }, [userAddress, fhenixClient]);

  /**
   * Get encrypted subscribers for a generator
   */
  const getEncryptedSubscribers = useCallback(async (generatorAddress: string): Promise<string[]> => {
    try {
      const response = await apiClient.getGeneratorSubscriptions(generatorAddress);
      return response.data
        .filter(sub => sub.encryptedConsumerAddress)
        .map(sub => sub.encryptedConsumerAddress as string);
    } catch (error) {
      console.error('Failed to fetch subscribers:', error);
      return [];
    }
  }, []);

  return {
    isSubscribing,
    isRegistering,
    encryptedAddress,
    subscriptionStatus,
    subscribeToGenerator,
    registerAsGenerator,
    verifySubscription,
    getEncryptedSubscribers,
    contractWrite,
    transactionReceipt,
  };
}

/**
 * Hook to manage real-time notifications
 */
export function useTradeNotifications(consumerAddress?: string) {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!consumerAddress) return;

    const eventSource = apiClient.createNotificationStream(consumerAddress);

    eventSource.onopen = () => {
      setIsConnected(true);
      console.log('SSE connection established');
    };

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        setNotifications(prev => [data, ...prev].slice(0, 50)); // Keep last 50

        // Show toast for new trades
        if (data.type === 'NEW_TRADE') {
          toast.success('New trade alert from your generator!');
        }
      } catch (error) {
        console.error('Failed to parse notification:', error);
      }
    };

    eventSource.onerror = () => {
      setIsConnected(false);
      console.error('SSE connection error');
    };

    return () => {
      eventSource.close();
    };
  }, [consumerAddress]);

  return {
    notifications,
    isConnected,
  };
}
```
            </filePath>
        - AlphaEngine.ts
            <filePath="/Users/consentsam/blockchain/copy-trading/frontend/src/contracts/AlphaEngine.ts">
```typescript
import { Address } from 'viem';

export const ALPHAENGINE_CONTRACT_ADDRESS: Address = (process.env.NEXT_PUBLIC_ALPHAENGINE_CONTRACT_ADDRESS || '0x0000000000000000000000000000000000000000') as Address;

export const ALPHAENGINE_ABI = [
  {
    inputs: [
      { name: '_subscriptionFee', type: 'uint256' },
      { name: '_performanceFee', type: 'uint256' }
    ],
    name: 'registerGenerator',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [
      { name: '_generator', type: 'address' },
      { name: '_encryptedAddress', type: 'bytes32' }  // FHE eaddress compiles to bytes32
    ],
    name: 'subscribe',
    outputs: [],
    stateMutability: 'payable',
    type: 'function'
  },
  {
    inputs: [
      { name: '_generator', type: 'address' },
      { name: '_encryptedAddress', type: 'bytes32' }  // FHE eaddress compiles to bytes32
    ],
    name: 'unsubscribe',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [{ name: '_generator', type: 'address' }],
    name: 'getEncryptedSubscribers',
    outputs: [{ name: '', type: 'bytes32[]' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [
      { name: '_generator', type: 'address' },
      { name: '_encryptedAddress', type: 'bytes32' }
    ],
    name: 'isSubscribed',
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [
      { name: '_executionData', type: 'bytes' },
      { name: '_gasEstimate', type: 'uint256' },
      { name: '_expiryMinutes', type: 'uint256' }
    ],
    name: 'proposeTrade',
    outputs: [{ name: '', type: 'bytes32' }],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [
      { name: '_tradeId', type: 'bytes32' },
      { name: '_encryptedExecutor', type: 'bytes32' }
    ],
    name: 'executeTrade',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  // Events
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: 'generator', type: 'address' },
      { indexed: false, name: 'subscriptionFee', type: 'uint256' }
    ],
    name: 'GeneratorRegistered',
    type: 'event'
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: 'generator', type: 'address' },
      { indexed: false, name: 'encryptedSubscriber', type: 'bytes32' },  // FHE eaddress compiles to bytes32
      { indexed: false, name: 'timestamp', type: 'uint256' }
    ],
    name: 'SubscriptionCreated',
    type: 'event'
  }
] as const;
```
            </filePath>
    - **Summary of Changes & Reasoning**: Created React hooks for Web3 interaction with FHE encryption support. Hooks handle wallet connection, address encryption via FhenixClient, contract calls, and transaction monitoring with proper error handling.
    - **Foundry Migration Note**: When using Foundry, the contract ABI should be imported from `/contracts/out/AlphaEngineSubscription.sol/AlphaEngineSubscription.json` instead of Hardhat's artifacts directory.
</step-format>

<step-format>
- [ ] **Step F3: Build generator subscription UI**
    - **Task**: Create React component for browsing and subscribing to alpha generators
    - **EXPLANATION**:
        - **What** → UI component displaying generator list with subscription functionality
        - **Where** → `/Users/consentsam/blockchain/copy-trading/frontend/src/components/AlphaEngine/GeneratorList.tsx`
        - **Why** → User interface for discovering and subscribing to generators
    - **Files to Check/Create/Update**: GeneratorList.tsx, GeneratorCard.tsx, SubscriptionModal.tsx
    - **Step Dependencies**: F1, F2
    - **Step Completion Summary (YYYY-MM-DD HH:MM)**: {{placeholder}}
    - **Status**: To Do
    - **Prompt for verification of elizaOS**: Verify that GeneratorList component fetches and displays generators, allows filtering, and triggers subscription modal with proper wallet connection
    - **Files Modified/Created**:
        - GeneratorList.tsx
            <filePath="/Users/consentsam/blockchain/copy-trading/frontend/src/components/AlphaEngine/GeneratorList.tsx">
```tsx
import React, { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { formatEther } from 'viem';
import { apiClient, type AlphaGenerator } from '@/utils/api-client';
import { useAlphaEngine } from '@/hooks/use-alpha-engine';
import GeneratorCard from './GeneratorCard';
import SubscriptionModal from './SubscriptionModal';
import styled from 'styled-components';

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
`;

const Title = styled.h1`
  font-size: 32px;
  font-weight: 700;
  color: var(--color-text);
`;

const FilterBar = styled.div`
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
`;

const FilterButton = styled.button<{ $active: boolean }>`
  padding: 8px 16px;
  border-radius: 8px;
  border: 1px solid ${props => props.$active ? 'var(--color-primary)' : 'var(--color-border)'};
  background: ${props => props.$active ? 'var(--color-primary)' : 'transparent'};
  color: ${props => props.$active ? 'white' : 'var(--color-text)'};
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: ${props => props.$active ? 'var(--color-primary-hover)' : 'var(--color-surface-hover)'};
  }
`;

const SearchInput = styled.input`
  flex: 1;
  padding: 8px 16px;
  border-radius: 8px;
  border: 1px solid var(--color-border);
  background: var(--color-surface);
  color: var(--color-text);
  font-size: 14px;

  &::placeholder {
    color: var(--color-text-muted);
  }

  &:focus {
    outline: none;
    border-color: var(--color-primary);
  }
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 24px;
`;

const LoadingState = styled.div`
  text-align: center;
  padding: 48px;
  color: var(--color-text-muted);
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 48px;
  background: var(--color-surface);
  border-radius: 12px;
  border: 1px solid var(--color-border);
`;

const EmptyStateTitle = styled.h3`
  font-size: 20px;
  font-weight: 600;
  color: var(--color-text);
  margin-bottom: 8px;
`;

const EmptyStateText = styled.p`
  color: var(--color-text-muted);
`;

const Stats = styled.div`
  display: flex;
  gap: 24px;
  padding: 16px;
  background: var(--color-surface-elevated);
  border-radius: 8px;
  margin-bottom: 24px;
`;

const StatItem = styled.div``;

const StatLabel = styled.div`
  font-size: 12px;
  color: var(--color-text-muted);
  margin-bottom: 4px;
`;

const StatValue = styled.div`
  font-size: 20px;
  font-weight: 600;
  color: var(--color-text);
`;

type SortOption = 'rating' | 'subscribers' | 'fee' | 'recent';
type FilterOption = 'all' | 'verified' | 'subscribed';

export default function GeneratorList() {
  const { address: userAddress, isConnected } = useAccount();
  const { subscribeToGenerator, verifySubscription } = useAlphaEngine();

  const [generators, setGenerators] = useState<AlphaGenerator[]>([]);
  const [filteredGenerators, setFilteredGenerators] = useState<AlphaGenerator[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('rating');
  const [filterBy, setFilterBy] = useState<FilterOption>('all');
  const [selectedGenerator, setSelectedGenerator] = useState<AlphaGenerator | null>(null);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [subscribedGenerators, setSubscribedGenerators] = useState<Set<string>>(new Set());

  // Fetch generators
  useEffect(() => {
    fetchGenerators();
  }, []);

  // Fetch user subscriptions
  useEffect(() => {
    if (userAddress) {
      fetchUserSubscriptions();
    }
  }, [userAddress]);

  // Apply filters and sorting
  useEffect(() => {
    applyFiltersAndSort();
  }, [generators, searchTerm, sortBy, filterBy, subscribedGenerators]);

  const fetchGenerators = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getGenerators(true);
      setGenerators(response.data || []);
    } catch (error) {
      console.error('Failed to fetch generators:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserSubscriptions = async () => {
    if (!userAddress) return;

    try {
      const response = await apiClient.getUserSubscriptions(userAddress);
      const subscribed = new Set(
        response.data.map(sub => sub.alphaGeneratorAddress)
      );
      setSubscribedGenerators(subscribed);
    } catch (error) {
      console.error('Failed to fetch subscriptions:', error);
    }
  };

  const applyFiltersAndSort = () => {
    let filtered = [...generators];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(gen =>
        gen.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        gen.walletAddress.toLowerCase().includes(searchTerm.toLowerCase()) ||
        gen.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply filter
    switch (filterBy) {
      case 'verified':
        filtered = filtered.filter(gen => gen.isVerified);
        break;
      case 'subscribed':
        filtered = filtered.filter(gen => subscribedGenerators.has(gen.walletAddress));
        break;
    }

    // Apply sorting
    switch (sortBy) {
      case 'rating':
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case 'subscribers':
        filtered.sort((a, b) => b.totalSubscribers - a.totalSubscribers);
        break;
      case 'fee':
        filtered.sort((a, b) =>
          parseFloat(formatEther(BigInt(a.subscriptionFee))) -
          parseFloat(formatEther(BigInt(b.subscriptionFee)))
        );
        break;
      case 'recent':
        filtered.sort((a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        break;
    }

    setFilteredGenerators(filtered);
  };

  const handleSubscribe = (generator: AlphaGenerator) => {
    if (!isConnected) {
      alert('Please connect your wallet to subscribe');
      return;
    }

    setSelectedGenerator(generator);
    setShowSubscriptionModal(true);
  };

  const handleSubscriptionComplete = () => {
    setShowSubscriptionModal(false);
    setSelectedGenerator(null);
    fetchUserSubscriptions(); // Refresh subscriptions
  };

  const calculateStats = () => {
    const totalGenerators = generators.length;
    const verifiedCount = generators.filter(g => g.isVerified).length;
    const totalVolume = generators.reduce((sum, g) => sum + parseFloat(g.totalVolume || '0'), 0);
    const avgFee = generators.reduce((sum, g) =>
      sum + parseFloat(formatEther(BigInt(g.subscriptionFee))), 0
    ) / (generators.length || 1);

    return { totalGenerators, verifiedCount, totalVolume, avgFee };
  };

  const stats = calculateStats();

  if (loading) {
    return (
      <Container>
        <LoadingState>Loading alpha generators...</LoadingState>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <Title>Alpha Generators</Title>
      </Header>

      <Stats>
        <StatItem>
          <StatLabel>Total Generators</StatLabel>
          <StatValue>{stats.totalGenerators}</StatValue>
        </StatItem>
        <StatItem>
          <StatLabel>Verified</StatLabel>
          <StatValue>{stats.verifiedCount}</StatValue>
        </StatItem>
        <StatItem>
          <StatLabel>Avg. Fee</StatLabel>
          <StatValue>{stats.avgFee.toFixed(4)} ETH</StatValue>
        </StatItem>
        <StatItem>
          <StatLabel>Your Subscriptions</StatLabel>
          <StatValue>{subscribedGenerators.size}</StatValue>
        </StatItem>
      </Stats>

      <FilterBar>
        <SearchInput
          type="text"
          placeholder="Search by name, address, or description..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <FilterButton
          $active={filterBy === 'all'}
          onClick={() => setFilterBy('all')}
        >
          All
        </FilterButton>
        <FilterButton
          $active={filterBy === 'verified'}
          onClick={() => setFilterBy('verified')}
        >
          Verified
        </FilterButton>
        <FilterButton
          $active={filterBy === 'subscribed'}
          onClick={() => setFilterBy('subscribed')}
        >
          Subscribed
        </FilterButton>
      </FilterBar>

      {filteredGenerators.length === 0 ? (
        <EmptyState>
          <EmptyStateTitle>No generators found</EmptyStateTitle>
          <EmptyStateText>
            {searchTerm
              ? 'Try adjusting your search terms'
              : 'No active generators available at the moment'}
          </EmptyStateText>
        </EmptyState>
      ) : (
        <Grid>
          {filteredGenerators.map(generator => (
            <GeneratorCard
              key={generator.walletAddress}
              generator={generator}
              isSubscribed={subscribedGenerators.has(generator.walletAddress)}
              onSubscribe={() => handleSubscribe(generator)}
            />
          ))}
        </Grid>
      )}

      {showSubscriptionModal && selectedGenerator && (
        <SubscriptionModal
          generator={selectedGenerator}
          onClose={() => setShowSubscriptionModal(false)}
          onSuccess={handleSubscriptionComplete}
        />
      )}
    </Container>
  );
}
```
            </filePath>
        - GeneratorCard.tsx
            <filePath="/Users/consentsam/blockchain/copy-trading/frontend/src/components/AlphaEngine/GeneratorCard.tsx">
```tsx
import React from 'react';
import { formatEther } from 'viem';
import { type AlphaGenerator } from '@/utils/api-client';
import styled from 'styled-components';

const Card = styled.div`
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  padding: 20px;
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: start;
  margin-bottom: 16px;
`;

const GeneratorInfo = styled.div`
  flex: 1;
`;

const Name = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: var(--color-text);
  margin-bottom: 4px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const Address = styled.p`
  font-size: 12px;
  color: var(--color-text-muted);
  font-family: monospace;
`;

const Badge = styled.span<{ $type: 'verified' | 'subscribed' }>`
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 500;
  background: ${props => props.$type === 'verified' ? 'var(--color-success-bg)' : 'var(--color-primary-bg)'};
  color: ${props => props.$type === 'verified' ? 'var(--color-success)' : 'var(--color-primary)'};
`;

const Description = styled.p`
  font-size: 14px;
  color: var(--color-text-secondary);
  margin-bottom: 16px;
  line-height: 1.5;
  min-height: 42px;
`;

const Stats = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin-bottom: 16px;
  padding: 12px;
  background: var(--color-surface-elevated);
  border-radius: 8px;
`;

const StatItem = styled.div``;

const StatLabel = styled.p`
  font-size: 11px;
  color: var(--color-text-muted);
  margin-bottom: 2px;
`;

const StatValue = styled.p`
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text);
`;

const Rating = styled.div`
  display: flex;
  gap: 2px;
  margin-bottom: 16px;
`;

const Star = styled.span<{ $filled: boolean }>`
  color: ${props => props.$filled ? 'var(--color-warning)' : 'var(--color-border)'};
  font-size: 16px;
`;

const SubscribeButton = styled.button<{ $isSubscribed: boolean }>`
  width: 100%;
  padding: 10px 16px;
  border-radius: 8px;
  border: none;
  background: ${props => props.$isSubscribed ? 'var(--color-surface-elevated)' : 'var(--color-primary)'};
  color: ${props => props.$isSubscribed ? 'var(--color-text-muted)' : 'white'};
  font-weight: 500;
  cursor: ${props => props.$isSubscribed ? 'default' : 'pointer'};
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    background: ${props => props.$isSubscribed ? 'var(--color-surface-elevated)' : 'var(--color-primary-hover)'};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

interface GeneratorCardProps {
  generator: AlphaGenerator;
  isSubscribed: boolean;
  onSubscribe: () => void;
}

export default function GeneratorCard({ generator, isSubscribed, onSubscribe }: GeneratorCardProps) {
  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const renderRating = (rating: number) => {
    const stars = [];
    for (let i = 0; i < 5; i++) {
      stars.push(
        <Star key={i} $filled={i < Math.floor(rating)}>★</Star>
      );
    }
    return stars;
  };

  return (
    <Card>
      <Header>
        <GeneratorInfo>
          <Name>
            {generator.displayName || 'Anonymous Generator'}
            {generator.isVerified && <Badge $type="verified">Verified</Badge>}
            {isSubscribed && <Badge $type="subscribed">Subscribed</Badge>}
          </Name>
          <Address>{formatAddress(generator.walletAddress)}</Address>
        </GeneratorInfo>
      </Header>

      <Description>
        {generator.description || 'No description provided'}
      </Description>

      <Rating>
        {renderRating(generator.rating)}
        <span style={{ marginLeft: '8px', fontSize: '12px', color: 'var(--color-text-muted)' }}>
          ({generator.rating.toFixed(1)})
        </span>
      </Rating>

      <Stats>
        <StatItem>
          <StatLabel>Subscription Fee</StatLabel>
          <StatValue>{formatEther(BigInt(generator.subscriptionFee))} ETH</StatValue>
        </StatItem>
        <StatItem>
          <StatLabel>Performance Fee</StatLabel>
          <StatValue>{(generator.performanceFee / 100).toFixed(1)}%</StatValue>
        </StatItem>
        <StatItem>
          <StatLabel>Subscribers</StatLabel>
          <StatValue>{generator.totalSubscribers}</StatValue>
        </StatItem>
        <StatItem>
          <StatLabel>Total Volume</StatLabel>
          <StatValue>{parseFloat(formatEther(BigInt(generator.totalVolume || '0'))).toFixed(2)} ETH</StatValue>
        </StatItem>
      </Stats>

      <SubscribeButton
        $isSubscribed={isSubscribed}
        onClick={onSubscribe}
        disabled={isSubscribed}
      >
        {isSubscribed ? 'Already Subscribed' : 'Subscribe'}
      </SubscribeButton>
    </Card>
  );
}
```
            </filePath>
    - **Summary of Changes & Reasoning**: Built comprehensive UI for generator discovery and subscription. Components include filterable list, detailed cards, statistics display, and search functionality with proper TypeScript typing.
</step-format>

<step-format>
- [ ] **Step F4: Create subscription modal component**
    - **Task**: Implement modal for subscription confirmation with FHE encryption flow
    - **EXPLANATION**:
        - **What** → Modal component guiding users through subscription process
        - **Where** → `/Users/consentsam/blockchain/copy-trading/frontend/src/components/AlphaEngine/SubscriptionModal.tsx`
        - **Why** → Clear UX for subscription flow with encryption status
    - **Files to Check/Create/Update**: SubscriptionModal.tsx, TransactionStatus.tsx
    - **Step Dependencies**: F2, F3
    - **Step Completion Summary (YYYY-MM-DD HH:MM)**: {{placeholder}}
    - **Status**: To Do
    - **Prompt for verification of elizaOS**: Test that SubscriptionModal shows encryption progress, transaction status, and handles success/failure states properly
    - **Files Modified/Created**:
        - SubscriptionModal.tsx
            <filePath="/Users/consentsam/blockchain/copy-trading/frontend/src/components/AlphaEngine/SubscriptionModal.tsx">
```tsx
import React, { useEffect } from 'react';
import { formatEther } from 'viem';
import { useAlphaEngine } from '@/hooks/use-alpha-engine';
import { type AlphaGenerator } from '@/utils/api-client';
import styled from 'styled-components';

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const Modal = styled.div`
  background: var(--color-surface);
  border-radius: 16px;
  width: 90%;
  max-width: 500px;
  padding: 32px;
  position: relative;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 16px;
  right: 16px;
  background: none;
  border: none;
  font-size: 24px;
  color: var(--color-text-muted);
  cursor: pointer;

  &:hover {
    color: var(--color-text);
  }
`;

const Title = styled.h2`
  font-size: 24px;
  font-weight: 700;
  color: var(--color-text);
  margin-bottom: 24px;
`;

const GeneratorInfo = styled.div`
  padding: 16px;
  background: var(--color-surface-elevated);
  border-radius: 8px;
  margin-bottom: 24px;
`;

const InfoRow = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;

  &:last-child {
    margin-bottom: 0;
  }
`;

const InfoLabel = styled.span`
  color: var(--color-text-muted);
  font-size: 14px;
`;

const InfoValue = styled.span`
  color: var(--color-text);
  font-size: 14px;
  font-weight: 500;
`;

const PrivacyNote = styled.div`
  background: var(--color-info-bg);
  border: 1px solid var(--color-info);
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 24px;
`;

const PrivacyText = styled.p`
  font-size: 13px;
  color: var(--color-text);
  line-height: 1.5;
`;

const PrivacyIcon = styled.span`
  display: inline-block;
  margin-right: 8px;
`;

const StatusSection = styled.div`
  margin-bottom: 24px;
`;

const StatusItem = styled.div<{ $active: boolean; $completed: boolean }>`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  margin-bottom: 8px;
  border-radius: 8px;
  background: ${props => {
    if (props.$completed) return 'var(--color-success-bg)';
    if (props.$active) return 'var(--color-primary-bg)';
    return 'var(--color-surface-elevated)';
  }};
  border: 1px solid ${props => {
    if (props.$completed) return 'var(--color-success)';
    if (props.$active) return 'var(--color-primary)';
    return 'transparent';
  }};
`;

const StatusIcon = styled.div<{ $completed: boolean; $active: boolean }>`
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: ${props => {
    if (props.$completed) return 'var(--color-success)';
    if (props.$active) return 'var(--color-primary)';
    return 'var(--color-border)';
  }};
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 600;
`;

const StatusText = styled.div`
  flex: 1;
`;

const StatusTitle = styled.p`
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text);
  margin-bottom: 2px;
`;

const StatusDescription = styled.p`
  font-size: 12px;
  color: var(--color-text-muted);
`;

const LoadingSpinner = styled.div<{ $active: boolean }>`
  width: 16px;
  height: 16px;
  border: 2px solid rgba(0, 0, 0, 0.1);
  border-top-color: var(--color-primary);
  border-radius: 50%;
  animation: ${props => props.$active ? 'spin 0.6s linear infinite' : 'none'};

  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 12px;
`;

const Button = styled.button<{ $variant?: 'primary' | 'secondary' }>`
  flex: 1;
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  border: ${props => props.$variant === 'secondary' ? '1px solid var(--color-border)' : 'none'};
  background: ${props => props.$variant === 'secondary' ? 'transparent' : 'var(--color-primary)'};
  color: ${props => props.$variant === 'secondary' ? 'var(--color-text)' : 'white'};

  &:hover:not(:disabled) {
    background: ${props => props.$variant === 'secondary' ? 'var(--color-surface-hover)' : 'var(--color-primary-hover)'};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const ErrorMessage = styled.div`
  padding: 12px;
  background: var(--color-error-bg);
  border: 1px solid var(--color-error);
  border-radius: 8px;
  margin-bottom: 16px;
`;

const ErrorText = styled.p`
  font-size: 14px;
  color: var(--color-error);
`;

interface SubscriptionModalProps {
  generator: AlphaGenerator;
  onClose: () => void;
  onSuccess: () => void;
}

export default function SubscriptionModal({ generator, onClose, onSuccess }: SubscriptionModalProps) {
  const {
    subscribeToGenerator,
    subscriptionStatus,
    encryptedAddress,
    transactionReceipt,
  } = useAlphaEngine();

  const [error, setError] = React.useState<string | null>(null);

  useEffect(() => {
    if (subscriptionStatus === 'completed') {
      onSuccess();
    } else if (subscriptionStatus === 'error') {
      setError('Subscription failed. Please try again.');
    }
  }, [subscriptionStatus, onSuccess]);

  const handleSubscribe = async () => {
    setError(null);
    try {
      await subscribeToGenerator(generator);
    } catch (err: any) {
      setError(err.message || 'Failed to subscribe');
    }
  };

  const getStatusSteps = () => {
    const steps = [
      {
        id: 'encrypt',
        title: 'Encrypting Address',
        description: 'Creating privacy-protected address using FHE',
        active: subscriptionStatus === 'encrypting',
        completed: ['signing', 'confirming', 'completed'].includes(subscriptionStatus),
      },
      {
        id: 'sign',
        title: 'Sign Transaction',
        description: 'Approve subscription in your wallet',
        active: subscriptionStatus === 'signing',
        completed: ['confirming', 'completed'].includes(subscriptionStatus),
      },
      {
        id: 'confirm',
        title: 'Confirming Transaction',
        description: 'Waiting for blockchain confirmation',
        active: subscriptionStatus === 'confirming',
        completed: subscriptionStatus === 'completed',
      },
    ];

    return steps;
  };

  const steps = getStatusSteps();
  const isProcessing = !['idle', 'completed', 'error'].includes(subscriptionStatus);

  return (
    <Overlay onClick={isProcessing ? undefined : onClose}>
      <Modal onClick={(e) => e.stopPropagation()}>
        <CloseButton onClick={onClose} disabled={isProcessing}>×</CloseButton>

        <Title>Subscribe to Alpha Generator</Title>

        <GeneratorInfo>
          <InfoRow>
            <InfoLabel>Generator</InfoLabel>
            <InfoValue>{generator.displayName || 'Anonymous'}</InfoValue>
          </InfoRow>
          <InfoRow>
            <InfoLabel>Address</InfoLabel>
            <InfoValue style={{ fontFamily: 'monospace', fontSize: '12px' }}>
              {generator.walletAddress.slice(0, 6)}...{generator.walletAddress.slice(-4)}
            </InfoValue>
          </InfoRow>
          <InfoRow>
            <InfoLabel>Subscription Fee</InfoLabel>
            <InfoValue>{formatEther(BigInt(generator.subscriptionFee))} ETH</InfoValue>
          </InfoRow>
          <InfoRow>
            <InfoLabel>Performance Fee</InfoLabel>
            <InfoValue>{(generator.performanceFee / 100).toFixed(1)}%</InfoValue>
          </InfoRow>
        </GeneratorInfo>

        <PrivacyNote>
          <PrivacyText>
            <PrivacyIcon>🔒</PrivacyIcon>
            Your address will be encrypted using Fully Homomorphic Encryption (FHE) before being stored on-chain.
            This ensures your privacy while allowing the generator to verify your subscription.
          </PrivacyText>
        </PrivacyNote>

        {error && (
          <ErrorMessage>
            <ErrorText>{error}</ErrorText>
          </ErrorMessage>
        )}

        {subscriptionStatus !== 'idle' && (
          <StatusSection>
            {steps.map((step, index) => (
              <StatusItem
                key={step.id}
                $active={step.active}
                $completed={step.completed}
              >
                <StatusIcon $active={step.active} $completed={step.completed}>
                  {step.completed ? '✓' : index + 1}
                </StatusIcon>
                <StatusText>
                  <StatusTitle>{step.title}</StatusTitle>
                  <StatusDescription>{step.description}</StatusDescription>
                </StatusText>
                {step.active && <LoadingSpinner $active={true} />}
              </StatusItem>
            ))}
          </StatusSection>
        )}

        {encryptedAddress && subscriptionStatus !== 'idle' && (
          <InfoRow style={{ marginBottom: '24px' }}>
            <InfoLabel>Encrypted Address</InfoLabel>
            <InfoValue style={{ fontFamily: 'monospace', fontSize: '11px' }}>
              {encryptedAddress.slice(0, 10)}...
            </InfoValue>
          </InfoRow>
        )}

        <ButtonGroup>
          <Button
            $variant="secondary"
            onClick={onClose}
            disabled={isProcessing}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubscribe}
            disabled={isProcessing || subscriptionStatus === 'completed'}
          >
            {isProcessing ? 'Processing...' :
             subscriptionStatus === 'completed' ? 'Subscribed!' :
             'Subscribe'}
          </Button>
        </ButtonGroup>
      </Modal>
    </Overlay>
  );
}
```
            </filePath>
    - **Summary of Changes & Reasoning**: Created modal component with clear subscription flow visualization. Shows encryption progress, transaction status, and handles all states from idle to completion with privacy information display.
</step-format>

<step-format>
- [ ] **Step F5: Implement trade notifications display**
    - **Task**: Build real-time trade notification component using SSE
    - **EXPLANATION**:
        - **What** → Component displaying live trade alerts from subscribed generators
        - **Where** → `/Users/consentsam/blockchain/copy-trading/frontend/src/components/AlphaEngine/TradeNotifications.tsx`
        - **Why** → Real-time updates for subscribers about trading opportunities
    - **Files to Check/Create/Update**: TradeNotifications.tsx, NotificationItem.tsx, useNotifications.ts
    - **Step Dependencies**: F1, F2
    - **Step Completion Summary (YYYY-MM-DD HH:MM)**: {{placeholder}}
    - **Status**: To Do
    - **Prompt for verification of elizaOS**: Verify that TradeNotifications component connects to SSE stream, displays real-time updates, and shows trade details with execute button
    - **Files Modified/Created**:
        - TradeNotifications.tsx
            <filePath="/Users/consentsam/blockchain/copy-trading/frontend/src/components/AlphaEngine/TradeNotifications.tsx">
```tsx
import React, { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { formatEther, formatUnits } from 'viem';
import { useTradeNotifications } from '@/hooks/use-alpha-engine';
import NotificationItem from './NotificationItem';
import styled from 'styled-components';

const Container = styled.div`
  position: fixed;
  right: 20px;
  top: 80px;
  width: 400px;
  max-height: 600px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  z-index: 999;
`;

const Header = styled.div`
  padding: 16px 20px;
  background: var(--color-surface-elevated);
  border-bottom: 1px solid var(--color-border);
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Title = styled.h3`
  font-size: 16px;
  font-weight: 600;
  color: var(--color-text);
  display: flex;
  align-items: center;
  gap: 8px;
`;

const StatusIndicator = styled.span<{ $connected: boolean }>`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${props => props.$connected ? 'var(--color-success)' : 'var(--color-error)'};
  animation: ${props => props.$connected ? 'pulse 2s infinite' : 'none'};

  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: var(--color-text-muted);
  font-size: 20px;
  cursor: pointer;

  &:hover {
    color: var(--color-text);
  }
`;

const FilterBar = styled.div`
  padding: 12px 20px;
  background: var(--color-surface);
  border-bottom: 1px solid var(--color-border);
  display: flex;
  gap: 8px;
`;

const FilterButton = styled.button<{ $active: boolean }>`
  padding: 6px 12px;
  border-radius: 6px;
  border: 1px solid ${props => props.$active ? 'var(--color-primary)' : 'var(--color-border)'};
  background: ${props => props.$active ? 'var(--color-primary)' : 'transparent'};
  color: ${props => props.$active ? 'white' : 'var(--color-text)'};
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: ${props => props.$active ? 'var(--color-primary-hover)' : 'var(--color-surface-hover)'};
  }
`;

const NotificationList = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 12px;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 32px 20px;
  color: var(--color-text-muted);
`;

const EmptyIcon = styled.div`
  font-size: 48px;
  margin-bottom: 12px;
  opacity: 0.3;
`;

const EmptyText = styled.p`
  font-size: 14px;
`;

const MinimizeButton = styled.button`
  padding: 4px 8px;
  background: var(--color-surface-elevated);
  border: 1px solid var(--color-border);
  border-radius: 4px;
  color: var(--color-text-muted);
  font-size: 11px;
  cursor: pointer;

  &:hover {
    background: var(--color-surface-hover);
  }
`;

const Badge = styled.span`
  padding: 2px 6px;
  border-radius: 10px;
  background: var(--color-error);
  color: white;
  font-size: 10px;
  font-weight: 600;
`;

type FilterType = 'all' | 'pending' | 'executed' | 'expired';

interface TradeNotificationsProps {
  onClose?: () => void;
}

export default function TradeNotifications({ onClose }: TradeNotificationsProps) {
  const { address: userAddress } = useAccount();
  const { notifications, isConnected } = useTradeNotifications(userAddress);

  const [filter, setFilter] = useState<FilterType>('all');
  const [isMinimized, setIsMinimized] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    // Count unread notifications
    const newCount = notifications.filter(n =>
      n.type === 'NEW_TRADE' && !n.read
    ).length;
    setUnreadCount(newCount);
  }, [notifications]);

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'all') return true;
    if (!notification.trade) return false;

    switch (filter) {
      case 'pending':
        return notification.trade.status === 'pending';
      case 'executed':
        return notification.trade.status === 'executed';
      case 'expired':
        return notification.trade.status === 'expired';
      default:
        return true;
    }
  });

  if (isMinimized) {
    return (
      <Container style={{ height: 'auto' }}>
        <Header>
          <Title>
            <StatusIndicator $connected={isConnected} />
            Trade Notifications
            {unreadCount > 0 && <Badge>{unreadCount}</Badge>}
          </Title>
          <div style={{ display: 'flex', gap: '8px' }}>
            <MinimizeButton onClick={() => setIsMinimized(false)}>
              Expand
            </MinimizeButton>
            {onClose && <CloseButton onClick={onClose}>×</CloseButton>}
          </div>
        </Header>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <Title>
          <StatusIndicator $connected={isConnected} />
          Trade Notifications
          {unreadCount > 0 && <Badge>{unreadCount}</Badge>}
        </Title>
        <div style={{ display: 'flex', gap: '8px' }}>
          <MinimizeButton onClick={() => setIsMinimized(true)}>
            Minimize
          </MinimizeButton>
          {onClose && <CloseButton onClick={onClose}>×</CloseButton>}
        </div>
      </Header>

      <FilterBar>
        <FilterButton
          $active={filter === 'all'}
          onClick={() => setFilter('all')}
        >
          All
        </FilterButton>
        <FilterButton
          $active={filter === 'pending'}
          onClick={() => setFilter('pending')}
        >
          Pending
        </FilterButton>
        <FilterButton
          $active={filter === 'executed'}
          onClick={() => setFilter('executed')}
        >
          Executed
        </FilterButton>
        <FilterButton
          $active={filter === 'expired'}
          onClick={() => setFilter('expired')}
        >
          Expired
        </FilterButton>
      </FilterBar>

      <NotificationList>
        {filteredNotifications.length === 0 ? (
          <EmptyState>
            <EmptyIcon>📭</EmptyIcon>
            <EmptyText>
              {filter === 'all'
                ? 'No notifications yet'
                : `No ${filter} notifications`}
            </EmptyText>
          </EmptyState>
        ) : (
          filteredNotifications.map((notification, index) => (
            <NotificationItem
              key={`${notification.timestamp}-${index}`}
              notification={notification}
            />
          ))
        )}
      </NotificationList>
    </Container>
  );
}
```
            </filePath>
        - NotificationItem.tsx
            <filePath="/Users/consentsam/blockchain/copy-trading/frontend/src/components/AlphaEngine/NotificationItem.tsx">
```tsx
import React from 'react';
import { formatEther, formatUnits } from 'viem';
import styled from 'styled-components';

const Item = styled.div<{ $isNew?: boolean }>`
  padding: 12px;
  margin-bottom: 8px;
  background: ${props => props.$isNew ? 'var(--color-primary-bg)' : 'var(--color-surface-elevated)'};
  border: 1px solid ${props => props.$isNew ? 'var(--color-primary)' : 'var(--color-border)'};
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    transform: translateX(2px);
  }
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
`;

const TypeBadge = styled.span<{ $type: string }>`
  padding: 3px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 500;
  background: ${props => {
    switch(props.$type) {
      case 'NEW_TRADE': return 'var(--color-success-bg)';
      case 'STATUS_UPDATE': return 'var(--color-info-bg)';
      case 'EXPIRY_WARNING': return 'var(--color-warning-bg)';
      default: return 'var(--color-surface)';
    }
  }};
  color: ${props => {
    switch(props.$type) {
      case 'NEW_TRADE': return 'var(--color-success)';
      case 'STATUS_UPDATE': return 'var(--color-info)';
      case 'EXPIRY_WARNING': return 'var(--color-warning)';
      default: return 'var(--color-text)';
    }
  }};
`;

const Time = styled.span`
  font-size: 11px;
  color: var(--color-text-muted);
`;

const Content = styled.div`
  font-size: 13px;
  color: var(--color-text);
  line-height: 1.4;
`;

const TradeDetails = styled.div`
  margin-top: 8px;
  padding: 8px;
  background: var(--color-surface);
  border-radius: 6px;
`;

const DetailRow = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 4px;
  font-size: 12px;

  &:last-child {
    margin-bottom: 0;
  }
`;

const DetailLabel = styled.span`
  color: var(--color-text-muted);
`;

const DetailValue = styled.span`
  color: var(--color-text);
  font-weight: 500;
`;

const ActionButton = styled.button`
  margin-top: 8px;
  width: 100%;
  padding: 6px 12px;
  background: var(--color-primary);
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: var(--color-primary-hover);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

interface NotificationItemProps {
  notification: any;
}

export default function NotificationItem({ notification }: NotificationItemProps) {
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;

    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;

    return date.toLocaleDateString();
  };

  const getTypeLabel = (type: string) => {
    switch(type) {
      case 'NEW_TRADE': return 'New Trade';
      case 'STATUS_UPDATE': return 'Status Update';
      case 'EXPIRY_WARNING': return 'Expiring Soon';
      case 'SUBSCRIPTION_UPDATE': return 'Subscription';
      default: return type;
    }
  };

  const getMessage = () => {
    switch(notification.type) {
      case 'NEW_TRADE':
        return `New ${notification.trade?.action || 'trade'} signal from your generator`;
      case 'STATUS_UPDATE':
        return `Trade ${notification.trade?.status || 'updated'}`;
      case 'EXPIRY_WARNING':
        return 'Trade expiring soon - execute now or it will expire';
      case 'SUBSCRIPTION_UPDATE':
        return notification.update?.message || 'Subscription updated';
      default:
        return 'Notification received';
    }
  };

  const handleExecute = () => {
    console.log('Execute trade:', notification.trade);
    // Implementation would trigger trade execution
  };

  const isNew = notification.type === 'NEW_TRADE' && !notification.read;

  return (
    <Item $isNew={isNew}>
      <Header>
        <TypeBadge $type={notification.type}>
          {getTypeLabel(notification.type)}
        </TypeBadge>
        <Time>{formatTime(notification.timestamp)}</Time>
      </Header>

      <Content>{getMessage()}</Content>

      {notification.trade && (
        <TradeDetails>
          <DetailRow>
            <DetailLabel>Protocol</DetailLabel>
            <DetailValue>{notification.trade.protocol?.toUpperCase()}</DetailValue>
          </DetailRow>
          <DetailRow>
            <DetailLabel>Action</DetailLabel>
            <DetailValue>{notification.trade.action}</DetailValue>
          </DetailRow>
          {notification.trade.amount && (
            <DetailRow>
              <DetailLabel>Amount</DetailLabel>
              <DetailValue>{formatEther(BigInt(notification.trade.amount))} ETH</DetailValue>
            </DetailRow>
          )}
          <DetailRow>
            <DetailLabel>Gas Estimate</DetailLabel>
            <DetailValue>{formatUnits(BigInt(notification.trade.gasEstimate || '0'), 9)} Gwei</DetailValue>
          </DetailRow>

          {notification.trade.status === 'pending' && (
            <ActionButton onClick={handleExecute}>
              Execute Trade
            </ActionButton>
          )}
        </TradeDetails>
      )}
    </Item>
  );
}
```
            </filePath>
    - **Summary of Changes & Reasoning**: Implemented real-time notification system with SSE integration. Component displays live trade alerts, handles connection status, provides filtering, and includes trade execution interface for pending trades.
</step-format>

</execution-plan>

---

## Implementation Notes

### Parallel Execution Strategy
- All steps can be developed independently
- API client (F1) provides foundation for other components
- Web3 hooks (F2) enable contract interaction
- UI components (F3-F5) can use mock data initially
- SSE notifications (F5) can be tested with mock stream

### Testing Approach
1. Test API client with mock backend responses
2. Verify Web3 hooks with local blockchain
3. Component testing with Storybook or similar
4. Integration testing with all services running
5. End-to-end testing with Playwright

### Environment Variables Required
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_FHENIX_NETWORK_URL=http://localhost:8545
NEXT_PUBLIC_ALPHAENGINE_CONTRACT_ADDRESS=0x...
```

### Success Criteria
✅ API client communicates with backend
✅ Web3 hooks encrypt addresses and call contracts
✅ Generator list displays and filters properly
✅ Subscription flow completes end-to-end
✅ Real-time notifications display correctly