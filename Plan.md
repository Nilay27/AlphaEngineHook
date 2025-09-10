# AlphaEngine FHE Smart Contract Development Plan 🔐

**Project**: Private Swap Protocol using Fully Homomorphic Encryption (FHE)  
**Framework**: Fhenix CoFHE + Uniswap v4 Hooks  
**Goal**: Enable private swaps with encrypted balances and batched execution

---

## 📋 Overview

This plan outlines the development of AlphaEngine v1, a privacy-preserving swap protocol that combines:
- **FHE Encrypted Balances** (eUSDC, eUSDT) using Fhenix CoFHE
- **Uniswap v4 Hook Architecture** for execution gating
- **AVS-Style Batching** for user privacy and MEV protection
- **Multi-transaction Decryption** patterns for secure reveals

## 🎯 Core Components to Build

### 1. HookVault Contract (Primary FHE Contract)
**Purpose**: Uniswap v4 Hook + Shielded Vault with encrypted balances

**FHE Implementation Patterns**:
```solidity
// Core data structures using FHE types
mapping(address token => mapping(address user => euint256 eBal)) private balances;
mapping(bytes32 intentId => Intent) private intents;
mapping(bytes32 batchId => BatchState) private batches;

// FHE constants for reuse
euint256 private ENCRYPTED_ZERO;
euint256 private ENCRYPTED_ONE;
```

**Key Functions to Implement**:
- `deposit(token, amount)` - Convert ERC20 to encrypted balance
- `submitIntent(tokenIn, tokenOut, ctAmount, ctMinOut, deadline)` - Submit encrypted swap intent
- `executeBatch(batchId, bounds, sigAgg)` - Execute batched swaps via hook
- `withdraw(token, amount, recipient)` - Redeem encrypted balance to ERC20

**FHE Access Control Strategy**:
- `FHE.allowThis()` for all stored encrypted values
- `FHE.allowSender()` for user-facing returns
- `FHE.allow(value, decryptorAddr)` for AVS decryption permits

### 2. Intent Management System
**Purpose**: Handle encrypted swap intents with proper access control

**FHE Patterns for Intent Storage**:
```solidity
struct Intent {
    bytes32 ctAmountHandle;     // Encrypted amount handle
    bytes32 ctMinOutHandle;     // Encrypted min output handle
    address tokenIn;
    address tokenOut;
    address owner;
    uint64 deadline;
    IntentStatus status;
}

// Intent submission with FHE access control
function submitIntent(
    address tokenIn,
    address tokenOut,
    InEuint256 calldata ctAmount,
    InEuint256 calldata ctMinOut,
    uint64 deadline
) external {
    euint256 encAmount = FHE.asEuint256(ctAmount);
    euint256 encMinOut = FHE.asEuint256(ctMinOut);
    
    // Grant decryption permissions to AVS
    FHE.allow(encAmount, decryptorAddr);
    FHE.allow(encMinOut, decryptorAddr);
    
    // Store intent with contract access
    FHE.allowThis(encAmount);
    FHE.allowThis(encMinOut);
}
```

### 3. Encrypted Balance Management
**Purpose**: Secure balance updates using FHE arithmetic

**Core FHE Operations**:
```solidity
// Deposit: Plain ERC20 → Encrypted Balance
function deposit(address token, uint256 amount) external {
    // Transfer tokens to vault
    IERC20(token).transferFrom(msg.sender, address(this), amount);
    
    // Update encrypted balance
    euint256 currentBalance = balances[token][msg.sender];
    euint256 depositAmount = FHE.asEuint256(amount);
    euint256 newBalance = FHE.add(currentBalance, depositAmount);
    
    // Store with proper access control
    balances[token][msg.sender] = newBalance;
    FHE.allowThis(newBalance);
    FHE.allowSender(newBalance);
    
    emit Deposited(msg.sender, token, amount);
}

// Conditional Transfer using FHE.select
function executeTransfer(address user, euint256 amount) internal returns (euint256) {
    euint256 currentBalance = balances[tokenIn][user];
    ebool canTransfer = FHE.gte(currentBalance, amount);
    
    euint256 actualTransfer = FHE.select(
        canTransfer,
        amount,           // Transfer requested amount
        ENCRYPTED_ZERO    // Transfer zero if insufficient
    );
    
    return actualTransfer;
}
```

### 4. Multi-Transaction Decryption System
**Purpose**: Handle AVS decryption workflow securely

