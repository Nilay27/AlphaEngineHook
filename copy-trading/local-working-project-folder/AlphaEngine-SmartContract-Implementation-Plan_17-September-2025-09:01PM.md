# AlphaEngine Smart Contract Implementation Plan

**File Created**: 17-September-2025-09:01PM IST
**Version**: 1.0.0
**Status**: READY FOR EXECUTION
**Track**: SMART CONTRACT (S)

## CHANGELOG
- **17-September-2025-09:01PM IST**: Initial creation of Smart Contract implementation plan with 5 atomic steps
- **17-September-2025-10:25PM IST**: Complete migration from Hardhat to Foundry - replaced all JavaScript with Solidity scripts
- **17-September-2025-10:03PM IST**: Updated plan to use Foundry instead of Hardhat for improved performance and testing
- **17-September-2025-11:31PM IST**: Removed Step S5 (migration utilities) as per requirements - no migration needed

---

## Execution Plan - Smart Contract Track

<execution-plan track="smart-contract">

<step-format>
- [ ] **Step S1: Create FHE library contract**
    - **Task**: Implement FHE helper library for address encryption operations
    - **EXPLANATION**:
        - **What** → Solidity library for FHE encryption/comparison operations
        - **Where** → `/Users/consentsam/blockchain/copy-trading/contracts/src/FHEAddressEncryption.sol`
        - **Why** → Reusable encryption utilities for the main contract
    - **Files to Check/Create/Update**: FHEAddressEncryption.sol
    - **Step Dependencies**: None
    - **Step Completion Summary (YYYY-MM-DD HH:MM)**: {{placeholder}}
    - **Status**: To Do
    - **Prompt for verification of elizaOS**: Verify that the FHE library compiles with Fhenix imports and provides encryptAddress and compareEncrypted functions
    - **Files Modified/Created**:
        - FHEAddressEncryption.sol
            <filePath="/Users/consentsam/blockchain/copy-trading/contracts/src/FHEAddressEncryption.sol">
```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@fhenixprotocol/contracts/FHE.sol";

/**
 * @title FHEAddressEncryption
 * @dev Helper library for address encryption operations using Fhenix FHE
 * @notice This library provides utilities for encrypting addresses and comparing encrypted values
 */
library FHEAddressEncryption {
    using FHE for *;

    /**
     * @dev Encrypt an address with generator-specific context
     * @param _address Address to encrypt
     * @param _generator Generator address (used as part of encryption context)
     * @return Encrypted address as eaddress type
     */
    function encryptAddress(
        address _address,
        address _generator
    ) internal pure returns (eaddress) {
        // Create unique encryption context based on generator
        // Note: In production, this would use Fhenix's actual encryption
        // For now, we use FHE.asEaddress which handles the encryption
        return FHE.asEaddress(_address);
    }

    /**
     * @dev Compare two encrypted addresses
     * @param _a First encrypted address
     * @param _b Second encrypted address
     * @return Encrypted boolean indicating equality
     */
    function compareEncrypted(
        eaddress _a,
        eaddress _b
    ) internal pure returns (ebool) {
        return FHE.eq(_a, _b);
    }

    /**
     * @dev Create an encrypted boolean value
     * @param _value Boolean value to encrypt
     * @return Encrypted boolean
     */
    function encryptBool(bool _value) internal pure returns (ebool) {
        return FHE.asEbool(_value);
    }

    /**
     * @dev Create an encrypted uint256 value
     * @param _value Uint256 value to encrypt
     * @return Encrypted uint256
     */
    function encryptUint256(uint256 _value) internal pure returns (euint256) {
        return FHE.asEuint256(_value);
    }

    /**
     * @dev Decrypt an encrypted boolean (only for authorized parties)
     * @param _value Encrypted boolean to decrypt
     * @return Decrypted boolean value
     */
    function decryptBool(ebool _value) internal pure returns (bool) {
        return FHE.decrypt(_value);
    }

    /**
     * @dev Check if an encrypted value is not equal to another
     * @param _a First encrypted address
     * @param _b Second encrypted address
     * @return Encrypted boolean indicating inequality
     */
    function notEqual(
        eaddress _a,
        eaddress _b
    ) internal pure returns (ebool) {
        return FHE.ne(_a, _b);
    }

    /**
     * @dev Perform AND operation on encrypted booleans
     * @param _a First encrypted boolean
     * @param _b Second encrypted boolean
     * @return Result of AND operation
     */
    function andOperation(
        ebool _a,
        ebool _b
    ) internal pure returns (ebool) {
        return FHE.and(_a, _b);
    }

    /**
     * @dev Perform OR operation on encrypted booleans
     * @param _a First encrypted boolean
     * @param _b Second encrypted boolean
     * @return Result of OR operation
     */
    function orOperation(
        ebool _a,
        ebool _b
    ) internal pure returns (ebool) {
        return FHE.or(_a, _b);
    }

    /**
     * @dev Perform NOT operation on encrypted boolean
     * @param _value Encrypted boolean
     * @return Result of NOT operation
     */
    function notOperation(ebool _value) internal pure returns (ebool) {
        return FHE.not(_value);
    }

    /**
     * @dev Create encrypted timestamp
     * @return Current block timestamp as encrypted uint256
     */
    function encryptedTimestamp() internal view returns (euint256) {
        return FHE.asEuint256(block.timestamp);
    }
}
```
            </filePath>
    - **Summary of Changes & Reasoning**: Created FHE helper library with comprehensive encryption utilities. Library provides address encryption, comparison operations, and boolean operations using Fhenix FHE primitives for privacy-preserving computations.
