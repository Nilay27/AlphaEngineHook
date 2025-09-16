# Off-Chain Order Matching Implementation Plan

## Overview
Implement privacy-preserving order matching where matched trades are settled peer-to-peer with encrypted tokens, and only net amounts hit Uniswap pools. All settlement happens through the Hook which maintains custody of funds.

## Architecture

### Core Principle
- **Hook maintains full custody** - No infinite allowances to AVS
- **AVS orchestrates, Hook executes** - AVS determines matches, Hook performs transfers
- **Fully encrypted P2P settlement** - Matched orders settled without decryption
- **Net-only pool interaction** - Only unmatched amounts go to Uniswap

### Flow Diagram
```
Users → Submit Intents → Hook (holds encrypted tokens)
                            ↓
                    AVS Decrypts & Matches
                            ↓
                    AVS Calls Hook.settleBatch()
                            ↓
        Hook Executes Encrypted P2P Transfers
                            ↓
            Net Amount → Uniswap Pool
```

## Implementation Phases

### Phase 1: Intent Collection & Custody
**Status:** 🟡 In Progress

#### Current State
- ✅ Users submit encrypted intents via `submitIntent()`
- ✅ Hook receives encrypted tokens via `transferFromEncrypted()`
- ✅ Intents stored with owner, amounts, and deadlines

#### Required Changes
- [ ] Add batch tracking for atomic settlement
- [ ] Implement intent cancellation mechanism
- [ ] Add minimum batch size configuration

### Phase 2: AVS Integration for Matching
**Status:** 🔴 Not Started

#### Contract Changes

##### ISwapManager Interface Updates
```solidity
interface ISwapManager {
    struct MatchedOrder {
        address userA;
        address userB;
        address tokenA;
        address tokenB;
        euint128 amountA;
        euint128 amountB;
    }
    
    struct BatchSettlement {
        bytes32 batchId;
        MatchedOrder[] matches;
        address[] netSwapUsers;
        euint128[] netAmounts;
        bool[] isTokenIn; // true for tokenIn, false for tokenOut
    }
    
    // Called by operators after matching
    function submitBatchSettlement(
        BatchSettlement calldata settlement,
        bytes[] calldata operatorSignatures
    ) external;
}
```

##### UniversalPrivacyHook New Functions
```solidity
contract UniversalPrivacyHook {
    // Only callable by SwapManager after verification
    function settleBatch(
        bytes32 batchId,
        MatchedOrder[] calldata matches,
        NetSwap[] calldata netSwaps
    ) external onlySwapManager {
        // Execute encrypted P2P transfers
        // Process net swaps through pool
    }
    
    // Emergency functions
    function cancelIntent(bytes32 intentId) external;
    function emergencyWithdraw() external onlyOwner;
}
```

### Phase 3: Off-Chain Matching Logic
**Status:** 🔴 Not Started

#### Operator Responsibilities
1. **Decrypt intent amounts** (with FHE permissions)
2. **Build order book** from current batch
3. **Find optimal matches** maximizing P2P settlement
4. **Calculate net amounts** for pool swaps
5. **Submit attestation** with matched orders

#### Matching Algorithm (Pseudocode)
```javascript
function matchOrders(intents) {
    // Group by trading pairs
    const orderBook = groupByPair(intents);
    
    // For each pair, match orders
    for (const pair of orderBook) {
        const buyers = pair.filter(intent => intent.tokenOut === pair.tokenB);
        const sellers = pair.filter(intent => intent.tokenIn === pair.tokenB);
        
        // Sort by best price (in production, consider price limits)
        buyers.sort((a, b) => b.price - a.price);
        sellers.sort((a, b) => a.price - b.price);
        
        // Match orders
        const matches = [];
        while (buyers.length && sellers.length) {
            const buyer = buyers[0];
            const seller = sellers[0];
            
            const matchAmount = Math.min(buyer.amount, seller.amount);
            matches.push({
                userA: buyer.user,
                userB: seller.user,
                amount: matchAmount
            });
            
            // Update remaining amounts
            buyer.amount -= matchAmount;
            seller.amount -= matchAmount;
            
            if (buyer.amount === 0) buyers.shift();
            if (seller.amount === 0) sellers.shift();
        }
    }
    
    return { matches, netAmounts: calculateNet(remaining) };
}
```

### Phase 4: Settlement Execution
**Status:** 🔴 Not Started

#### Hook Settlement Logic
1. **Verify AVS attestation** (minimum signatures)
2. **Execute P2P transfers** (encrypted, no decryption)
3. **Process net swaps** through Uniswap pool
4. **Update intent states** to processed
5. **Emit settlement events**

#### Security Considerations
- Atomic batch processing (all or nothing)
- Slashing for incorrect matching
- Time-locked settlement windows
- Emergency pause mechanism

### Phase 5: Testing & Validation
**Status:** 🔴 Not Started

#### Test Scenarios
- [ ] Single pair matching (USDC ↔ USDT)
- [ ] Multi-pair matching 
- [ ] Partial fills
- [ ] Net amount calculation
- [ ] Failed attestations
- [ ] Emergency withdrawals

## Technical Details

### Storage Structures
```solidity
// Batch tracking
mapping(bytes32 => Batch) public batches;
struct Batch {
    bytes32[] intentIds;
    uint256 createdAt;
    uint256 settledAt;
    BatchStatus status;
}

enum BatchStatus {
    Collecting,
    Processing,
    Settled,
    Cancelled
}

// Settlement tracking
mapping(bytes32 => bool) public processedBatches;
mapping(address => uint256) public userNonces;
```

### Gas Optimizations
- Batch operations to reduce calls
- Use packed structs where possible
- Minimize storage writes
- Consider merkle proofs for large batches

## Example Scenario

### Initial State
- 10 users want to swap 10K USDC → USDT each (100K total)
- 9 users want to swap 10K USDT → USDC each (90K total)

### After Matching
- **P2P Settlement:** 9 pairs matched (90K each direction)
- **Net to Pool:** 1 user with 10K USDC → USDT

### Execution
1. Hook transfers 90K encrypted USDT from 9 users to 9 USDC providers
2. Hook transfers 90K encrypted USDC from 9 users to 9 USDT providers  
3. Hook swaps 10K USDC → USDT on Uniswap for remaining user
4. All settlements remain encrypted except the 10K pool swap

## Benefits
- **Maximum Privacy:** 90% of volume never decrypted
- **Gas Efficient:** Single batch transaction
- **MEV Resistant:** Encrypted P2P settlement
- **Capital Efficient:** Direct peer matching

## Next Steps
1. [ ] Implement ISwapManager interface updates
2. [ ] Add settlement functions to UniversalPrivacyHook
3. [ ] Create MockSwapManager with matching logic
4. [ ] Update SwapManager AVS for operator consensus
5. [ ] Write comprehensive test suite
6. [ ] Deploy and test on local network

## Questions to Resolve
- [ ] Batch timeout period?
- [ ] Minimum batch size for processing?
- [ ] Operator selection criteria?
- [ ] Slashing conditions and amounts?
- [ ] Price discovery mechanism for matches?