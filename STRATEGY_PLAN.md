# Simplified Strategy Implementation Plan

## Overview

Simplified approach for integrating FHE-encrypted trade intents with AVS infrastructure. This plan focuses on practical implementation with encrypted function calls and parameters.

## Architecture

### 1. Liquidity Split (Custom Hook Function)
- 10% → Uniswap V4 Pool
- 10% → Aave (Safety Buffer)
- 80% → BoringVault (Strategy Management)

### 2. Encrypted Intent Structure

```solidity
// All components can be FHE encrypted
struct EncryptedIntent {
    euint256 ctDecoder;     // Encrypted decoder/sanitizer address
    euint256 ctTarget;      // Encrypted target protocol address
    euint32 ctSelector;     // Encrypted 4-byte function selector
    ArgType[] argTypes;     // Argument types (can be plaintext for PoC)
    euint256[] ctArgs;      // Encrypted arguments array
}
```

### 3. Argument Encoding

```solidity
// Example: Aave Supply
// Original: supply(address,uint256,address,uint16)

ctDecoder  = Enc(address(AaveV3Decoder))
ctTarget   = Enc(address(v3Pool))
ctSelector = Enc(0x617ba037)  // supply selector
argTypes   = [ADDR, U256, ADDR, U16]
ctArgs     = [
    Enc(USDC),
    Enc(500e6),
    Enc(BoringVault),
    Enc(0)
]
```

## Implementation Components

### 1. SimpleBoringVault

```solidity
contract SimpleBoringVault {
    address public immutable hook;
    address public immutable tradeManager;

    mapping(address => uint256) public balances;

    modifier onlyAuthorized() {
        require(msg.sender == hook || msg.sender == tradeManager, "Unauthorized");
        _;
    }

    function deposit(address token, uint256 amount) external onlyAuthorized {
        IERC20(token).transferFrom(msg.sender, address(this), amount);
        balances[token] += amount;
    }

    function execute(
        address target,
        bytes calldata data,
        uint256 value
    ) external onlyAuthorized returns (bytes memory) {
        return target.functionCallWithValue(data, value);
    }
}
```

### 2. TradeManager AVS

```solidity
contract TradeManager {

    struct UEI { // Universal Encrypted Intent
        bytes32 intentId;
        address submitter;
        bytes ctBlob;  // Contains all encrypted components
        uint256 deadline;
        uint256 blockSubmitted;
        address[] selectedOperators;
    }

    mapping(bytes32 => UEI) public intents;

    event UEISubmitted(
        bytes32 indexed intentId,
        address indexed submitter,
        bytes ctBlob,
        uint256 deadline
    );

    event UEIProcessed(
        bytes32 indexed intentId,
        bool success,
        bytes result
    );

    function submitUEI(bytes calldata ctBlob, uint256 deadline)
        external
        returns (bytes32 intentId)
    {
        intentId = keccak256(abi.encode(msg.sender, ctBlob, deadline, block.number));

        address[] memory operators = _selectOperators(intentId);

        intents[intentId] = UEI({
            intentId: intentId,
            submitter: msg.sender,
            ctBlob: ctBlob,
            deadline: deadline,
            blockSubmitted: block.number,
            selectedOperators: operators
        });

        emit UEISubmitted(intentId, msg.sender, ctBlob, deadline);
    }

    function processUEI(
        bytes32 intentId,
        address decoder,
        address target,
        bytes calldata reconstructedData
    ) external onlyOperator {
        UEI memory intent = intents[intentId];
        require(block.timestamp <= intent.deadline, "Intent expired");

        // Execute through vault
        bytes memory result = SimpleBoringVault(vaultAddress).execute(
            target,
            reconstructedData,
            0
        );

        emit UEIProcessed(intentId, true, result);
    }
}
```

### 3. Hook Modifications

```solidity
contract UniversalPrivacyHook {

    SimpleBoringVault public boringVault;
    address public aavePool;
    TradeManager public tradeManager;

    // Custom liquidity function with splits
    function addLiquidityWithStrategy(
        PoolKey calldata key,
        ModifyLiquidityParams calldata params,
        bytes calldata hookData
    ) external returns (BalanceDelta) {

        uint256 amount0 = uint256(params.liquidityDelta);
        uint256 amount1 = uint256(params.liquidityDelta);

        // 10% to pool
        uint256 poolAmount0 = amount0 * 10 / 100;
        uint256 poolAmount1 = amount1 * 10 / 100;

        // 10% to Aave
        uint256 aaveAmount0 = amount0 * 10 / 100;
        uint256 aaveAmount1 = amount1 * 10 / 100;

        // 80% to BoringVault
        uint256 vaultAmount0 = amount0 * 80 / 100;
        uint256 vaultAmount1 = amount1 * 80 / 100;

        // Transfer to respective destinations
        _addToPool(key, poolAmount0, poolAmount1);
        _supplyToAave(key.currency0, aaveAmount0);
        _supplyToAave(key.currency1, aaveAmount1);
        _depositToVault(key.currency0, vaultAmount0);
        _depositToVault(key.currency1, vaultAmount1);

        return toBalanceDelta(int128(amount0), int128(amount1));
    }

    // Submit encrypted trade intent
    function submitTradeIntent(
        euint256 ctDecoder,
        euint256 ctTarget,
        euint32 ctSelector,
        ArgType[] calldata argTypes,
        euint256[] calldata ctArgs,
        uint256 deadline
    ) external returns (bytes32) {

        // Pack all encrypted data
        bytes memory ctBlob = abi.encode(
            ctDecoder,
            ctTarget,
            ctSelector,
            argTypes,
            ctArgs
        );

        // Submit to TradeManager AVS
        bytes32 intentId = tradeManager.submitUEI(ctBlob, deadline);

        emit TradeIntentSubmitted(intentId, msg.sender);

        return intentId;
    }
}
```