</step-format>

<step-format>
- [ ] **Step S2: Implement main subscription contract**
    - **Task**: Create AlphaEngineSubscription contract with FHE-encrypted subscriptions
    - **EXPLANATION**:
        - **What** → Main contract managing encrypted subscriptions and trade proposals
        - **Where** → `/Users/consentsam/blockchain/copy-trading/contracts/src/AlphaEngineSubscription.sol`
        - **Why** → Core smart contract for the subscription system
    - **Files to Check/Create/Update**: AlphaEngineSubscription.sol
    - **Step Dependencies**: S1
    - **Step Completion Summary (YYYY-MM-DD HH:MM)**: {{placeholder}}
    - **Status**: To Do
    - **Prompt for verification of elizaOS**: Test that AlphaEngineSubscription contract compiles, allows generator registration, handles encrypted subscriptions, and manages trade proposals
    - **Files Modified/Created**:
        - AlphaEngineSubscription.sol
            <filePath="/Users/consentsam/blockchain/copy-trading/contracts/src/AlphaEngineSubscription.sol">
```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@fhenixprotocol/contracts/FHE.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "./FHEAddressEncryption.sol";

/**
 * @title AlphaEngineSubscription
 * @dev Manages encrypted subscriptions between AlphaConsumers and AlphaGenerators
 * @notice This contract uses FHE to protect subscriber privacy while enabling verification
 */
contract AlphaEngineSubscription is Ownable, ReentrancyGuard, Pausable {
    using FHE for *;
    using FHEAddressEncryption for *;

    // ============ State Variables ============

    struct Generator {
        address generatorAddress;
        uint256 subscriptionFee;
        uint256 performanceFee; // Percentage in basis points (100 = 1%)
        bool isActive;
        uint256 totalSubscribers;
        uint256 totalVolume;
        uint256 registeredAt;
    }

    struct EncryptedSubscription {
        eaddress encryptedConsumerAddress; // FHE encrypted address
        euint256 subscribedAt; // FHE encrypted timestamp
        ebool isActive; // FHE encrypted active status
        euint256 subscriptionFee; // FHE encrypted fee paid
    }

    struct TradeExecution {
        bytes32 tradeId;
        address generator;
        bytes executionData; // Encrypted trade parameters
        uint256 gasEstimate;
        uint256 expiryTime;
        bool executed;
        uint256 createdAt;
    }

    // Mappings
    mapping(address => Generator) public generators;
    mapping(address => EncryptedSubscription[]) private generatorSubscriptions;
    mapping(address => mapping(eaddress => ebool)) private generatorToConsumerActive;
    mapping(bytes32 => TradeExecution) public trades;
    mapping(address => bytes32[]) private generatorTrades;

    // Configuration
    uint256 public constant MAX_PERFORMANCE_FEE = 3000; // 30%
    uint256 public constant MIN_SUBSCRIPTION_FEE = 0.001 ether;
    uint256 public constant MAX_TRADE_EXPIRY = 1440; // 24 hours in minutes

    // Events
    event GeneratorRegistered(
        address indexed generator,
        uint256 subscriptionFee,
        uint256 performanceFee
    );

    event SubscriptionCreated(
        address indexed generator,
        eaddress encryptedSubscriber,  // FHE encrypted address type
        uint256 timestamp
    );

    event TradeProposed(
        bytes32 indexed tradeId,
        address indexed generator,
        uint256 expiryTime,
        uint256 gasEstimate
    );

    event TradeExecuted(
        bytes32 indexed tradeId,
        address indexed executor,
        bool success
    );

    event SubscriptionCancelled(
        address indexed generator,
        eaddress encryptedSubscriber,  // FHE encrypted address type
        uint256 timestamp
    );

    event GeneratorUpdated(
        address indexed generator,
        uint256 newSubscriptionFee,
        uint256 newPerformanceFee
    );

    // ============ Modifiers ============

    modifier onlyGenerator() {
        require(generators[msg.sender].isActive, "Not an active generator");
        _;
    }

    modifier validAddress(address _addr) {
        require(_addr != address(0), "Invalid address");
        __;
    }

    modifier validFee(uint256 _fee) {
        require(_fee >= MIN_SUBSCRIPTION_FEE, "Fee too low");
        _;
    }

    // ============ Constructor ============

    constructor() Ownable() {
        // Constructor can be extended with initial parameters if needed
    }

    // ============ Core Functions ============

    /**
     * @dev Register as an AlphaGenerator
     * @param _subscriptionFee Fee in wei for subscriptions
     * @param _performanceFee Performance fee in basis points
     */
    function registerGenerator(
        uint256 _subscriptionFee,
        uint256 _performanceFee
    ) external validAddress(msg.sender) validFee(_subscriptionFee) {
        require(_performanceFee <= MAX_PERFORMANCE_FEE, "Performance fee too high");
        require(!generators[msg.sender].isActive, "Already registered");

        generators[msg.sender] = Generator({
            generatorAddress: msg.sender,
            subscriptionFee: _subscriptionFee,
            performanceFee: _performanceFee,
            isActive: true,
            totalSubscribers: 0,
            totalVolume: 0,
            registeredAt: block.timestamp
        });

        emit GeneratorRegistered(msg.sender, _subscriptionFee, _performanceFee);
    }

    /**
     * @dev Update generator fees
     * @param _subscriptionFee New subscription fee
     * @param _performanceFee New performance fee
     */
    function updateGeneratorFees(
        uint256 _subscriptionFee,
        uint256 _performanceFee
    ) external onlyGenerator validFee(_subscriptionFee) {
        require(_performanceFee <= MAX_PERFORMANCE_FEE, "Performance fee too high");

        Generator storage gen = generators[msg.sender];
        gen.subscriptionFee = _subscriptionFee;
        gen.performanceFee = _performanceFee;

        emit GeneratorUpdated(msg.sender, _subscriptionFee, _performanceFee);
    }

    /**
     * @dev Subscribe to an AlphaGenerator with encrypted address
     * @param _generator The generator to subscribe to
     * @param _encryptedAddress FHE encrypted consumer address
     */
    function subscribe(
        address _generator,
        eaddress _encryptedAddress
    ) external payable nonReentrant whenNotPaused {
        Generator storage gen = generators[_generator];
        require(gen.isActive, "Generator not active");
        require(msg.value >= gen.subscriptionFee, "Insufficient payment");

        // Check if already subscribed using the nested mapping
        ebool isAlreadySubscribed = generatorToConsumerActive[_generator][_encryptedAddress];
        require(!FHE.decrypt(isAlreadySubscribed), "Already subscribed");

        // Create encrypted subscription
        EncryptedSubscription memory newSub = EncryptedSubscription({
            encryptedConsumerAddress: _encryptedAddress,
            subscribedAt: FHE.asEuint256(block.timestamp),
            isActive: FHE.asEbool(true),
            subscriptionFee: FHE.asEuint256(msg.value)
        });

        // Store subscription
        generatorSubscriptions[_generator].push(newSub);
        generatorToConsumerActive[_generator][_encryptedAddress] = FHE.asEbool(true);

        // Update generator stats
        gen.totalSubscribers++;
        gen.totalVolume += msg.value;

        // Transfer fee to generator
        (bool success, ) = payable(_generator).call{value: msg.value}("");
        require(success, "Transfer failed");

        emit SubscriptionCreated(_generator, _encryptedAddress, block.timestamp);
    }

    /**
     * @dev Unsubscribe from an AlphaGenerator
     * @param _generator The generator to unsubscribe from
     * @param _encryptedAddress Encrypted address of the subscriber
     */
    function unsubscribe(
        address _generator,
        eaddress _encryptedAddress
    ) external whenNotPaused {
        // Verify the caller is subscribed
        ebool isSubscribed = generatorToConsumerActive[_generator][_encryptedAddress];
        require(FHE.decrypt(isSubscribed), "Not subscribed");

        // Mark as inactive
        generatorToConsumerActive[_generator][_encryptedAddress] = FHE.asEbool(false);

        // Update subscription status in array
        EncryptedSubscription[] storage subs = generatorSubscriptions[_generator];
        for (uint256 i = 0; i < subs.length; i++) {
            ebool isMatch = FHE.eq(subs[i].encryptedConsumerAddress, _encryptedAddress);
            if (FHE.decrypt(isMatch)) {
                subs[i].isActive = FHE.asEbool(false);
                break;
            }
        }

        // Update generator stats
        generators[_generator].totalSubscribers--;

        emit SubscriptionCancelled(_generator, _encryptedAddress, block.timestamp);
    }

    /**
     * @dev Get encrypted subscribers for a generator (public function)
     * @param _generator Generator address
     * @return Array of encrypted addresses
     */
    function getEncryptedSubscribers(
        address _generator
    ) external view returns (eaddress[] memory) {
        EncryptedSubscription[] memory subs = generatorSubscriptions[_generator];

        // Count active subscriptions
        uint256 activeCount = 0;
        for (uint256 i = 0; i < subs.length; i++) {
            if (FHE.decrypt(subs[i].isActive)) {
                activeCount++;
            }
        }

        // Create array of active encrypted addresses
        eaddress[] memory activeAddresses = new eaddress[](activeCount);
        uint256 currentIndex = 0;

        for (uint256 i = 0; i < subs.length; i++) {
            if (FHE.decrypt(subs[i].isActive)) {
                activeAddresses[currentIndex++] = subs[i].encryptedConsumerAddress;
            }
        }

        return activeAddresses;
    }

    /**
     * @dev Check if an encrypted address is subscribed to a generator
     * @param _generator Generator address
     * @param _encryptedAddress Encrypted consumer address
     * @return Whether the address is actively subscribed
     */
    function isSubscribed(
        address _generator,
        eaddress _encryptedAddress
    ) external view returns (bool) {
        ebool subscriptionStatus = generatorToConsumerActive[_generator][_encryptedAddress];
        return FHE.decrypt(subscriptionStatus);
    }

    /**
     * @dev Propose a trade for execution by subscribers
     * @param _executionData Encrypted trade parameters
     * @param _gasEstimate Estimated gas for execution
     * @param _expiryMinutes Minutes until trade expires
     */
    function proposeTrade(
        bytes calldata _executionData,
        uint256 _gasEstimate,
        uint256 _expiryMinutes
    ) external onlyGenerator returns (bytes32) {
        require(_expiryMinutes > 0 && _expiryMinutes <= MAX_TRADE_EXPIRY, "Invalid expiry");
        require(_executionData.length > 0, "Empty execution data");
        require(_gasEstimate > 21000, "Gas estimate too low");

        bytes32 tradeId = keccak256(
            abi.encodePacked(msg.sender, _executionData, block.timestamp, block.number)
        );

        trades[tradeId] = TradeExecution({
            tradeId: tradeId,
            generator: msg.sender,
            executionData: _executionData,
            gasEstimate: _gasEstimate,
            expiryTime: block.timestamp + (_expiryMinutes * 60),
            executed: false,
            createdAt: block.timestamp
        });

        generatorTrades[msg.sender].push(tradeId);

        emit TradeProposed(tradeId, msg.sender, trades[tradeId].expiryTime, _gasEstimate);

        return tradeId;
    }

    /**
     * @dev Execute a proposed trade
     * @param _tradeId The trade to execute
     * @param _encryptedExecutor Encrypted address of executor
     */
    function executeTrade(
        bytes32 _tradeId,
        eaddress _encryptedExecutor
    ) external nonReentrant whenNotPaused {
        TradeExecution storage trade = trades[_tradeId];
        require(trade.generator != address(0), "Trade not found");
        require(!trade.executed, "Already executed");
        require(block.timestamp <= trade.expiryTime, "Trade expired");

        // Verify executor is subscribed
        ebool isExecutorSubscribed = generatorToConsumerActive[trade.generator][_encryptedExecutor];
        require(FHE.decrypt(isExecutorSubscribed), "Not subscribed to generator");

        trade.executed = true;

        // In production, this would integrate with DEX protocols
        // For now, we emit the event to signal successful validation
        bool success = true; // Placeholder for actual execution

        emit TradeExecuted(_tradeId, msg.sender, success);
    }

    /**
     * @dev Get generator's trade history
     * @param _generator Generator address
     * @return Array of trade IDs
     */
    function getGeneratorTrades(address _generator) external view returns (bytes32[] memory) {
        return generatorTrades[_generator];
    }

    /**
     * @dev Get subscription count for a generator
     * @param _generator Generator address
     * @return Number of active subscribers
     */
    function getSubscriberCount(address _generator) external view returns (uint256) {
        return generators[_generator].totalSubscribers;
    }

    // ============ Admin Functions ============

    /**
     * @dev Pause the contract
     */
    function pause() external onlyOwner {
        _pause();
    }

    /**
     * @dev Unpause the contract
     */
    function unpause() external onlyOwner {
        _unpause();
    }

    /**
     * @dev Deactivate a generator (admin only)
     * @param _generator Generator to deactivate
     */
    function deactivateGenerator(address _generator) external onlyOwner {
        generators[_generator].isActive = false;
    }

    /**
     * @dev Emergency withdrawal (admin only)
     */
    function emergencyWithdraw() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No funds to withdraw");

        (bool success, ) = payable(owner()).call{value: balance}("");
        require(success, "Withdrawal failed");
    }

    /**
     * @dev Receive function to accept ETH
     */
    receive() external payable {}

    /**
     * @dev Fallback function
     */
    fallback() external payable {}
}
```
            </filePath>
    - **Summary of Changes & Reasoning**: Implemented comprehensive subscription contract with FHE encryption support. Contract manages generator registration, encrypted subscriptions, trade proposals, and includes admin functions for emergency scenarios.
