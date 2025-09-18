# AlphaEngine Smart Contracts

## Overview
This repository contains the smart contracts for AlphaEngine, a privacy-preserving subscription and trade execution platform using Fully Homomorphic Encryption (FHE).

## Contracts

### AlphaEngineSubscription.sol
Main contract managing encrypted subscriptions between AlphaConsumers and AlphaGenerators.

**Key Features:**
- Generator registration with configurable fees
- FHE-encrypted subscriber addresses for privacy
- Trade proposal and execution system
- Admin functions for emergency scenarios
- Built-in pause/unpause functionality

### FHEAddressEncryption.sol
Helper library providing FHE operations for address encryption and comparison.

**Functions:**
- `encryptAddress`: Encrypt addresses with generator context
- `compareEncrypted`: Compare encrypted addresses
- `encryptBool/encryptUint256`: Type encryption utilities
- Boolean operations: AND, OR, NOT on encrypted values

## Setup

### Prerequisites
- [Foundry](https://getfoundry.sh/) installed
- Node.js for package management

### Installation
```bash
# Install dependencies
forge install

# Build contracts
forge build

# Run tests
forge test
```

## Testing
```bash
# Run all tests
forge test

# Run specific test
forge test --match-test test_Subscribe

# Run with gas reporting
forge test --gas-report

# Run with verbosity
forge test -vvvv
```

## Deployment

### Local Deployment (Anvil)
```bash
# Start local node
anvil

# Deploy contracts
forge script script/Deploy.s.sol --rpc-url http://localhost:8545 --broadcast
```

### Testnet Deployment
```bash
# Set environment variables
export PRIVATE_KEY=your_private_key
export FHENIX_RPC_URL=your_rpc_url

# Deploy to testnet
forge script script/Deploy.s.sol --rpc-url $FHENIX_RPC_URL --broadcast --verify
```

## Contract Addresses
Deployment addresses are saved in `deployments/{chainId}.json` after deployment.

## Security Features
- ReentrancyGuard protection on critical functions
- Pausable functionality for emergency scenarios
- Owner-only admin functions
- Input validation and bounds checking
- FHE encryption for subscriber privacy

## Gas Optimization
- Efficient storage patterns
- Minimal external calls
- Optimized loops with early exits
- Packed struct storage

## Test Results
All tests passing:
- 17 contract tests
- 2 invariant tests
- 100% test coverage for core functionality

## License
MIT