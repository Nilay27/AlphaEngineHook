/**
 * Utils for handling EIP-712 typed signatures for AlphaEngine.
 * Compatible with ethers v6.
 */

// The domain definition consistent across all EIP-712 signatures in our app
export const getEIP712Domain = () => ({
  name: 'AlphaEngine',
  version: '1',
  chainId: process.env.NEXT_PUBLIC_CHAIN_ID || '1',
  verifyingContract: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || '0x0000000000000000000000000000000000000000'
})

/**
 * Generate the EIP-712 typed data for a submission deletion request 
 */
export const generateDeleteSubmissionTypedData = (
  submissionId: string,
  projectId: string,
  walletAddress: string
) => {
  const domain = getEIP712Domain()
  
  const types = {
    DeleteSubmission: [
      { name: 'submissionId', type: 'string' },
      { name: 'projectId', type: 'string' },
      { name: 'walletAddress', type: 'address' },
      { name: 'nonce', type: 'uint256' }
    ]
  }

  // In a production app, you'd implement a proper nonce system 
  // to prevent replay attacks. For simplicity, we're using timestamp.
  const nonce = Date.now()
  
  const value = {
    submissionId,
    projectId,
    walletAddress,
    nonce
  }

  return {
    domain,
    types,
    value,
    nonce
  }
}

/**
 * Generate the EIP-712 typed data for user registration
 */
export const generateUserRegistrationTypedData = (
  walletAddress: string,
  role: 'freelancer' | 'company',
  // Optional data that will be signed
  data?: Record<string, any>
) => {
  const domain = getEIP712Domain()
  
  const types = {
    UserRegistration: [
      { name: 'walletAddress', type: 'address' },
      { name: 'role', type: 'string' },
      { name: 'nonce', type: 'uint256' }
    ]
  }

  const nonce = Date.now()
  
  const value = {
    walletAddress,
    role,
    nonce,
    ...data
  }

  return {
    domain,
    types,
    value,
    nonce
  }
}

/**
 * Generate the EIP-712 typed data for user profile updates
 */
export const generateUserProfileUpdateTypedData = (
  walletAddress: string,
  role: 'freelancer' | 'company',
  // Optional data that will be signed
  data?: Record<string, any>
) => {
  const domain = getEIP712Domain()
  
  const types = {
    UserProfileUpdate: [
      { name: 'walletAddress', type: 'address' },
      { name: 'role', type: 'string' },
      { name: 'nonce', type: 'uint256' }
    ]
  }

  const nonce = Date.now()
  
  const value = {
    walletAddress,
    role,
    nonce,
    ...data
  }

  return {
    domain,
    types,
    value,
    nonce
  }
}

/**
 * Generate the EIP-712 typed data for user profile deletion
 */
export const generateUserProfileDeleteTypedData = (
  walletAddress: string,
  role: 'freelancer' | 'company'
) => {
  const domain = getEIP712Domain()
  
  const types = {
    UserProfileDelete: [
      { name: 'walletAddress', type: 'address' },
      { name: 'role', type: 'string' },
      { name: 'nonce', type: 'uint256' }
    ]
  }

  const nonce = Date.now()
  
  const value = {
    walletAddress,
    role,
    nonce
  }

  return {
    domain,
    types,
    value,
    nonce
  }
}

/**
 * Generate the EIP-712 typed data for project creation
 */
export const generateProjectCreationTypedData = (
  walletAddress: string,
  projectName: string,
  projectDescription: string,
  prizeAmount: number | string
) => {
  const domain = getEIP712Domain()
  
  const types = {
    ProjectCreation: [
      { name: 'walletAddress', type: 'address' },
      { name: 'projectName', type: 'string' },
      { name: 'projectDescription', type: 'string' },
      { name: 'prizeAmount', type: 'string' },
      { name: 'nonce', type: 'uint256' }
    ]
  }

  const nonce = Date.now()
  
  const value = {
    walletAddress,
    projectName,
    projectDescription,
    prizeAmount: prizeAmount.toString(),
    nonce
  }

  return {
    domain,
    types,
    value,
    nonce
  }
}