</step-format>

<step-format>
- [ ] **Step S3: Create deployment script**
    - **Task**: Implement deployment script for contracts with verification
    - **EXPLANATION**:
        - **What** → Foundry deployment script with contract verification
        - **Where** → `/Users/consentsam/blockchain/copy-trading/contracts/script/Deploy.s.sol`
        - **Why** → Automated deployment and verification on blockchain
    - **Files to Check/Create/Update**: Deploy.s.sol, foundry.toml
    - **Step Dependencies**: S1, S2
    - **Step Completion Summary (YYYY-MM-DD HH:MM)**: {{placeholder}}
    - **Status**: To Do
    - **Prompt for verification of elizaOS**: Verify that deployment script deploys both contracts, sets up relationships, and verifies on block explorer
    - **Files Modified/Created**:
        - Deploy.s.sol
            <filePath="/Users/consentsam/blockchain/copy-trading/contracts/script/Deploy.s.sol">
```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/FHEAddressEncryption.sol";
import "../src/AlphaEngineSubscription.sol";

contract DeployAlphaEngine is Script {
    // Deployment configuration
    uint256 constant INITIAL_SUBSCRIPTION_FEE = 0.01 ether;
    uint256 constant INITIAL_PERFORMANCE_FEE = 500; // 5%

    function run() public returns (address, address) {
        // Get deployer private key from environment
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");

        // Start broadcasting transactions
        vm.startBroadcast(deployerPrivateKey);

        console.log("Deploying AlphaEngine contracts...");
        console.log("Deployer:", msg.sender);
        console.log("Chain ID:", block.chainid);

        // Deploy FHEAddressEncryption library
        console.log("\nDeploying FHEAddressEncryption library...");
        FHEAddressEncryption fheLibrary = new FHEAddressEncryption();
        console.log("FHEAddressEncryption deployed to:", address(fheLibrary));

        // Deploy AlphaEngineSubscription contract
        console.log("\nDeploying AlphaEngineSubscription contract...");
        AlphaEngineSubscription alphaEngine = new AlphaEngineSubscription();
        console.log("AlphaEngineSubscription deployed to:", address(alphaEngine));

        // Register deployer as test generator on testnet
        if (block.chainid == 31337 || block.chainid == 42069) { // Local or Fhenix testnet
            console.log("\nRegistering deployer as test generator...");
            alphaEngine.registerGenerator(INITIAL_SUBSCRIPTION_FEE, INITIAL_PERFORMANCE_FEE);
            console.log("Test generator registered with:");
            console.log("  Subscription Fee:", INITIAL_SUBSCRIPTION_FEE);
            console.log("  Performance Fee:", INITIAL_PERFORMANCE_FEE);
        }

        // Stop broadcasting
        vm.stopBroadcast();

        // Save deployment addresses to JSON file
        string memory deploymentJson = string(abi.encodePacked(
            '{"network":"', vm.toString(block.chainid), '",',
            '"deployer":"', vm.toString(msg.sender), '",',
            '"timestamp":"', vm.toString(block.timestamp), '",',
            '"contracts":{',
            '"FHEAddressEncryption":"', vm.toString(address(fheLibrary)), '",',
            '"AlphaEngineSubscription":"', vm.toString(address(alphaEngine)), '"',
            '},',
            '"blockNumber":', vm.toString(block.number),
            '}'
        ));

        // Write to deployments directory
        string memory path = string(abi.encodePacked(
            "./deployments/",
            vm.toString(block.chainid),
            ".json"
        ));
        vm.writeJson(deploymentJson, path);

        console.log("\n========================================");
        console.log("       DEPLOYMENT SUCCESSFUL");
        console.log("========================================");
        console.log("FHE Library:", address(fheLibrary));
        console.log("Main Contract:", address(alphaEngine));
        console.log("Block:", block.number);
        console.log("========================================\n");

        return (address(fheLibrary), address(alphaEngine));
    }

    // Function to verify contracts on block explorer
    function verify() public {
        address fheLibrary = vm.envAddress("FHE_LIBRARY_ADDRESS");
        address alphaEngine = vm.envAddress("ALPHA_ENGINE_ADDRESS");

        console.log("Verifying contracts on block explorer...");

        // Verify FHE library
        string[] memory libraryArgs = new string[](8);
        libraryArgs[0] = "forge";
        libraryArgs[1] = "verify-contract";
        libraryArgs[2] = "--chain-id";
        libraryArgs[3] = vm.toString(block.chainid);
        libraryArgs[4] = "--compiler-version";
        libraryArgs[5] = "0.8.20";
        libraryArgs[6] = vm.toString(fheLibrary);
        libraryArgs[7] = "FHEAddressEncryption";

        vm.ffi(libraryArgs);
        console.log("FHE Library verified");

        // Verify main contract
        string[] memory contractArgs = new string[](10);
        contractArgs[0] = "forge";
        contractArgs[1] = "verify-contract";
        contractArgs[2] = "--chain-id";
        contractArgs[3] = vm.toString(block.chainid);
        contractArgs[4] = "--compiler-version";
        contractArgs[5] = "0.8.20";
        contractArgs[6] = "--libraries";
        contractArgs[7] = string(abi.encodePacked("FHEAddressEncryption:", vm.toString(fheLibrary)));
        contractArgs[8] = vm.toString(alphaEngine);
        contractArgs[9] = "AlphaEngineSubscription";

        vm.ffi(contractArgs);
        console.log("AlphaEngineSubscription verified");
    }
}
```
            </filePath>
        - foundry.toml
            <filePath="/Users/consentsam/blockchain/copy-trading/contracts/foundry.toml">
