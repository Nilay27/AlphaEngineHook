import { createConfig, http } from 'wagmi'
import { sepolia, mainnet } from 'wagmi/chains'
import { abstractTestnet } from './chains'
import { injected } from 'wagmi/connectors'

/**
 * Get the appropriate chain based on environment configuration
 */
const getChain = () => {
  const chainId = process.env.NEXT_PUBLIC_CHAIN_ID ? 
    parseInt(process.env.NEXT_PUBLIC_CHAIN_ID) : 
    11155111; // Default to Sepolia
  
  switch (chainId) {
    case 1:
      return mainnet;
    case 11155111:
      return sepolia;
    case 11124:
      return abstractTestnet;
    default:
      console.warn(`Unknown chain ID: ${chainId}, defaulting to Sepolia`);
      return sepolia;
  }
};

// Get the selected chain
const selectedChain = getChain();

// Get RPC URL from environment or use chain default
const rpcUrl = process.env.NEXT_PUBLIC_RPC_URL || 
  selectedChain.rpcUrls.default.http[0];

export const config = createConfig({
  chains: [selectedChain],
  connectors: [
    injected({
      target: 'metaMask', // or 'coinbaseWallet', 'rabby', etc
    }),
    // Add other connectors as needed
  ],
  transports: {
    [selectedChain.id]: http(rpcUrl),
  } as Record<number, ReturnType<typeof http>>, // Type assertion needed due to dynamic chain selection
})

// Export the selected chain for use in other components
export const currentChain = selectedChain;