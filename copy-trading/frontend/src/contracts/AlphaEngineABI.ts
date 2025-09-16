/**
 * AlphaEngine Smart Contract ABI and Configuration
 */

/**
 * AlphaEngine contract ABI
 * Defines the interface for interacting with the AlphaEngine smart contract
 */
export const ALPHAENGINE_ABI = [
  // subscribeToStrategy function - payable function to subscribe to a strategy
  {
    name: 'subscribeToStrategy',
    type: 'function',
    stateMutability: 'payable',
    inputs: [
      {
        name: 'strategyId',
        type: 'bytes32',
        internalType: 'bytes32',
      },
    ],
    outputs: [
      {
        name: 'subscriptionId',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
  },
  // StrategySubscribed event - emitted when a user subscribes to a strategy
  {
    name: 'StrategySubscribed',
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'subscriber',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
      {
        name: 'strategyId',
        type: 'bytes32',
        indexed: true,
        internalType: 'bytes32',
      },
      {
        name: 'subscriptionId',
        type: 'uint256',
        indexed: false,
        internalType: 'uint256',
      },
      {
        name: 'subscriptionFee',
        type: 'uint256',
        indexed: false,
        internalType: 'uint256',
      },
      {
        name: 'timestamp',
        type: 'uint256',
        indexed: false,
        internalType: 'uint256',
      },
    ],
  },
  // getSubscription function - view function to get subscription details
  {
    name: 'getSubscription',
    type: 'function',
    stateMutability: 'view',
    inputs: [
      {
        name: 'subscriber',
        type: 'address',
        internalType: 'address',
      },
      {
        name: 'strategyId',
        type: 'bytes32',
        internalType: 'bytes32',
      },
    ],
    outputs: [
      {
        name: 'subscriptionId',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: 'isActive',
        type: 'bool',
        internalType: 'bool',
      },
      {
        name: 'subscribedAt',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: 'subscriptionFee',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
  },
  // executeTradeForSubscriber function - execute a trade on behalf of a subscriber
  {
    name: 'executeTradeForSubscriber',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      {
        name: 'subscriber',
        type: 'address',
        internalType: 'address',
      },
      {
        name: 'strategyId',
        type: 'bytes32',
        internalType: 'bytes32',
      },
      {
        name: 'tradeData',
        type: 'bytes',
        internalType: 'bytes',
      },
    ],
    outputs: [
      {
        name: 'success',
        type: 'bool',
        internalType: 'bool',
      },
    ],
  },
  // TradeExecuted event - emitted when a trade is executed for a subscriber
  {
    name: 'TradeExecuted',
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'subscriber',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
      {
        name: 'strategyId',
        type: 'bytes32',
        indexed: true,
        internalType: 'bytes32',
      },
      {
        name: 'executor',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
      {
        name: 'tradeData',
        type: 'bytes',
        indexed: false,
        internalType: 'bytes',
      },
      {
        name: 'timestamp',
        type: 'uint256',
        indexed: false,
        internalType: 'uint256',
      },
    ],
  },
  // unsubscribeFromStrategy function - unsubscribe from a strategy
  {
    name: 'unsubscribeFromStrategy',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      {
        name: 'strategyId',
        type: 'bytes32',
        internalType: 'bytes32',
      },
    ],
    outputs: [
      {
        name: 'success',
        type: 'bool',
        internalType: 'bool',
      },
    ],
  },
  // StrategyUnsubscribed event
  {
    name: 'StrategyUnsubscribed',
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'subscriber',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
      {
        name: 'strategyId',
        type: 'bytes32',
        indexed: true,
        internalType: 'bytes32',
      },
      {
        name: 'timestamp',
        type: 'uint256',
        indexed: false,
        internalType: 'uint256',
      },
    ],
  },
  // getStrategySubscribers function - get all subscribers for a strategy
  {
    name: 'getStrategySubscribers',
    type: 'function',
    stateMutability: 'view',
    inputs: [
      {
        name: 'strategyId',
        type: 'bytes32',
        internalType: 'bytes32',
      },
    ],
    outputs: [
      {
        name: 'subscribers',
        type: 'address[]',
        internalType: 'address[]',
      },
    ],
  },
  // getSubscriberStrategies function - get all strategies a user is subscribed to
  {
    name: 'getSubscriberStrategies',
    type: 'function',
    stateMutability: 'view',
    inputs: [
      {
        name: 'subscriber',
        type: 'address',
        internalType: 'address',
      },
    ],
    outputs: [
      {
        name: 'strategyIds',
        type: 'bytes32[]',
        internalType: 'bytes32[]',
      },
    ],
  },
] as const;

/**
 * Get the AlphaEngine contract address from environment
 */
export const ALPHAENGINE_CONTRACT_ADDRESS = 
  (process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || '0x0000000000000000000000000000000000000000') as `0x${string}`;

/**
 * Helper function to convert strategy ID to bytes32
 */
export function strategyIdToBytes32(strategyId: string): `0x${string}` {
  // If already a hex string, ensure it's properly formatted
  if (strategyId.startsWith('0x')) {
    // Pad to 32 bytes (64 hex chars)
    return (`0x${strategyId.slice(2).padEnd(64, '0')}`) as `0x${string}`;
  }
  
  // Convert string to hex and pad to 32 bytes
  const hex = Buffer.from(strategyId).toString('hex');
  return (`0x${hex.padEnd(64, '0')}`) as `0x${string}`;
}

/**
 * Helper function to convert bytes32 back to strategy ID
 */
export function bytes32ToStrategyId(bytes32: string): string {
  // Remove 0x prefix and trailing zeros
  const hex = bytes32.slice(2).replace(/0+$/, '');
  
  // Convert hex back to string
  if (hex.length === 0) return '';
  
  try {
    return Buffer.from(hex, 'hex').toString();
  } catch {
    // If conversion fails, return the original hex
    return bytes32;
  }
}