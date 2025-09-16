import { ethers } from 'ethers';
import { db } from '@/db/db';
import { eq } from 'drizzle-orm';
import { projectsTable } from '@/db/schema/projects-schema';

// Log environment variables at startup for debugging
console.log('[BLOCKCHAIN CONFIG] Starting blockchain utils initialization');
console.log(`[BLOCKCHAIN CONFIG] Smart contract address: ${process.env.SMART_CONTRACT_ADDRESS || 'NOT SET'}`);
console.log(`[BLOCKCHAIN CONFIG] RPC URL: ${process.env.RPC_URL || 'NOT SET'}`);
console.log(`[BLOCKCHAIN CONFIG] LLEDU Token address: ${process.env.LLEDU_TOKEN_ADDRESS || 'NOT SET'}`);
console.log(`[BLOCKCHAIN CONFIG] Chain ID: ${process.env.CHAIN_ID || 'NOT SET'}`);
// Don't log the private key for security reasons
console.log(`[BLOCKCHAIN CONFIG] Executor private key configured: ${!!process.env.EXECUTOR_PRIVATE_KEY}`);

// ABI for the ProjectLedgerMVP smart contract
const CONTRACT_ABI = [
  // Registration functions
  "function registerAsCompanyFor(address walletAddress) external",
  "function registerAsFreelancerFor(address walletAddress) external",
  
  // Submission functions
  "function createSubmissionFor(address walletAddress, bytes32 _projectId) external returns (bytes32 submissionId)",
  
  // Approval functions
  "function approveSubmissionFor(address walletAddress, bytes32 _submissionId) external returns (bool)",
  
  // View functions
  "function isCompany(address _user) external view returns (bool)",
  "function isFreelancer(address _user) external view returns (bool)",
  "function registerFreelancer(address _user) external returns (bool)",
  "function registerCompany(address _user) external returns (bool)"
];

// Validate ABI to make sure we have the functions we need
const REQUIRED_FUNCTIONS = [
  'registerAsCompanyFor',
  'registerAsFreelancerFor',
  'createSubmissionFor',
  'approveSubmissionFor',
  'isCompany',
  'isFreelancer'
];

