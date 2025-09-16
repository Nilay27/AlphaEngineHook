"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface WalletContextType {
  walletAddress: string | null
  userRole: 'company' | 'freelancer' | null
  connect: () => Promise<void>
  disconnect: () => void
  isConnecting: boolean
  error: string | null
}

const WalletContext = createContext<WalletContextType>({
  walletAddress: null,
  userRole: null,
  connect: async () => {},
  disconnect: () => {},
  isConnecting: false,
  error: null
})

export const useWallet = () => useContext(WalletContext)

export function WalletProvider({ children }: { children: ReactNode }) {
  const [walletAddress, setWalletAddress] = useState<string | null>(null)
  const [userRole, setUserRole] = useState<'company' | 'freelancer' | null>(null)
  const [isConnecting, setIsConnecting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Check for an existing wallet connection on initial load
  useEffect(() => {
    const checkExistingConnection = async () => {
      try {
        // Check if we have a stored address in local storage
        // Only access localStorage in the browser
        if (typeof window !== 'undefined') {
          const storedAddress = localStorage.getItem('walletAddress')
          const storedRole = localStorage.getItem('userRole') as 'company' | 'freelancer' | null
          
          if (storedAddress) {
            setWalletAddress(storedAddress)
            setUserRole(storedRole)
          }
        }
      } catch (err) {
        console.error('Error checking existing connection:', err)
      }
    }
    
    checkExistingConnection()
  }, [])

  // Connect wallet function
  const connect = async () => {
    setIsConnecting(true)
    setError(null)
    
    try {
      // In a real implementation, this would use window.ethereum to request accounts
      // For now, we'll simulate a connection
      const mockAddress = '0x742d35Cc6634C0532925a3b844Bc454e4438f44e'
      
      setWalletAddress(mockAddress)
      
      // In a real app, you might get the role from your backend based on the address
      // For now, we'll leave it null - the user will need to choose their role
      
      // Store in localStorage (only in browser)
      if (typeof window !== 'undefined') {
        localStorage.setItem('walletAddress', mockAddress)
      }
    } catch (err: any) {
      setError(err.message || 'Failed to connect wallet')
      console.error('Error connecting wallet:', err)
    } finally {
      setIsConnecting(false)
    }
  }

  // Disconnect wallet function
  const disconnect = () => {
    setWalletAddress(null)
    setUserRole(null)
    if (typeof window !== 'undefined') {
      localStorage.removeItem('walletAddress')
      localStorage.removeItem('userRole')
    }
  }

  // When user role is selected, store it
  useEffect(() => {
    if (userRole && typeof window !== 'undefined') {
      localStorage.setItem('userRole', userRole)
    }
  }, [userRole])

  const value = {
    walletAddress,
    userRole,
    connect,
    disconnect,
    isConnecting,
    error
  }

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  )
} 