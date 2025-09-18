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