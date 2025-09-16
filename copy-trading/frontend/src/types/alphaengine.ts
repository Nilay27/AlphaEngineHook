/**
 * AlphaEngine Type Definitions
 * Complete types matching backend schema exactly
 */

/**
 * Strategy represents an alpha generation strategy
 */
export interface Strategy {
  strategyId: string;
  strategyName: string;
  strategyDescription?: string;
  subscriptionFee: string; // Wei amount as string
  supportedProtocols?: string[];
  strategyJSON?: Record<string, unknown>; // JSON configuration
  alphaGeneratorAddress: string;
  subscriberCount: number;
  totalVolume: string; // Wei amount as string
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Subscription represents a consumer's subscription to a strategy
 */
export interface Subscription {
  subscriptionId: string;
  strategyId: string;
  alphaConsumerAddress: string;
  subscriptionTxHash: string;
  subscribedAt: string;
  isActive: boolean;
}

/**
 * TradeConfirmation represents a pending trade for execution
 */
export interface TradeConfirmation {
  confirmationId: string;
  strategyId: string;
  alphaConsumerAddress: string;
  executionParams: {
    protocol: string;
    action: string;
    tokenIn?: string;
    tokenOut?: string;
    amount?: string;
    data?: Record<string, unknown>;
  };
  gasEstimate?: string;
  isExecuted: boolean;
  executionTxHash?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Subscriber represents a simplified view of a strategy subscriber
 */
export interface Subscriber {
  alphaConsumerAddress: string;
  subscribedAt: string;
  isActive: boolean;
}

/**
 * API Response wrapper types
 */
export interface ApiResponse<T = unknown> {
  data: T;
  message?: string;
  isSuccess: boolean;
}

/**
 * Strategy creation input
 */
export interface CreateStrategyInput {
  strategyName: string;
  strategyDescription?: string;
  subscriptionFee: string;
  supportedProtocols: string[];
  strategyJSON: Record<string, unknown>;
  alphaGeneratorAddress: string;
}

/**
 * Subscription registration input
 */
export interface RegisterSubscriptionInput {
  strategyId: string;
  alphaConsumerAddress: string;
  subscriptionTxHash: string;
}

/**
 * Broadcast confirmation input
 */
export interface BroadcastConfirmationInput {
  strategyId: string;
  executionParams: TradeConfirmation['executionParams'];
  gasEstimate?: string;
}