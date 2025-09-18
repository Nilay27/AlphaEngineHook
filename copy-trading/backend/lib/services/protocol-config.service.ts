import { ethers } from 'ethers';
import { 
  ProtocolAction, 
  ExecutionData, 
  getActionConfig, 
  validateActionParams,
  ProtocolActionConfig 
} from '@/lib/protocols/action-mappings';
import { db } from '@/db/db';
import { protocolsTable } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

export interface EncodedExecutionData {
  encoded: string;
  protocolAddress: string;
  gasEstimate: bigint;
  value: bigint;
}

export class ProtocolConfigService {
  static encodeActionId(protocol: string, action: ProtocolAction): string {
    return ethers.keccak256(
      ethers.solidityPacked(['string', 'string'], [protocol, action])
    ).slice(0, 10);
  }

  static decodeActionId(actionId: string): { protocol: string; action: ProtocolAction } | null {
    const knownActions = [
      { protocol: 'uniswap', action: ProtocolAction.SWAP },
      { protocol: 'uniswap', action: ProtocolAction.ADD_LIQUIDITY },
      { protocol: 'uniswap', action: ProtocolAction.REMOVE_LIQUIDITY },
      { protocol: 'aave', action: ProtocolAction.BORROW },
      { protocol: 'aave', action: ProtocolAction.LEND },
      { protocol: 'aave', action: ProtocolAction.REPAY },
      { protocol: 'aave', action: ProtocolAction.WITHDRAW },
      { protocol: 'gmx', action: ProtocolAction.OPEN_POSITION },
      { protocol: 'gmx', action: ProtocolAction.CLOSE_POSITION },
      { protocol: 'gmx', action: ProtocolAction.ADJUST_POSITION },
      { protocol: '1inch', action: ProtocolAction.SWAP },
    ];

    for (const known of knownActions) {
      const encoded = this.encodeActionId(known.protocol, known.action);
      if (encoded === actionId) {
        return known;
      }
    }

    return null;
  }

  static async encodeExecutionData(executionData: ExecutionData): Promise<EncodedExecutionData> {
    const actionConfig = getActionConfig(executionData.protocolId, executionData.action);
    
    if (!actionConfig) {
      throw new Error(`Unknown action: ${executionData.protocolId}/${executionData.action}`);
    }

    const validation = validateActionParams(actionConfig, executionData.params);
    if (!validation.valid) {
      throw new Error(`Missing required parameters: ${validation.missing.join(', ')}`);
    }

    const [protocol] = await db
      .select()
      .from(protocolsTable)
      .where(eq(protocolsTable.name, executionData.protocolId))
      .limit(1);

    if (!protocol || !protocol.contractAddress) {
      throw new Error(`Protocol ${executionData.protocolId} not configured`);
    }

    const types: string[] = [];
    const values: any[] = [];

    types.push('bytes4');
    values.push(this.encodeActionId(executionData.protocolId, executionData.action));

    for (const param of actionConfig.requiredParams) {
      const value = executionData.params[param];
      const paramType = this.getParamType(param, value);
      types.push(paramType);
      values.push(value);
    }

    const encoded = ethers.AbiCoder.defaultAbiCoder().encode(types, values);

    return {
      encoded,
      protocolAddress: protocol.contractAddress,
      gasEstimate: executionData.gasLimit || actionConfig.estimatedGas || BigInt(300000),
      value: executionData.value || BigInt(0),
    };
  }

  static async decodeExecutionData(encoded: string): Promise<ExecutionData> {
    const actionIdBytes = encoded.slice(0, 10);
    const decoded = this.decodeActionId(actionIdBytes);

    if (!decoded) {
      throw new Error('Unknown action ID');
    }

    const actionConfig = getActionConfig(decoded.protocol, decoded.action);
    if (!actionConfig) {
      throw new Error('Action configuration not found');
    }

    const types = ['bytes4'];
    for (const param of actionConfig.requiredParams) {
      types.push(this.getParamType(param, null));
    }

    const decodedValues = ethers.AbiCoder.defaultAbiCoder().decode(types, encoded);
    
    const params: Record<string, any> = {};
    for (let i = 0; i < actionConfig.requiredParams.length; i++) {
      params[actionConfig.requiredParams[i]] = decodedValues[i + 1];
    }

    return {
      protocolId: decoded.protocol,
      action: decoded.action,
      params,
    };
  }

