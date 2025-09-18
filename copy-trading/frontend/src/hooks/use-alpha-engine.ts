import { useState, useEffect, useCallback } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useReadContract } from 'wagmi';
import { parseEther, Address } from 'viem';
import { alphaEngineClient, type AlphaGenerator, type AlphaSubscription } from '@/utils/alphaengine-client';
import { ALPHAENGINE_ABI, ALPHAENGINE_CONTRACT_ADDRESS } from '@/contracts/AlphaEngine';
import { toast } from 'react-hot-toast';

// Mock FhenixClient for now to avoid build issues
interface MockFhenixClient {
  encrypt: (value: any) => Promise<string>;
}

export interface UseAlphaEngineReturn {
  // State
  isSubscribing: boolean;
  isRegistering: boolean;
  encryptedAddress: string | null;
  subscriptionStatus: 'idle' | 'encrypting' | 'signing' | 'confirming' | 'completed' | 'error';

  // Methods
  subscribeToGenerator: (generator: AlphaGenerator) => Promise<void>;
  registerAsGenerator: (fee: string, performanceFee: number) => Promise<void>;
  verifySubscription: (generatorAddress: string) => Promise<boolean>;
  getEncryptedSubscribers: (generatorAddress: string) => Promise<string[]>;

  // Contract state
  contractWrite: ReturnType<typeof useWriteContract>;
  transactionReceipt: ReturnType<typeof useWaitForTransactionReceipt>;
}

