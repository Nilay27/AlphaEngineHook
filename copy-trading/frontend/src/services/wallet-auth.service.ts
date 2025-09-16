import { signMessage, getAccount } from '@wagmi/core'
import { verifyMessage } from 'viem'
import { config } from '../libs/wagmi-config'

export async function signMessageForLogin(message = 'Sign to use AlphaEngine') {
  const signature = await signMessage(config, { message })
  return { signature }
}

export async function verifyLastSignature(message: string, signature: `0x${string}`) {
  const { address } = getAccount(config)
  if (!address) {
    throw new Error('No wallet connected')
  }
  // Using viem's verifyMessage for Wagmi v2 compatibility
  const verified = await verifyMessage({ 
    address, 
    message, 
    signature 
  })
  return { verified, address }
}

export function getCurrentWalletAddress() {
  const { address } = getAccount(config)
  return address
}

export function isWalletConnected() {
  const { isConnected } = getAccount(config)
  return isConnected
}