// Check if all required functions are in the ABI
const abiFunctions = CONTRACT_ABI
  .filter(item => item.startsWith('function'))
  .map(item => {
    const match = item.match(/function\s+([^\s(]+)/);
    return match ? match[1] : null;
  })
  .filter(Boolean);

const missingFunctions = REQUIRED_FUNCTIONS.filter(fn => !abiFunctions.includes(fn));
if (missingFunctions.length > 0) {
  console.error(`[BLOCKCHAIN CONFIG] WARNING: Missing required functions in CONTRACT_ABI: ${missingFunctions.join(', ')}`);
}

// Environment variables
const EXECUTOR_PRIVATE_KEY = process.env.EXECUTOR_PRIVATE_KEY as string;
const CONTRACT_ADDRESS = process.env.SMART_CONTRACT_ADDRESS as string;
const RPC_URL = process.env.RPC_URL || 'https://rpc.open-campus-codex.gelato.digital'; // Default to Mumbai testnet

if (!EXECUTOR_PRIVATE_KEY) {
  console.error('EXECUTOR_PRIVATE_KEY environment variable is not set');
}

if (!CONTRACT_ADDRESS) {
  console.error('SMART_CONTRACT_ADDRESS environment variable is not set');
}

/**
 * Get an ethers provider instance
 */
function getProvider() {
  try {
    if (!RPC_URL) {
      throw new Error('RPC_URL is not defined');
    }
    console.log(`[BLOCKCHAIN] Creating provider with RPC URL: ${RPC_URL}`);
    return new ethers.JsonRpcProvider(RPC_URL);
  } catch (error: any) {
    console.error(`[BLOCKCHAIN] Failed to create provider: ${error.message}`);
    throw error;
  }
}

/**
 * Get a signer instance for the executor role
 */
function getExecutorSigner() {
  try {
    if (!EXECUTOR_PRIVATE_KEY) {
      throw new Error('EXECUTOR_PRIVATE_KEY is not defined');
    }
    console.log('[BLOCKCHAIN] Creating executor signer');
    const provider = getProvider();
    return new ethers.Wallet(EXECUTOR_PRIVATE_KEY, provider);
  } catch (error: any) {
    console.error(`[BLOCKCHAIN] Failed to create executor signer: ${error.message}`);
    throw error;
  }
}

/**
 * Get a contract instance connected to the executor signer
 */
export function getContractWithExecutor() {
  try {
    if (!CONTRACT_ADDRESS) {
      throw new Error('CONTRACT_ADDRESS is not defined');
    }
    console.log(`[BLOCKCHAIN] Creating contract instance at address: ${CONTRACT_ADDRESS}`);
    const signer = getExecutorSigner();
    const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
    
    // Add extra validation to verify contract functions
    console.log('🔍 [BLOCKCHAIN] Checking available contract functions:');
    // Changed to use a different method for getting function names
    const fragments = contract.interface.fragments;
    const contractFunctions = fragments.map((f: any) => f.name).filter(Boolean);
    console.log(`🔍 [BLOCKCHAIN] Available functions: ${contractFunctions.length ? contractFunctions.join(', ') : 'NONE FOUND 🚨'}`);
    
    // Check specifically for createSubmissionFor
    if (!contractFunctions.includes('createSubmissionFor')) {
      console.error('🚨🚨🚨 [BLOCKCHAIN ERROR] createSubmissionFor function not found in contract interface! 🚨🚨🚨');
      console.error('🚨 This may be due to an ABI parsing issue with the modifier. Check the contract ABI definition.');
    }
    
    return contract;
  } catch (error: any) {
    console.error(`[BLOCKCHAIN] Failed to create contract instance: ${error.message}`);
    throw error;
  }
}

/**
 * Register a user as a company in the smart contract
 * @param userAddress The user's wallet address
 */
export async function registerUserAsCompany(userAddress: string) {
  try {
    console.log(`Registering user ${userAddress} as company...`);
    
    const contract = getContractWithExecutor();
    
    // Call the registerAsCompany function as the executor using bracket notation
    const tx = await contract['registerAsCompanyFor'](userAddress);
    const receipt = await tx.wait();
    
    console.log(`User registered as company. Transaction hash: ${receipt.hash}`);
    return { success: true, txHash: receipt.hash };
  } catch (error) {
    console.error('Error registering user as company:', error);
    return { success: false, error };
  }
}

/**
 * Register a user as a freelancer in the smart contract
 * @param userAddress The user's wallet address
 */
export async function registerUserAsFreelancer(userAddress: string) {
  try {
    console.log(`Registering user ${userAddress} as freelancer...`);
    
    const contract = getContractWithExecutor();
    
    // Call the registerAsFreelancer function as the executor using bracket notation
    const tx = await contract['registerAsFreelancerFor'](userAddress);
    const receipt = await tx.wait();
    
    console.log(`User registered as freelancer. Transaction hash: ${receipt.hash}`);
    return { success: true, txHash: receipt.hash };
  } catch (error) {
    console.error('Error registering user as freelancer:', error);
    return { success: false, error };
  }
}

/**
 * Create a submission for a project in the smart contract
 * @param projectId The project ID (UUID from database)
 */
export async function createSubmissionOnChain(userAddress: string, projectId: string) {
  try {
    console.log(`🚀 [BLOCKCHAIN] Creating submission for project ${projectId}...`);
    console.log(`🚀 [BLOCKCHAIN] User address: ${userAddress}`);
    console.log(`🚀 [BLOCKCHAIN] Smart contract address: ${CONTRACT_ADDRESS}`);
    console.log(`🚀 [BLOCKCHAIN] RPC URL: ${RPC_URL}`);
    
    // TEMPORARY MOCK IMPLEMENTATION
    // This will bypass actual blockchain calls until the contract issue is fixed
    const USE_MOCK = false; // Set this to false to use real blockchain calls
    
    if (USE_MOCK) {
      console.log(`🔶 [BLOCKCHAIN MOCK] Using mock implementation for testing`);
      console.log(`🔶 [BLOCKCHAIN MOCK] This will return a successful result without making blockchain calls`);
      
      // Format project ID (for logging purposes)
      let formattedProjectId = projectId;
      if (projectId.includes('-')) {
        const uuidWithoutHyphens = projectId.replace(/-/g, '');
        const paddedUuid = uuidWithoutHyphens.padEnd(64, '0');
        formattedProjectId = '0x' + paddedUuid;
      }
      
      // Create a mock transaction hash
      const mockTxHash = '0x' + Array(64).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join('');
      console.log(`🔶 [BLOCKCHAIN MOCK] Generated mock transaction hash: ${mockTxHash}`);
      
      // Create a mock submission ID (using the formatted project ID)
      const mockSubmissionId = formattedProjectId;
      console.log(`🔶 [BLOCKCHAIN MOCK] Using project ID as submission ID: ${mockSubmissionId}`);
      
      return {
        success: true,
        txHash: mockTxHash,
        submissionId: mockSubmissionId
      };
    }
    
    if (!CONTRACT_ADDRESS) {
      console.error('🔴 [BLOCKCHAIN] CONTRACT_ADDRESS is not defined!');
      return { success: false, error: 'Smart contract address is not configured' };
    }
    
    if (!EXECUTOR_PRIVATE_KEY) {
      console.error('🔴 [BLOCKCHAIN] EXECUTOR_PRIVATE_KEY is not defined!');
      return { success: false, error: 'Executor private key is not configured' };
    }
    
    // Validate project ID format
    if (!projectId) {
      console.error('🔴 [BLOCKCHAIN] Project ID is empty or undefined!');
      return { success: false, error: 'Project ID is required' };
    }
    
    // Validate wallet address format
    if (!userAddress || !userAddress.startsWith('0x') || userAddress.length !== 42) {
      console.error(`🔴 [BLOCKCHAIN] Invalid wallet address format: ${userAddress}`);
      return { success: false, error: 'Invalid wallet address format' };
    }
    
    console.log('🔄 [BLOCKCHAIN] Getting provider and signer...');
    const contract = getContractWithExecutor();
    
    // We need to find the blockchain project ID that corresponds to this database UUID
    console.log(`🔍 [BLOCKCHAIN] Looking up blockchain project ID for database UUID: ${projectId}`);
    
    let blockchainProjectId = "";
    
    try {
      // Fetch blockchain project ID from the database if it exists
      const [project] = await db
        .select()
        .from(projectsTable)
        .where(eq(projectsTable.projectId, projectId))
        .limit(1);
        
      if (!project) {
        console.error(`🔴 [BLOCKCHAIN] Project with ID ${projectId} not found in database.`);
        return { success: false, error: 'Project not found in database.' };
      }
      
      // Check if we have a stored blockchain project ID - THIS IS NOW MANDATORY
      if (project.onChainProjectId) {
        blockchainProjectId = project.onChainProjectId;
        console.log(`✅ [BLOCKCHAIN] Found stored blockchain project ID: ${blockchainProjectId}`);
      } else {
        // No stored blockchain ID - this is now an error condition
        console.error(`🔴 [BLOCKCHAIN] Project ${projectId} does not have an on-chain ID.`);
        return { 
          success: false, 
          error: 'This project has not been properly created on the blockchain. Please contact support.'
        };
      }
      
      console.log(`🔄 [BLOCKCHAIN] Using project ID for blockchain: ${blockchainProjectId}`);
      console.log(`🔄 [BLOCKCHAIN] Hex length: ${blockchainProjectId.length - 2} characters (should be 64 for bytes32)`);
      
      // Validate blockchain project ID format
      if (!blockchainProjectId.startsWith('0x') || blockchainProjectId.length !== 66) {
        console.error(`🔴 [BLOCKCHAIN] Invalid blockchain project ID format: ${blockchainProjectId}`);
        return { 
          success: false, 
          error: 'Invalid blockchain project ID format. Please contact support.'
        };
      }
      
    } catch (error) {
      console.error(`🔴 [BLOCKCHAIN] Error fetching project from database:`, error);
      return { 
        success: false, 
        error: 'Error fetching project information from database. Please try again later.'
      };
    }
    
    console.log('🔄 [BLOCKCHAIN] Sending transaction to createSubmissionFor...');
    
    // Always use bracket notation for calling contract functions
    // This avoids issues with ethers.js ABI parsing, especially for functions with modifiers
    try {
      console.log('🔍 [BLOCKCHAIN] Using bracket notation to call createSubmissionFor...');
      
      // Direct bracket notation call - more reliable with complex ABIs
      const tx = await contract['createSubmissionFor'](userAddress, blockchainProjectId);
      console.log(`✅ [BLOCKCHAIN] Transaction sent successfully. Hash: ${tx.hash}`);
      
      console.log('🔄 [BLOCKCHAIN] Waiting for transaction confirmation...');
      const receipt = await tx.wait();
      console.log(`✅ [BLOCKCHAIN] Transaction confirmed in block ${receipt.blockNumber}`);
      
      // Parse the event to get the submission ID
      console.log('🔍 [BLOCKCHAIN] Parsing logs to extract submission ID...');
      
      // Make sure we have logs before trying to access them
      if (!receipt.logs || receipt.logs.length === 0) {
        console.log('ℹ️ [BLOCKCHAIN] No logs found in transaction receipt, using project ID as submission ID');
        return { 
          success: true, 
          txHash: receipt.hash,
          submissionId: blockchainProjectId // Fallback to project ID if we can't extract submission ID
        };
      }
      
      // Check for topics in the first log
      if (!receipt.logs[0].topics || receipt.logs[0].topics.length < 2) {
        console.log('ℹ️ [BLOCKCHAIN] Expected topics not found in logs, using project ID as submission ID');
        return { 
          success: true, 
          txHash: receipt.hash,
          submissionId: blockchainProjectId // Fallback to project ID if we can't extract submission ID
        };
      }
      
      const submissionId = receipt.logs[0].topics[1]; // This may need adjustment based on the actual event structure
      
      console.log(`✅ [BLOCKCHAIN] Submission created successfully. ID: ${submissionId}, Transaction hash: ${receipt.hash}`);
      return { success: true, submissionId, txHash: receipt.hash };
    } catch (callError: any) {
      console.error('❌ [BLOCKCHAIN] Error calling createSubmissionFor:', callError.message);
      return { 
        success: false, 
        error: `Contract call failed: ${callError.message}`
      };
    }
  } catch (error: any) {
    console.error('🚨🚨🚨 [BLOCKCHAIN ERROR] Error creating submission: 🚨🚨🚨', error);
    // Log more detailed error information
    if (error.code) {
      console.error(`🚨 [BLOCKCHAIN] Error code: ${error.code}`);
    }
    if (error.reason) {
      console.error(`🚨 [BLOCKCHAIN] Error reason: ${error.reason}`);
    }
    if (error.error && error.error.message) {
      console.error(`🚨 [BLOCKCHAIN] RPC error message: ${error.error.message}`);
    }
    if (error.transaction) {
      console.error(`🚨 [BLOCKCHAIN] Transaction data: ${JSON.stringify(error.transaction)}`);
    }
    
    // Special handling for "not a function" error
    if (error.toString().includes('is not a function')) {
      console.error('🚨 [BLOCKCHAIN] Function not found error detected. This is likely an ABI issue with the modifier syntax.');
      console.error('🚨 [BLOCKCHAIN] Try simplifying the ABI definition by removing the modifier from the function signature.');
    }
    
    return { success: false, error };
  }
}

/**
 * Approves a submission on the blockchain, triggering token transfer to the freelancer
 * @param userAddress The freelancer's wallet address
 * @param submissionId The on-chain submission ID to approve
 * @returns Result object with success status and transaction hash or error
 */
export async function approveSubmissionOnChain(userAddress: string, submissionId: string) {
  try {
    console.log(`[blockchain] Approving submission ${submissionId} for user ${userAddress}...`);
    
    const contract = getContractWithExecutor();
    
    // Call the approveSubmission function using bracket notation to avoid ethers.js parsing issues
    const tx = await contract['approveSubmissionFor'](userAddress, submissionId);
    console.log(`[blockchain] Approval transaction sent: ${tx.hash}`);
    
    const receipt = await tx.wait();
    console.log(`[blockchain] Submission approved. Transaction hash: ${receipt.hash}`);
    
    return { success: true, txHash: receipt.hash };
  } catch (error) {
    console.error('[blockchain] Error approving submission:', error);
    
    // Try fallback if primary call failed
    try {
      console.log('[blockchain] Attempting fallback approveSubmission call...');
      const contract = getContractWithExecutor();
      
      // Use more direct approach as fallback
      const tx = await contract.approveSubmissionFor(userAddress, submissionId);
      const receipt = await tx.wait();
      
      console.log(`[blockchain] Fallback submission approval succeeded. Transaction hash: ${receipt.hash}`);
      return { success: true, txHash: receipt.hash };
    } catch (fallbackError) {
      console.error('[blockchain] Fallback approveSubmission also failed:', fallbackError);
      return { success: false, error: error };
    }
  }
}

/**
 * Check if an address is registered as a freelancer on the blockchain
 */
export async function isFreelancerOnBlockchain(walletAddress: string): Promise<boolean> {
  try {
    const contract = getContractWithExecutor();
    return await contract['isFreelancer'](walletAddress);
  } catch (error) {
    console.error(`Error checking if ${walletAddress} is a freelancer:`, error);
    // Return false in case of error to be safe
    return false;
  }
}

/**
 * Check if an address is registered as a company on the blockchain
 */
export async function isCompanyOnBlockchain(walletAddress: string): Promise<boolean> {
  try {
    const contract = getContractWithExecutor();
    return await contract['isCompany'](walletAddress);
  } catch (error) {
    console.error(`Error checking if ${walletAddress} is a company:`, error);
    // Return false in case of error to be safe
    return false;
  }
} 