  private static getParamType(paramName: string, value: any): string {
    const addressParams = ['token', 'tokenIn', 'tokenOut', 'tokenA', 'tokenB', 'asset', 'collateralToken', 'indexToken', 'fromToken', 'toToken', 'recipient', 'onBehalfOf', 'referrer', 'receiver'];
    const uintParams = ['amount', 'amountIn', 'amountOut', 'amountA', 'amountB', 'minAmountOut', 'minAmountA', 'minAmountB', 'sizeDelta', 'price', 'acceptablePrice', 'executionFee', 'minReturnAmount', 'deadline', 'referralCode'];
    const boolParams = ['isLong', 'disableEstimate'];
    const bytesParams = ['data', 'path'];

    if (addressParams.some(p => paramName.toLowerCase().includes(p.toLowerCase()))) {
      return 'address';
    }
    if (uintParams.some(p => paramName.toLowerCase().includes(p.toLowerCase()))) {
      return 'uint256';
    }
    if (boolParams.some(p => paramName.toLowerCase().includes(p.toLowerCase()))) {
      return 'bool';
    }
    if (bytesParams.some(p => paramName.toLowerCase().includes(p.toLowerCase()))) {
      return 'bytes';
    }
    if (paramName.includes('interestRateMode')) {
      return 'uint256';
    }

    if (value !== null && value !== undefined) {
      if (typeof value === 'boolean') return 'bool';
      if (typeof value === 'string' && value.startsWith('0x') && value.length === 42) return 'address';
      if (typeof value === 'bigint' || typeof value === 'number') return 'uint256';
    }

    return 'bytes32';
  }

  static async validateProtocolAction(
    protocolId: string, 
    action: ProtocolAction, 
    params: Record<string, any>
  ): Promise<{ 
    valid: boolean; 
    errors: string[];
    config?: ProtocolActionConfig;
  }> {
    const errors: string[] = [];
    
    const [protocol] = await db
      .select()
      .from(protocolsTable)
      .where(
        and(
          eq(protocolsTable.name, protocolId),
          eq(protocolsTable.isActive, true)
        )
      )
      .limit(1);

    if (!protocol) {
      errors.push(`Protocol ${protocolId} not found or inactive`);
      return { valid: false, errors };
    }

    const actionConfig = getActionConfig(protocolId, action);
    if (!actionConfig) {
      errors.push(`Action ${action} not supported for protocol ${protocolId}`);
      return { valid: false, errors };
    }

    const validation = validateActionParams(actionConfig, params);
    if (!validation.valid) {
      errors.push(`Missing required parameters: ${validation.missing.join(', ')}`);
    }

    for (const [key, value] of Object.entries(params)) {
      if (key.toLowerCase().includes('address') || key.toLowerCase().includes('token')) {
        if (typeof value === 'string' && !ethers.isAddress(value)) {
          errors.push(`Invalid address format for parameter ${key}`);
        }
      }
      
      if (key.toLowerCase().includes('amount') || key.toLowerCase().includes('price')) {
        try {
          BigInt(value);
        } catch {
          errors.push(`Invalid numeric value for parameter ${key}`);
        }
      }
    }

    return { 
      valid: errors.length === 0, 
      errors,
      config: actionConfig
    };
  }

  static async getProtocolByAddress(contractAddress: string): Promise<any> {
    const [protocol] = await db
      .select()
      .from(protocolsTable)
      .where(eq(protocolsTable.contractAddress, contractAddress))
      .limit(1);
    
    return protocol;
  }

  static async getAllActiveProtocols(): Promise<any[]> {
    return await db
      .select()
      .from(protocolsTable)
      .where(eq(protocolsTable.isActive, true));
  }
}

export const protocolConfigService = new ProtocolConfigService();