**Decryption Flow Implementation**:
```solidity
// Step 1: Request decryption (Transaction 1)
function requestIntentDecryption(bytes32 batchId) external onlyDecryptor {
    BatchState storage batch = batches[batchId];
    
    for (uint i = 0; i < batch.intentIds.length; i++) {
        Intent storage intent = intents[batch.intentIds[i]];
        
        // Trigger decryption process
        FHE.decrypt(euint256.wrap(intent.ctAmountHandle));
        FHE.decrypt(euint256.wrap(intent.ctMinOutHandle));
    }
    
    batch.decryptionRequested = true;
}

// Step 2: Retrieve decrypted values (Transaction 2+)
function getDecryptedIntents(bytes32 batchId) external view onlyDecryptor 
    returns (uint256[] memory amounts, uint256[] memory minOuts) {
    
    BatchState storage batch = batches[batchId];
    require(batch.decryptionRequested, "Decryption not requested");
    
    amounts = new uint256[](batch.intentIds.length);
    minOuts = new uint256[](batch.intentIds.length);
    
    for (uint i = 0; i < batch.intentIds.length; i++) {
        Intent storage intent = intents[batch.intentIds[i]];
        
        // Safe decryption retrieval
        (amounts[i], bool amountReady) = FHE.getDecryptResultSafe(
            euint256.wrap(intent.ctAmountHandle)
        );
        (minOuts[i], bool minOutReady) = FHE.getDecryptResultSafe(
            euint256.wrap(intent.ctMinOutHandle)
        );
        
        require(amountReady && minOutReady, "Decryption not complete");
    }
}
```

### 5. Uniswap v4 Hook Integration
**Purpose**: Gate AMM access and execute privacy-preserving swaps

**Hook Implementation**:
```solidity
function beforeSwap(
    address,
    PoolKey calldata key,
    IPoolManager.SwapParams calldata params,
    bytes calldata hookData
) external override returns (bytes4) {
    // Decode batch execution data
    (bytes32 batchId, Bounds memory bounds) = abi.decode(hookData, (bytes32, Bounds));
    
    // Verify AVS quorum and bounds
    require(taskManager.hasQuorum(batchId), "No quorum");
    require(block.timestamp <= batches[batchId].ttl, "Expired");
    require(validateBounds(bounds, params), "Invalid bounds");
    
    return BaseHook.beforeSwap.selector;
}

function afterSwap(
    address,
    PoolKey calldata,
    IPoolManager.SwapParams calldata,
    BalanceDelta delta,
    bytes calldata hookData
) external override returns (bytes4) {
    // Update encrypted balances after swap execution
    (bytes32 batchId,) = abi.decode(hookData, (bytes32, Bounds));
    _settleEncryptedBalances(batchId, delta);
    
    return BaseHook.afterSwap.selector;
}
```

## 🔧 Development Phases

### Phase 1: Core FHE Infrastructure
**Timeline**: 2-3 weeks

**Deliverables**:
- [ ] FHE type definitions and constants
- [ ] Basic encrypted balance management
- [ ] Access control patterns implementation
- [ ] Unit tests for FHE operations

**Key Files**:
- `contracts/core/FHETypes.sol` - Type definitions and constants
- `contracts/core/EncryptedBalanceManager.sol` - Balance operations
- `test/core/FHEOperations.t.sol` - Comprehensive FHE tests

### Phase 2: Intent System
**Timeline**: 2 weeks

**Deliverables**:
- [ ] Intent data structures
- [ ] Encrypted intent submission
- [ ] Batch management system
- [ ] Decryption workflow implementation

**Key Files**:
- `contracts/intents/IntentManager.sol` - Core intent logic
- `contracts/intents/BatchProcessor.sol` - Batch handling
- `test/intents/IntentFlow.t.sol` - Intent lifecycle tests

### Phase 3: Hook Integration
**Timeline**: 3 weeks

**Deliverables**:
- [ ] Uniswap v4 Hook implementation
- [ ] AMM execution gating
- [ ] Private swap execution
- [ ] Integration tests

**Key Files**:
- `contracts/hooks/HookVault.sol` - Main hook contract
- `contracts/hooks/SwapExecutor.sol` - Execution logic
- `test/hooks/PrivateSwap.t.sol` - End-to-end tests

### Phase 4: AVS Integration
**Timeline**: 2-3 weeks

**Deliverables**:
- [ ] TaskManager contract
- [ ] Operator signature verification
- [ ] Slashing mechanisms
- [ ] Off-chain operator node

**Key Files**:
- `contracts/avs/TaskManager.sol` - Task coordination
- `contracts/avs/ServiceManager.sol` - Operator management
- `scripts/operator/OperatorNode.js` - Off-chain decryption

### Phase 5: Testing & Security
**Timeline**: 2 weeks

**Deliverables**:
- [ ] Comprehensive test suite
- [ ] Gas optimization
- [ ] Security audit preparation
- [ ] Documentation

## 🛠 Technical Implementation Details

### FHE Development Patterns to Follow