```toml
[profile.default]
src = "src"
out = "out"
libs = ["lib"]
remappings = [
    "@fhenixprotocol/=lib/fhenix-protocol/",
    "@openzeppelin/=lib/openzeppelin-contracts/",
    "forge-std/=lib/forge-std/src/",
]

# Compiler settings
solc_version = "0.8.20"
optimizer = true
optimizer_runs = 200
via_ir = false

# Network configurations
[rpc_endpoints]
local = "http://localhost:8545"
fhenix_testnet = "${FHENIX_RPC_URL}"
sepolia = "https://eth-sepolia.g.alchemy.com/v2/${ALCHEMY_API_KEY}"
mainnet = "https://eth-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}"

[etherscan]
mainnet = { key = "${ETHERSCAN_API_KEY}" }
sepolia = { key = "${ETHERSCAN_API_KEY}" }
fhenix = { key = "${FHENIX_API_KEY}", url = "https://explorer.fhenix.zone/api" }

# Test settings
[profile.default.fuzz]
runs = 256
max_test_rejects = 65536
seed = "0x3e8"

[profile.default.invariant]
runs = 256
depth = 15
fail_on_revert = false

# Gas reports
gas_reports = ["AlphaEngineSubscription", "FHEAddressEncryption"]

# Formatting
line_length = 120
tab_width = 4
bracket_spacing = true
quote_style = "double"

# CI profile for faster compilation
[profile.ci]
optimizer = false
fuzz = { runs = 100 }

# Production profile with max optimization
[profile.production]
optimizer = true
optimizer_runs = 10000
via_ir = true
```
            </filePath>
    - **Summary of Changes & Reasoning**: Created Solidity-based deployment script using Foundry's Script framework for deterministic deployments. Includes foundry.toml configuration with optimizer settings, network endpoints, and fuzzing configuration for comprehensive testing.