/**
 * Generate the EIP-712 typed data for project updates
 */
export const generateProjectUpdateTypedData = (
  projectId: string,
  walletAddress: string,
  // Optional data that will be signed
  data?: Record<string, any>
) => {
  const domain = getEIP712Domain()
  
  const types = {
    ProjectUpdate: [
      { name: 'projectId', type: 'string' },
      { name: 'walletAddress', type: 'address' },
      { name: 'nonce', type: 'uint256' }
    ]
  }

  const nonce = Date.now()
  
  const value = {
    projectId,
    walletAddress,
    nonce,
    ...data
  }

  return {
    domain,
    types,
    value,
    nonce
  }
}

/**
 * Generate the EIP-712 typed data for submission creation
 */
export const generateSubmissionCreationTypedData = (
  projectId: string,
  freelancerAddress: string,
  prLink: string
) => {
  const domain = getEIP712Domain()
  
  const types = {
    SubmissionCreation: [
      { name: 'projectId', type: 'string' },
      { name: 'freelancerAddress', type: 'address' },
      { name: 'prLink', type: 'string' },
      { name: 'nonce', type: 'uint256' }
    ]
  }

  const nonce = Date.now()
  
  const value = {
    projectId,
    freelancerAddress,
    prLink,
    nonce
  }

  return {
    domain,
    types,
    value,
    nonce
  }
}

/**
 * Generate the EIP-712 typed data for submission approval
 */
export const generateSubmissionApprovalTypedData = (
  projectId: string,
  freelancerAddress: string,
  walletAddress: string
) => {
  const domain = getEIP712Domain()
  
  const types = {
    SubmissionApproval: [
      { name: 'projectId', type: 'string' },
      { name: 'freelancerAddress', type: 'address' },
      { name: 'walletAddress', type: 'address' },
      { name: 'nonce', type: 'uint256' }
    ]
  }

  const nonce = Date.now()
  
  const value = {
    projectId,
    freelancerAddress,
    walletAddress,
    nonce
  }

  return {
    domain,
    types,
    value,
    nonce
  }
}

/**
 * Request a signature from MetaMask for any operation
 */
export const requestSignature = async (
  ethereum: any,
  walletAddress: string,
  typedData: {
    domain: any,
    types: any,
    value: any
  }
) => {
  if (!ethereum) throw new Error('MetaMask is not installed')
  
  const { domain, types, value } = typedData
  // Use the first type key as the primary type (excluding EIP712Domain)
  const primaryType = Object.keys(types).find(key => key !== 'EIP712Domain') || ''
  
  try {
    // Request signature from MetaMask using EIP-712
    const signature = await ethereum.request({
      method: 'eth_signTypedData_v4',
      params: [
        walletAddress, 
        JSON.stringify({ 
          types, 
          domain, 
          primaryType, 
          message: value 
        })
      ],
    })

    return {
      signature,
      ...value,
    }
  } catch (error) {
    console.error('Error signing message:', error)
    throw error
  }
}

/**
 * Request a signature from MetaMask for deleting a submission
 */
export const signDeleteSubmissionRequest = async (
  ethereum: any,
  submissionId: string, 
  projectId: string, 
  walletAddress: string
) => {
  if (!ethereum) throw new Error('MetaMask is not installed')
  
  const { domain, types, value } = generateDeleteSubmissionTypedData(
    submissionId,
    projectId,
    walletAddress
  )
  
  try {
    // Request signature from MetaMask using EIP-712
    const signature = await ethereum.request({
      method: 'eth_signTypedData_v4',
      params: [walletAddress, JSON.stringify({ types, domain, primaryType: 'DeleteSubmission', message: value })],
    })

    return {
      signature,
      submissionId: value.submissionId,
      projectId: value.projectId,
      walletAddress: value.walletAddress,
      nonce: value.nonce
    }
  } catch (error) {
    console.error('Error signing message:', error)
    throw error
  }
} 