require('dotenv').config();
const { ethers } = require('ethers');

// Log environment variables at startup for debugging
console.log('[BLOCKCHAIN CONFIG] Starting blockchain utils initialization');
console.log(`[BLOCKCHAIN CONFIG] Smart contract address: ${process.env.SMART_CONTRACT_ADDRESS || 'NOT SET'}`);
console.log(`[BLOCKCHAIN CONFIG] RPC URL: ${process.env.RPC_URL || 'NOT SET'}`);
console.log(`[BLOCKCHAIN CONFIG] Chain ID: ${process.env.CHAIN_ID || 'NOT SET'}`);
console.log(`[BLOCKCHAIN CONFIG] Executor private key configured: ${!!process.env.EXECUTOR_PRIVATE_KEY}`);

// ABI with simplified function definitions (no modifiers)
const CONTRACT_ABI = [
  // Submission functions - simplified definition
  "function createSubmission(bytes32 _projectId) external returns (bytes32 submissionId)",
  
  // Direct submission function
  "function createSubmissionFor(address walletAddress, bytes32 _projectId) external returns (bytes32 submissionId)",
];

const EXECUTOR_PRIVATE_KEY = process.env.EXECUTOR_PRIVATE_KEY;
const CONTRACT_ADDRESS = process.env.SMART_CONTRACT_ADDRESS;
const RPC_URL = process.env.RPC_URL || 'https://rpc.open-campus-codex.gelato.digital';

async function getProvider() {
  console.log(`🔄 Creating provider with RPC URL: ${RPC_URL}`);
  return new ethers.JsonRpcProvider(RPC_URL);
}

async function getSigner() {
  console.log('🔄 Creating executor signer');
  const provider = await getProvider();
  return new ethers.Wallet(EXECUTOR_PRIVATE_KEY, provider);
}

async function getContract() {
  try {
    console.log(`🔄 Creating contract instance at address: ${CONTRACT_ADDRESS}`);
    const signer = await getSigner();
    const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
    
    // Log available functions
    console.log('🔍 Available contract functions:');
    const fragments = contract.interface.fragments;
    const functionNames = fragments.map(f => f.name).filter(Boolean);
    console.log(`🔍 Function names: ${functionNames.join(', ')}`);
    
    return contract;
  } catch (error) {
    console.error('❌ Failed to create contract:', error);
    throw error;
  }
}

async function testCreateSubmission() {
  try {
    const testWallet = "0xB92749d0769EB9fb1B45f2dE0CD51c97aa220f93";
    const projectId = "673df649-084b-4bb7-a1b3-8389cee48089";
    
    // Format the project ID to ensure it's a valid bytes32
    const uuidWithoutHyphens = projectId.replace(/-/g, '');
    // A UUID without hyphens is 32 characters, pad to 64 for bytes32
    const paddedUuid = uuidWithoutHyphens.padEnd(64, '0');
    const formattedProjectId = '0x' + paddedUuid;
    console.log(`🔄 Formatted project ID: ${formattedProjectId}`);
    console.log(`🔄 Hex length: ${formattedProjectId.length - 2} characters (should be 64 for bytes32)`);
    
    const contract = await getContract();
    
    // Test contract.interface and available functions
    console.log('🔍 Inspecting contract methods:');
    const methods = Object.keys(contract).filter(k => !k.startsWith('_') && typeof contract[k] === 'function');
    console.log(`🔍 Available methods: ${methods.join(', ')}`);
    
    // Try using string accessor syntax
    console.log('🔄 Attempting createSubmissionFor call with bracket syntax...');
    try {
      const tx = await contract['createSubmissionFor'](testWallet, formattedProjectId);
      console.log(`✅ Transaction sent! Hash: ${tx.hash}`);
      
      const receipt = await tx.wait();
      console.log(`✅ Transaction confirmed in block ${receipt.blockNumber}`);
      return { success: true, txHash: receipt.hash };
    } catch (error) {
      console.error('❌ Failed to call createSubmissionFor with bracket syntax:', error);
      
      // Try alternate methods if available
      if (contract.createSubmission) {
        console.log('🔄 Trying alternative method createSubmission...');
        try {
          const tx = await contract.createSubmission(formattedProjectId);
          console.log(`✅ Alternative method succeeded! Hash: ${tx.hash}`);
          const receipt = await tx.wait();
          return { success: true, txHash: receipt.hash };
        } catch (altError) {
          console.error('❌ Alternative method also failed:', altError);
        }
      }
    }
    
    return { success: false, error: 'Could not call contract function' };
  } catch (error) {
    console.error('❌ Test failed:', error);
    return { success: false, error };
  }
}

// Run the test
testCreateSubmission()
  .then(result => {
    console.log('📋 Test result:', result);
    process.exit(result.success ? 0 : 1);
  })
  .catch(error => {
    console.error('💥 Unhandled error:', error);
    process.exit(1);
  }); 