**1. Always Use Proper Access Control**:
```solidity
// ✅ CORRECT: Grant access when storing
function storeEncryptedValue(euint256 value) internal {
    storage[key] = value;
    FHE.allowThis(value);    // Contract needs access
    FHE.allowSender(value);  // User needs access
}

// ✅ CORRECT: Grant access when returning computed values
function computeResult() external returns (euint256) {
    euint256 result = FHE.add(valueA, valueB);
    FHE.allowSender(result); // New value needs access
    return result;
}
```

**2. Use FHE.select for All Conditionals**:
```solidity
// ✅ CORRECT: Conditional logic with FHE
function conditionalTransfer(euint256 balance, euint256 amount) internal returns (euint256) {
    ebool canTransfer = FHE.gte(balance, amount);
    
    return FHE.select(
        canTransfer,
        FHE.sub(balance, amount), // If sufficient balance
        balance                   // If insufficient balance
    );
}
```

**3. Initialize FHE Constants in Constructor**:
```solidity
constructor() {
    ENCRYPTED_ZERO = FHE.asEuint256(0);
    ENCRYPTED_ONE = FHE.asEuint256(1);
    
    // Grant contract access to constants
    FHE.allowThis(ENCRYPTED_ZERO);
    FHE.allowThis(ENCRYPTED_ONE);
}
```

### Gas Optimization Strategies

1. **Batch FHE Operations**: Group multiple encrypted operations together
2. **Efficient Access Control**: Use `FHE.allowSender()` instead of `FHE.allow(value, msg.sender)`
3. **Appropriate Bit Lengths**: Use smallest FHE type that fits data range
4. **Minimize Decryptions**: Only decrypt when absolutely necessary

### Security Considerations

**Privacy Protection**:
- All user amounts remain encrypted until AVS decryption
- Batch execution prevents individual user tracking
- Private inclusion prevents MEV on execution

**Access Control Security**:
- Strict permission management for encrypted values
- Time-bounded decryption permits
- Multi-signature requirements for critical operations

**Smart Contract Security**:
- Reentrancy guards on all state-changing functions
- Proper input validation before FHE operations
- Emergency pause mechanisms

## 📚 Testing Strategy

### Unit Testing Approach
```solidity
// Example test structure
contract HookVaultTest is Test {
    using FHE for *;
    
    function testDepositAndEncryptedBalance() public {
        // Test encrypted balance updates
        vm.prank(user);
        hookVault.deposit(usdc, 1000);
        
        euint256 balance = hookVault.getEncryptedBalance(usdc, user);
        // Note: Cannot assert on encrypted values directly
        // Must use decryption flow for verification
    }
    
    function testConditionalTransfer() public {
        // Test FHE.select logic for transfers
        euint256 balance = FHE.asEuint256(500);
        euint256 amount = FHE.asEuint256(300);
        
        euint256 result = hookVault.attemptTransfer(balance, amount);
        
        // Verify through decryption workflow
        FHE.decrypt(result);
        vm.warp(block.timestamp + 11); // Allow decryption time
        
        (uint256 decrypted, bool ready) = FHE.getDecryptResultSafe(result);
        assertTrue(ready);
        assertEq(decrypted, 200); // 500 - 300
    }
}
```

### Integration Testing
- End-to-end private swap flows
- Multi-user batch execution scenarios
- Cross-contract permission inheritance
- Hook execution with real Uniswap v4 pools

### Performance Testing
- Gas consumption analysis for FHE operations
- Batch size optimization testing
- Decryption timing analysis
- Concurrent user interaction testing

## 🚀 Deployment Plan

### Local Development Environment
```bash
# Setup with mocked CoFHE for rapid testing
forge test --fork-url $ANVIL_RPC

# Local Uniswap v4 deployment
forge script script/DeployLocal.s.sol
```

### Testnet Deployment
- Deploy to Fhenix testnet
- Enable real FHE operations
- Test with limited operator set
- Integrate with testnet Uniswap v4

### Mainnet Preparation
- Full security audit
- Progressive decentralization of operators
- Slashing mechanisms activation
- Private inclusion infrastructure

---

## 🎯 Success Metrics

**Privacy Goals**:
- ✅ Pre-execution amount privacy (encrypted intents)
- ✅ Swap obfuscation via batching
- ✅ User linkage prevention

**Performance Goals**:
- ✅ Batch execution < 1 block on L2
- ✅ Single swap < 3 blocks end-to-end
- ✅ Gas efficient FHE operations

**Security Goals**:
- ✅ No encrypted value access leaks
- ✅ Proper multi-transaction decryption flow
- ✅ Slashable operator validation

---

This plan serves as the comprehensive blueprint for building the AlphaEngine FHE smart contract system. Each component follows established FHE patterns while implementing the privacy-preserving swap architecture described in the TDD.