import { apiClient } from '@/utils/api-client';
import { handleApiError, withRetry } from '@/utils/api-error-handler';

/**
 * Confirmations Service
 * Handles trade confirmations broadcasting and completion
 */

export interface BroadcastTradeInput {
  strategyId: string;
  executionParams: {
    protocol: string;
    action: string;
    tokenIn?: string;
    tokenOut?: string;
    amount?: string;
    [key: string]: any; // Allow additional params
  };
  gasEstimate?: string;
}

export interface BroadcastTradeResponse {
  created: number;
  message?: string;
}

export interface CompleteConfirmationInput {
  confirmationId: string;
  isExecuted: boolean;
  executionTxHash?: string;
}

export interface TradeConfirmation {
  confirmationId: string;
  strategyId: string;
  alphaConsumerAddress: string;
  executionParams: any;
  gasEstimate?: string;
  isExecuted: boolean;
  executionTxHash?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Broadcast a trade to all subscribers
 * This is called by the alpha generator when they execute a trade
 */
export const broadcastTrade = async (
  input: BroadcastTradeInput
): Promise<BroadcastTradeResponse> => {
  try {
    const response = await withRetry(() =>
      apiClient.post<BroadcastTradeResponse>('/api/confirmations/broadcast', input)
    );

    return response;
  } catch (error) {
    return handleApiError(error);
  }
};

/**
 * Complete a trade confirmation
 * This is called by the alpha consumer when they execute or skip a trade
 */
export const completeConfirmation = async (
  confirmationId: string,
  isExecuted: boolean,
  executionTxHash?: string
): Promise<TradeConfirmation> => {
  try {
    const data: Partial<CompleteConfirmationInput> = {
      isExecuted,
      ...(executionTxHash && { executionTxHash })
    };
    
    const response = await withRetry(() =>
      apiClient.patch<TradeConfirmation>(`/api/confirmations/${confirmationId}`, data)
    );
    
    return response;
  } catch (error) {
    return handleApiError(error);
  }
};

/**
 * Get pending confirmations for a consumer
 */
export const getPendingConfirmations = async (
  alphaConsumerAddress: string
): Promise<TradeConfirmation[]> => {
  try {
    const response = await withRetry(() =>
      apiClient.get<TradeConfirmation[]>('/api/consumer/pending-trades', {
        params: { alphaConsumerAddress }
      })
    );
    
    return response;
  } catch (error) {
    return handleApiError(error);
  }
};

/**
 * Get confirmations for a strategy (for generators to see broadcast status)
 */
export const getStrategyConfirmations = async (
  strategyId: string
): Promise<TradeConfirmation[]> => {
  try {
    const response = await withRetry(() =>
      apiClient.get<TradeConfirmation[]>(`/api/v1/strategies/${strategyId}/confirmations`)
    );
    
    return response;
  } catch (error) {
    return handleApiError(error);
  }
};

/**
 * Subscribe to SSE events for real-time confirmation updates
 */
export const subscribeToConfirmationEvents = (
  alphaConsumerAddress: string,
  onMessage: (confirmation: TradeConfirmation) => void,
  onError?: (error: Error) => void
): EventSource => {
  const eventSource = new EventSource(
    `/api/confirmations/stream?address=${alphaConsumerAddress}`
  );
  
  eventSource.onmessage = (event) => {
    try {
      const confirmation = JSON.parse(event.data);
      onMessage(confirmation);
    } catch (error) {
      console.error('Failed to parse SSE message:', error);
      if (onError) {
        onError(error as Error);
      }
    }
  };
  
  eventSource.onerror = (error) => {
    console.error('SSE connection error:', error);
    if (onError) {
      onError(new Error('SSE connection failed'));
    }
  };
  
  return eventSource;
};

/**
 * Export the service as a namespace for better organization
 */
export const confirmationsService = {
  broadcastTrade,
  completeConfirmation,
  getPendingConfirmations,
  getStrategyConfirmations,
  subscribeToConfirmationEvents,
};