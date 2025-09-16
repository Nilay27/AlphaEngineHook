import { writeContract, waitForTransactionReceipt, readContract } from '@wagmi/core'
import { config } from '../libs/wagmi-config'
import { apiClient } from '@/utils/api-client'
import { handleApiError, withRetry } from '@/utils/api-error-handler'
import { Subscription, TradeConfirmation, RegisterSubscriptionInput } from '@/types/alphaengine'
import { 
  ALPHAENGINE_ABI, 
  ALPHAENGINE_CONTRACT_ADDRESS,
  strategyIdToBytes32 
} from '@/contracts/AlphaEngineABI'

/**
 * Subscription Service
 * Handles on-chain subscriptions and backend registration
 */

/**
 * Subscribe to a strategy on-chain
 */
export async function subscribeOnChain(args: {
  strategyId: string;
  subscriptionFeeWei: bigint;
}): Promise<`0x${string}`> {
  try {
    // Convert strategy ID to bytes32
    const strategyIdHex = strategyIdToBytes32(args.strategyId);
    
    // Execute the on-chain subscription
    const hash = await writeContract(config, {
      address: ALPHAENGINE_CONTRACT_ADDRESS,
      abi: ALPHAENGINE_ABI,
      functionName: 'subscribeToStrategy',
      args: [strategyIdHex],
      value: args.subscriptionFeeWei,
    });
    
    // Wait for transaction confirmation
    const receipt = await waitForTransactionReceipt(config, { 
      hash,
      confirmations: 2, // Wait for 2 confirmations for safety
    });
    
    if (receipt.status === 'reverted') {
      throw new Error('Transaction reverted. Please check your balance and try again.');
    }
    
    return hash;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : '';
    if (message.includes('insufficient funds')) {
      throw new Error('Insufficient funds to complete the subscription.');
    }
    if (message.includes('user rejected')) {
      throw new Error('Transaction was rejected by the user.');
    }
    throw error;
  }
}

/**
 * Register subscription with backend after on-chain confirmation
 */
export const registerSubscription = async (
  strategyId: string,
  alphaConsumerAddress: string,
  subscriptionTxHash: string
): Promise<Subscription> => {
  try {
    const data: RegisterSubscriptionInput = {
      strategyId,
      alphaConsumerAddress,
      subscriptionTxHash,
    };
    
    return await withRetry(() =>
      apiClient.post<Subscription>(`/api/strategies/${strategyId}/subscribe`, data)
    );
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * Get pending trades for a consumer
 */
export const getConsumerPendingTrades = async (
  alphaConsumerAddress: string
): Promise<TradeConfirmation[]> => {
  try {
    return await withRetry(() =>
      apiClient.get<TradeConfirmation[]>('/api/consumer/pending-trades', {
        params: { alphaConsumerAddress }
      })
    );
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * Check if user is subscribed to a strategy on-chain
 */
export const checkSubscriptionOnChain = async (
  subscriberAddress: string,
  strategyId: string
): Promise<{
  subscriptionId: bigint;
  isActive: boolean;
  subscribedAt: bigint;
  subscriptionFee: bigint;
}> => {
  try {
    const strategyIdHex = strategyIdToBytes32(strategyId);
    
    const result = await readContract(config, {
      address: ALPHAENGINE_CONTRACT_ADDRESS,
      abi: ALPHAENGINE_ABI,
      functionName: 'getSubscription',
      args: [subscriberAddress as `0x${string}`, strategyIdHex],
    });
    
    return {
      subscriptionId: result[0] as bigint,
      isActive: result[1] as boolean,
      subscribedAt: result[2] as bigint,
      subscriptionFee: result[3] as bigint,
    };
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * Unsubscribe from a strategy
 */
export const unsubscribeFromStrategy = async (
  strategyId: string
): Promise<`0x${string}`> => {
  try {
    const strategyIdHex = strategyIdToBytes32(strategyId);
    
    const hash = await writeContract(config, {
      address: ALPHAENGINE_CONTRACT_ADDRESS,
      abi: ALPHAENGINE_ABI,
      functionName: 'unsubscribeFromStrategy',
      args: [strategyIdHex],
    });
    
    await waitForTransactionReceipt(config, { 
      hash,
      confirmations: 2,
    });
    
    return hash;
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * Get all strategies a user is subscribed to
 */
export const getSubscriberStrategies = async (
  subscriberAddress: string
): Promise<string[]> => {
  try {
    const result = await readContract(config, {
      address: ALPHAENGINE_CONTRACT_ADDRESS,
      abi: ALPHAENGINE_ABI,
      functionName: 'getSubscriberStrategies',
      args: [subscriberAddress as `0x${string}`],
    });
    
    // Convert bytes32 array back to strategy IDs
    return (result as `0x${string}`[]).map(hex => hex);
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * Export the service as a namespace for better organization
 */
export const subscriptionService = {
  subscribeOnChain,
  registerSubscription,
  getConsumerPendingTrades,
  checkSubscriptionOnChain,
  unsubscribeFromStrategy,
  getSubscriberStrategies,
};