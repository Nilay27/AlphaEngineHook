export enum ProtocolAction {
  SWAP = 'SWAP',
  ADD_LIQUIDITY = 'ADD_LIQUIDITY',
  REMOVE_LIQUIDITY = 'REMOVE_LIQUIDITY',
  STAKE = 'STAKE',
  UNSTAKE = 'UNSTAKE',
  BORROW = 'BORROW',
  REPAY = 'REPAY',
  LEND = 'LEND',
  WITHDRAW = 'WITHDRAW',
  OPEN_POSITION = 'OPEN_POSITION',
  CLOSE_POSITION = 'CLOSE_POSITION',
  ADJUST_POSITION = 'ADJUST_POSITION',
}

export interface ProtocolActionConfig {
  action: ProtocolAction;
  protocol: string;
  displayName: string;
  description: string;
  requiredParams: string[];
  optionalParams?: string[];
  estimatedGas?: bigint;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
}

export const PROTOCOL_ACTIONS: ProtocolActionConfig[] = [
  {
    action: ProtocolAction.SWAP,
    protocol: 'uniswap',
    displayName: 'Token Swap',
    description: 'Swap one token for another',
    requiredParams: ['tokenIn', 'tokenOut', 'amountIn', 'minAmountOut'],
    optionalParams: ['deadline', 'recipient'],
    estimatedGas: BigInt(200000),
    riskLevel: 'LOW',
  },
  {
    action: ProtocolAction.ADD_LIQUIDITY,
    protocol: 'uniswap',
    displayName: 'Add Liquidity',
    description: 'Provide liquidity to a trading pair',
    requiredParams: ['tokenA', 'tokenB', 'amountA', 'amountB'],
    optionalParams: ['minAmountA', 'minAmountB', 'deadline'],
    estimatedGas: BigInt(300000),
    riskLevel: 'MEDIUM',
  },
  {
    action: ProtocolAction.BORROW,
    protocol: 'aave',
    displayName: 'Borrow Asset',
    description: 'Borrow assets against collateral',
    requiredParams: ['asset', 'amount', 'interestRateMode'],
    optionalParams: ['referralCode', 'onBehalfOf'],
    estimatedGas: BigInt(350000),
    riskLevel: 'HIGH',
  },
  {
    action: ProtocolAction.LEND,
    protocol: 'aave',
    displayName: 'Supply Asset',
    description: 'Supply assets to earn interest',
    requiredParams: ['asset', 'amount'],
    optionalParams: ['onBehalfOf', 'referralCode'],
    estimatedGas: BigInt(250000),
    riskLevel: 'LOW',
  },
  {
    action: ProtocolAction.OPEN_POSITION,
    protocol: 'gmx',
    displayName: 'Open Position',
    description: 'Open a leveraged trading position',
    requiredParams: ['collateralToken', 'indexToken', 'isLong', 'sizeDelta', 'price'],
    optionalParams: ['acceptablePrice', 'executionFee'],
    estimatedGas: BigInt(400000),
    riskLevel: 'HIGH',
  },
  {
    action: ProtocolAction.CLOSE_POSITION,
    protocol: 'gmx',
    displayName: 'Close Position',
    description: 'Close an existing position',
    requiredParams: ['collateralToken', 'indexToken', 'isLong', 'sizeDelta', 'price'],
    optionalParams: ['acceptablePrice', 'executionFee'],
    estimatedGas: BigInt(350000),
    riskLevel: 'MEDIUM',
  },
  {
    action: ProtocolAction.SWAP,
    protocol: '1inch',
    displayName: 'Aggregated Swap',
    description: 'Swap through multiple DEXs for best price',
    requiredParams: ['fromToken', 'toToken', 'amount', 'minReturnAmount'],
    optionalParams: ['referrer', 'receiver', 'disableEstimate'],
    estimatedGas: BigInt(250000),
    riskLevel: 'LOW',
  },
];

export interface ExecutionData {
  protocolId: string;
  action: ProtocolAction;
  params: Record<string, any>;
  gasLimit?: bigint;
  value?: bigint;
  deadline?: number;
}

export function getActionConfig(
  protocol: string, 
  action: ProtocolAction
): ProtocolActionConfig | undefined {
  return PROTOCOL_ACTIONS.find(
    (config) => config.protocol === protocol && config.action === action
  );
}

export function validateActionParams(
  config: ProtocolActionConfig,
  params: Record<string, any>
): { valid: boolean; missing: string[] } {
  const missing: string[] = [];
  
  for (const required of config.requiredParams) {
    if (!(required in params) || params[required] === undefined || params[required] === null) {
      missing.push(required);
    }
  }
  
  return {
    valid: missing.length === 0,
    missing,
  };
}