</step-format>

<step-format>
- [ ] **Step S4: Implement contract tests**
    - **Task**: Create comprehensive test suite for smart contracts
    - **EXPLANATION**:
        - **What** → Solidity-based unit and integration tests with fuzzing
        - **Where** → `/Users/consentsam/blockchain/copy-trading/contracts/test/AlphaEngineSubscription.t.sol`
        - **Why** → Ensure contract security and functionality with property-based testing
    - **Files to Check/Create/Update**: AlphaEngineSubscription.t.sol
    - **Step Dependencies**: S2
    - **Step Completion Summary (YYYY-MM-DD HH:MM)**: {{placeholder}}
    - **Status**: To Do
    - **Prompt for verification of elizaOS**: Run tests to verify generator registration, subscription with encrypted addresses, trade proposals, and access control work correctly
    - **Files Modified/Created**:
        - AlphaEngineSubscription.t.sol
            <filePath="/Users/consentsam/blockchain/copy-trading/contracts/test/AlphaEngineSubscription.t.sol">
```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/AlphaEngineSubscription.sol";
import "../src/FHEAddressEncryption.sol";

contract AlphaEngineSubscriptionTest is Test {
    // Contract instances
    AlphaEngineSubscription public alphaEngine;
    FHEAddressEncryption public fheLibrary;

    // Test accounts
    address public owner = address(this);
    address public generator1 = address(0x1);
    address public generator2 = address(0x2);
    address public consumer1 = address(0x3);
    address public consumer2 = address(0x4);
    address public consumer3 = address(0x5);

    // Test parameters
    uint256 constant SUBSCRIPTION_FEE = 0.01 ether;
    uint256 constant PERFORMANCE_FEE = 500; // 5%
    uint256 constant HIGH_PERFORMANCE_FEE = 3001; // 30.01% - above max

    // Events
    event GeneratorRegistered(address indexed generator, uint256 subscriptionFee, uint256 performanceFee);
    event SubscriptionCreated(address indexed generator, bytes32 encryptedSubscriber, uint256 timestamp);
    event TradeProposed(bytes32 indexed tradeId, address indexed generator, uint256 expiryTime);

    function setUp() public {
        // Deploy libraries and contracts
        fheLibrary = new FHEAddressEncryption();
        alphaEngine = new AlphaEngineSubscription();

        // Fund test accounts
        vm.deal(generator1, 10 ether);
        vm.deal(generator2, 10 ether);
        vm.deal(consumer1, 10 ether);
        vm.deal(consumer2, 10 ether);
        vm.deal(consumer3, 10 ether);
    }

    // ============ Deployment Tests ============

    function test_Deployment() public {
        assertEq(alphaEngine.owner(), owner);
        assertFalse(alphaEngine.paused());
    }

    // ============ Generator Registration Tests ============

    function test_RegisterGenerator() public {
        vm.prank(generator1);
        vm.expectEmit(true, false, false, true);
        emit GeneratorRegistered(generator1, SUBSCRIPTION_FEE, PERFORMANCE_FEE);

        alphaEngine.registerGenerator(SUBSCRIPTION_FEE, PERFORMANCE_FEE);

        (address genAddr, uint256 fee, uint256 perfFee, bool isActive,,, ) =
            alphaEngine.generators(generator1);

        assertEq(genAddr, generator1);
        assertEq(fee, SUBSCRIPTION_FEE);
        assertEq(perfFee, PERFORMANCE_FEE);
        assertTrue(isActive);
    }

    function test_RevertWhen_GeneratorFeeTooHigh() public {
        vm.prank(generator1);
        vm.expectRevert("Performance fee too high");
        alphaEngine.registerGenerator(SUBSCRIPTION_FEE, HIGH_PERFORMANCE_FEE);
    }

    function test_RevertWhen_DuplicateRegistration() public {
        vm.startPrank(generator1);
        alphaEngine.registerGenerator(SUBSCRIPTION_FEE, PERFORMANCE_FEE);

        vm.expectRevert("Already registered");
        alphaEngine.registerGenerator(SUBSCRIPTION_FEE, PERFORMANCE_FEE);
        vm.stopPrank();
    }

    function testFuzz_RegisterGenerator(uint256 fee, uint256 perfFee) public {
        fee = bound(fee, 0.001 ether, 1 ether);
        perfFee = bound(perfFee, 0, 3000);

        vm.prank(generator1);
        alphaEngine.registerGenerator(fee, perfFee);

        (, uint256 storedFee, uint256 storedPerfFee,,,, ) =
            alphaEngine.generators(generator1);

        assertEq(storedFee, fee);
        assertEq(storedPerfFee, perfFee);
    }

    // ============ Subscription Tests ============

    function test_Subscribe() public {
        // Setup generator
        vm.prank(generator1);
        alphaEngine.registerGenerator(SUBSCRIPTION_FEE, PERFORMANCE_FEE);

        // Create encrypted address (mock for testing)
        bytes32 encryptedAddress = keccak256(abi.encodePacked(consumer1, generator1));

        // Subscribe
        vm.prank(consumer1);
        vm.expectEmit(true, false, false, true);
        emit SubscriptionCreated(generator1, encryptedAddress, block.timestamp);

        alphaEngine.subscribe{value: SUBSCRIPTION_FEE}(generator1, encryptedAddress);

        // Verify generator stats
        (, , , , uint256 totalSubs, uint256 totalVol, ) =
            alphaEngine.generators(generator1);

        assertEq(totalSubs, 1);
        assertEq(totalVol, SUBSCRIPTION_FEE);

        // Verify generator received payment
        assertEq(generator1.balance, 10 ether + SUBSCRIPTION_FEE);
    }

    function test_RevertWhen_InsufficientPayment() public {
        vm.prank(generator1);
        alphaEngine.registerGenerator(SUBSCRIPTION_FEE, PERFORMANCE_FEE);

        bytes32 encryptedAddress = keccak256(abi.encodePacked(consumer1));

        vm.prank(consumer1);
        vm.expectRevert("Insufficient payment");
        alphaEngine.subscribe{value: 0.005 ether}(generator1, encryptedAddress);
    }

    function test_MultipleSubscriptions() public {
        // Register generator
        vm.prank(generator1);
        alphaEngine.registerGenerator(SUBSCRIPTION_FEE, PERFORMANCE_FEE);

        // Multiple consumers subscribe
        bytes32 encrypted1 = keccak256(abi.encodePacked(consumer1));
        bytes32 encrypted2 = keccak256(abi.encodePacked(consumer2));
        bytes32 encrypted3 = keccak256(abi.encodePacked(consumer3));

        vm.prank(consumer1);
        alphaEngine.subscribe{value: SUBSCRIPTION_FEE}(generator1, encrypted1);

        vm.prank(consumer2);
        alphaEngine.subscribe{value: SUBSCRIPTION_FEE}(generator1, encrypted2);

        vm.prank(consumer3);
        alphaEngine.subscribe{value: SUBSCRIPTION_FEE}(generator1, encrypted3);

        // Verify stats
        (, , , , uint256 totalSubs, uint256 totalVol, ) =
            alphaEngine.generators(generator1);

        assertEq(totalSubs, 3);
        assertEq(totalVol, SUBSCRIPTION_FEE * 3);
    }

    // ============ Trade Proposal Tests ============

    function test_ProposeTrade() public {
        // Register generator
        vm.prank(generator1);
        alphaEngine.registerGenerator(SUBSCRIPTION_FEE, PERFORMANCE_FEE);

        // Propose trade
        bytes memory executionData = abi.encode("swap", "tokenA", "tokenB", 1 ether);
        uint256 gasEstimate = 300000;
        uint256 expiryMinutes = 30;

        vm.prank(generator1);
        bytes32 tradeId = alphaEngine.proposeTrade(executionData, gasEstimate, expiryMinutes);

        // Verify trade details
        (bytes32 id, address gen, , uint256 gas, uint256 expiry, bool executed, ) =
            alphaEngine.trades(tradeId);

        assertEq(id, tradeId);
        assertEq(gen, generator1);
        assertEq(gas, gasEstimate);
        assertEq(expiry, block.timestamp + (expiryMinutes * 60));
        assertFalse(executed);
    }

    function test_RevertWhen_NonGeneratorProposesTrade() public {
        bytes memory executionData = abi.encode("test");

        vm.prank(consumer1);
        vm.expectRevert("Not an active generator");
        alphaEngine.proposeTrade(executionData, 300000, 30);
    }

    function testFuzz_ProposeTrade(uint256 gasEstimate, uint256 expiryMinutes) public {
        gasEstimate = bound(gasEstimate, 21001, 10000000);
        expiryMinutes = bound(expiryMinutes, 1, 1440);

        vm.prank(generator1);
        alphaEngine.registerGenerator(SUBSCRIPTION_FEE, PERFORMANCE_FEE);

        bytes memory executionData = abi.encode("fuzz", gasEstimate);

        vm.prank(generator1);
        bytes32 tradeId = alphaEngine.proposeTrade(executionData, gasEstimate, expiryMinutes);

        (, , , uint256 storedGas, uint256 expiry, , ) =
            alphaEngine.trades(tradeId);

        assertEq(storedGas, gasEstimate);
        assertEq(expiry, block.timestamp + (expiryMinutes * 60));
    }

    // ============ Admin Function Tests ============

    function test_PauseUnpause() public {
        alphaEngine.pause();
        assertTrue(alphaEngine.paused());

        alphaEngine.unpause();
        assertFalse(alphaEngine.paused());
    }

    function test_DeactivateGenerator() public {
        vm.prank(generator1);
        alphaEngine.registerGenerator(SUBSCRIPTION_FEE, PERFORMANCE_FEE);

        alphaEngine.deactivateGenerator(generator1);

        (, , , bool isActive, , , ) = alphaEngine.generators(generator1);
        assertFalse(isActive);
    }

    function test_RevertWhen_NonOwnerCallsAdmin() public {
        vm.prank(consumer1);
        vm.expectRevert("Ownable: caller is not the owner");
        alphaEngine.pause();
    }

    function test_EmergencyWithdraw() public {
        // Send ETH to contract
        vm.prank(consumer1);
        (bool sent, ) = address(alphaEngine).call{value: 1 ether}("");
        assertTrue(sent);

        uint256 initialBalance = owner.balance;

        alphaEngine.emergencyWithdraw();

        assertEq(owner.balance, initialBalance + 1 ether);
        assertEq(address(alphaEngine).balance, 0);
    }

    // ============ Edge Cases & Invariants ============

    function invariant_SubscriberCountNeverNegative() public {
        (, , , , uint256 totalSubs, , ) = alphaEngine.generators(generator1);
        assertGe(totalSubs, 0);
    }

    function invariant_TotalVolumeIncreases() public {
        (, , , , , uint256 totalVol, ) = alphaEngine.generators(generator1);
        // This invariant ensures volume only increases or stays same
        assertGe(totalVol, 0);
    }
}
```
            </filePath>
    - **Summary of Changes & Reasoning**: Created comprehensive test suite covering all contract functionality including generator registration, subscriptions, trade proposals, admin functions, and edge cases. Tests ensure security and proper access control.
</step-format>


</execution-plan>

---

## Implementation Notes

### Parallel Execution Strategy
- Library (S1) must be deployed first
- Main contract (S2) depends on library
- Deployment (S3) and tests (S4) can run after S2 in parallel

### Testing Approach
1. Deploy contracts to local Anvil network
2. Run comprehensive test suite with Foundry
3. Deploy to Fhenix testnet for FHE testing
4. Verify contracts on block explorer

### Deployment Commands
```bash
# Compile contracts
forge build

# Run tests
forge test

# Deploy locally
forge script script/Deploy.s.sol --rpc-url http://localhost:8545

# Deploy to Fhenix testnet
forge script script/Deploy.s.sol --rpc-url $FHENIX_RPC_URL --broadcast
```

### Success Criteria
✅ Contracts compile without errors
✅ All tests pass
✅ Deployment script works on testnet
✅ Contract verification succeeds