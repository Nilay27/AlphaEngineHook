// test-delete-submission.mjs
import { ethers } from 'ethers';
import fetch from 'node-fetch';

// Replace with your private key (never share or commit this!)
const PRIVATE_KEY = '0xe7c476a2f205dc5853881288f5ea2d66c67dcffcbe99be42fae417bf0bbdc896';

// Choose a submission to delete - let's use one from your list
const submissionId = 'cf1c1633-1727-4626-948a-9136e3c6bd3c';
const projectId = 'ed8c927e-ab37-494a-90b9-b85fcb9e9e98';

async function main() {
  // Create wallet from private key
  const wallet = new ethers.Wallet(PRIVATE_KEY);
  const walletAddress = wallet.address;
  console.log(`Using wallet address: ${walletAddress}`);

  // Create the EIP-712 domain and data
  const domain = {
    name: 'LearnLedger',
    version: '1',
    chainId: '1', // Default to Ethereum mainnet
    verifyingContract: '0x0000000000000000000000000000000000000000'
  };

  const types = {
    DeleteSubmission: [
      { name: 'submissionId', type: 'string' },
      { name: 'projectId', type: 'string' },
      { name: 'walletAddress', type: 'address' },
      { name: 'nonce', type: 'uint256' }
    ]
  };

  const nonce = Date.now();
  const value = {
    submissionId,
    projectId,
    walletAddress,
    nonce
  };

  // Sign the data
  const signature = await wallet.signTypedData(domain, types, value);
  console.log(`Generated signature: ${signature}`);

  // Make the API request
  const response = await fetch('http://localhost:3000/api/submissions/delete', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      submissionId,
      walletAddress,
      signature,
      nonce
    }),
  });

  const result = await response.json();
  console.log('API Response:', result);
}

main().catch(console.error);