### 4. Operator Processing (TypeScript)

```typescript
// operator/tradeProcessor.ts

interface EncryptedIntent {
  ctDecoder: bigint;    // ctHash of decoder address
  ctTarget: bigint;     // ctHash of target address
  ctSelector: bigint;   // ctHash of function selector
  argTypes: ArgType[];  // [ADDR, U256, ADDR, U16]
  ctArgs: bigint[];     // Array of ctHashes
}

async function processTradeIntent(intentId: string, ctBlob: string) {
  // 1. Decode the blob
  const intent = decodeIntentBlob(ctBlob);

  // 2. Decrypt all components
  const decoder = await decryptAddress(intent.ctDecoder);
  const target = await decryptAddress(intent.ctTarget);
  const selector = await decryptSelector(intent.ctSelector);
  const args = await decryptArguments(intent.ctArgs, intent.argTypes);

  // 3. Reconstruct calldata
  const reconstructedData = encodeCalldata(selector, args, intent.argTypes);

  // 4. Verify selector is allowed in decoder
  const isValid = await verifySelector(decoder, selector);
  if (!isValid) throw new Error("Invalid selector for decoder");

  // 5. Simulate execution
  const simulation = await simulateTrade(target, reconstructedData);

  // 6. Submit to TradeManager for execution
  if (simulation.profitable) {
    await tradeManager.processUEI(
      intentId,
      decoder,
      target,
      reconstructedData
    );
  }
}

function encodeCalldata(
  selector: string,
  args: any[],
  argTypes: ArgType[]
): string {

  // Reconstruct the calldata from decrypted components
  const types = argTypes.map(t => {
    switch(t) {
      case ArgType.ADDR: return 'address';
      case ArgType.U256: return 'uint256';
      case ArgType.U16: return 'uint16';
      default: throw new Error('Unknown type');
    }
  });

  // Encode arguments according to their types
  const encoded = ethers.utils.defaultAbiCoder.encode(types, args);

  // Combine selector + encoded args
  return selector + encoded.slice(2);
}
```

## Benefits of This Approach

1. **Full Encryption**: Every component can be FHE encrypted
   - Decoder/Sanitizer address
   - Target protocol
   - Function selector
   - All arguments

2. **Simplicity**: Clean separation of concerns
   - Hook handles liquidity splits
   - Vault manages capital
   - AVS processes intents

3. **Flexibility**: Supports any DeFi protocol
   - Works with existing decoders
   - No need to modify protocols
   - Extensible to new strategies

4. **Privacy**: Complete trade privacy until execution
   - Strategy type hidden
   - Amounts hidden
   - Protocols hidden

## Implementation Steps

### Phase 1: Core Infrastructure (Week 1)
- [ ] Deploy SimpleBoringVault
- [ ] Deploy TradeManager AVS
- [ ] Modify hook with custom addLiquidity

### Phase 2: Encryption Layer (Week 2)
- [ ] Implement FHE encoding for all components
- [ ] Add decryption in operator
- [ ] Test with simple strategies

### Phase 3: Integration (Week 3)
- [ ] Connect all components
- [ ] End-to-end testing
- [ ] Gas optimization

## Example Usage

```javascript
// User submits encrypted Aave supply intent

// 1. Encrypt components
const ctDecoder = await encryptAddress(AaveV3Decoder);
const ctTarget = await encryptAddress(AavePool);
const ctSelector = await encryptBytes4("0x617ba037"); // supply
const ctArgs = [
  await encryptAddress(USDC),
  await encryptUint256(500e6),
  await encryptAddress(BoringVault),
  await encryptUint16(0)
];

// 2. Submit to hook
await hook.submitTradeIntent(
  ctDecoder,
  ctTarget,
  ctSelector,
  [ArgType.ADDR, ArgType.U256, ArgType.ADDR, ArgType.U16],
  ctArgs,
  deadline
);

// 3. AVS operators decrypt and execute
// Automatically handled by operator infrastructure
```

This approach provides full FHE encryption while maintaining simplicity and compatibility with existing DeFi protocols.