export function useAlphaEngine(): UseAlphaEngineReturn {
  const { address: userAddress, isConnected } = useAccount();
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [encryptedAddress, setEncryptedAddress] = useState<string | null>(null);
  const [subscriptionStatus, setSubscriptionStatus] = useState<UseAlphaEngineReturn['subscriptionStatus']>('idle');
  const [fhenixClient, setFhenixClient] = useState<FhenixClient | null>(null);

  const contractWrite = useWriteContract();
  const transactionReceipt = useWaitForTransactionReceipt({
    hash: contractWrite.data,
  });

  // Initialize Mock Fhenix client (will be replaced with real FHE later)
  useEffect(() => {
    // Using mock encryption for now until FhenixJS WebAssembly issues are resolved
    const mockClient = {
      encrypt: async (value: any) => {
        // Mock encryption: just hex encode the value
        const str = typeof value === 'string' ? value : value.toString();
        return `0x${Buffer.from(str).toString('hex').padEnd(64, '0')}`;
      }
    };
    setFhenixClient(mockClient);
  }, []);

  // Handle transaction completion
  useEffect(() => {
    if (transactionReceipt.isSuccess && contractWrite.data) {
      handleTransactionSuccess();
    }
  }, [transactionReceipt.isSuccess, contractWrite.data]);

  const handleTransactionSuccess = async () => {
    if (!contractWrite.data || !userAddress) return;

    try {
      // Get the function name from contract write context
      const functionName = contractWrite.variables?.functionName;

      if (functionName === 'subscribe') {
        // Register subscription with backend
        const generatorAddress = contractWrite.variables?.args?.[0] as string;
        await alphaEngineClient.subscribeToGenerator(
          generatorAddress,
          userAddress,
          contractWrite.data
        );
        toast.success('Successfully subscribed to generator!');
        setSubscriptionStatus('completed');
      } else if (functionName === 'registerGenerator') {
        // Register generator with backend
        await alphaEngineClient.registerGenerator({
          walletAddress: userAddress,
          subscriptionFee: contractWrite.variables?.args?.[0] as string,
          performanceFee: contractWrite.variables?.args?.[1] as number,
        });
        toast.success('Successfully registered as generator!');
      }
    } catch (error) {
      console.error('Post-transaction error:', error);
      toast.error('Transaction succeeded but backend sync failed');
    } finally {
      setIsSubscribing(false);
      setIsRegistering(false);
    }
  };

  /**
   * Subscribe to an alpha generator
   */
  const subscribeToGenerator = useCallback(async (generator: AlphaGenerator) => {
    if (!isConnected || !userAddress || !fhenixClient) {
      toast.error('Please connect your wallet');
      return;
    }

    try {
      setIsSubscribing(true);
      setSubscriptionStatus('encrypting');

      // Step 1: Encrypt user address for this generator
      const encrypted = await fhenixClient.encrypt(
        userAddress as string,
        'address'
      );

      // Extract encrypted data
      const encryptedData = encrypted.data || encrypted.ciphertext || encrypted;
      setEncryptedAddress(encryptedData);

      // Step 2: Call smart contract
      setSubscriptionStatus('signing');

      await contractWrite.writeContract({
        address: ALPHAENGINE_CONTRACT_ADDRESS,
        abi: ALPHAENGINE_ABI,
        functionName: 'subscribe',
        args: [generator.walletAddress as Address, encryptedData],
        value: parseEther(generator.subscriptionFee),
      });

      setSubscriptionStatus('confirming');
    } catch (error: any) {
      console.error('Subscription error:', error);
      toast.error(error.message || 'Failed to subscribe');
      setSubscriptionStatus('error');
      setIsSubscribing(false);
    }
  }, [isConnected, userAddress, fhenixClient, contractWrite]);

  /**
   * Register as an alpha generator
   */
  const registerAsGenerator = useCallback(async (
    subscriptionFee: string,
    performanceFee: number
  ) => {
    if (!isConnected || !userAddress) {
      toast.error('Please connect your wallet');
      return;
    }

    try {
      setIsRegistering(true);

      await contractWrite.writeContract({
        address: ALPHAENGINE_CONTRACT_ADDRESS,
        abi: ALPHAENGINE_ABI,
        functionName: 'registerGenerator',
        args: [parseEther(subscriptionFee), performanceFee],
      });
    } catch (error: any) {
      console.error('Registration error:', error);
      toast.error(error.message || 'Failed to register');
      setIsRegistering(false);
    }
  }, [isConnected, userAddress, contractWrite]);

  /**
   * Verify subscription status on-chain
   */
  const verifySubscription = useCallback(async (generatorAddress: string): Promise<boolean> => {
    if (!userAddress || !fhenixClient) return false;

    try {
      // First check with backend
      const response = await alphaEngineClient.verifySubscription(userAddress, generatorAddress);

      if (!response.isSubscribed) return false;

      // Optionally verify on-chain
      // This would require calling the smart contract's isSubscribed function
      // with the encrypted address

      return true;
    } catch (error) {
      console.error('Verification error:', error);
      return false;
    }
  }, [userAddress, fhenixClient]);

  /**
   * Get encrypted subscribers for a generator
   */
  const getEncryptedSubscribers = useCallback(async (generatorAddress: string): Promise<string[]> => {
    try {
      const response = await alphaEngineClient.getGeneratorSubscriptions(generatorAddress);
      return response
        .filter(sub => sub.encryptedConsumerAddress)
        .map(sub => sub.encryptedConsumerAddress as string);
    } catch (error) {
      console.error('Failed to fetch subscribers:', error);
      return [];
    }
  }, []);

  return {
    isSubscribing,
    isRegistering,
    encryptedAddress,
    subscriptionStatus,
    subscribeToGenerator,
    registerAsGenerator,
    verifySubscription,
    getEncryptedSubscribers,
    contractWrite,
    transactionReceipt,
  };
}

/**
 * Hook to manage real-time notifications
 */
export function useTradeNotifications(consumerAddress?: string) {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!consumerAddress) return;

    const eventSource = alphaEngineClient.createNotificationStream(consumerAddress);

    eventSource.onopen = () => {
      setIsConnected(true);
      console.log('SSE connection established');
    };

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        setNotifications(prev => [data, ...prev].slice(0, 50)); // Keep last 50

        // Show toast for new trades
        if (data.type === 'NEW_TRADE') {
          toast.success('New trade alert from your generator!');
        }
      } catch (error) {
        console.error('Failed to parse notification:', error);
      }
    };

    eventSource.onerror = () => {
      setIsConnected(false);
      console.error('SSE connection error');
    };

    return () => {
      eventSource.close();
    };
  }, [consumerAddress]);

  return {
    notifications,
    isConnected,
  };
}