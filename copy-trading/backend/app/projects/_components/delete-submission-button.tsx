'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Trash2 } from 'lucide-react'
import { signDeleteSubmissionRequest } from '@/lib/ethereum/signature-utils'

// Define a simple toast interface 
interface ToastProps {
  variant?: 'default' | 'destructive' | 'success'
  title?: string
  description?: string
}

interface DeleteSubmissionButtonProps {
  submissionId: string
  projectId: string
  walletAddress: string // connected user's wallet
}

export default function DeleteSubmissionButton({
  submissionId,
  projectId,
  walletAddress,
}: DeleteSubmissionButtonProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  
  // Simple toast function that logs to console
  const toast = (props: ToastProps) => {
    console.log(`Toast: ${props.variant} - ${props.title}`, props.description)
  }

  const handleDelete = async () => {
    if (!window.ethereum) {
      toast({
        variant: 'destructive',
        title: 'MetaMask not found',
        description: 'Please install MetaMask to delete submissions.',
      })
      return
    }
    
    try {
      setIsDeleting(true)
      
      // Step 1: Request user to sign the message via MetaMask
      const { signature, nonce } = await signDeleteSubmissionRequest(
        window.ethereum,
        submissionId,
        projectId,
        walletAddress
      )
      
      // Step 2: Send the signature and data to our API
      const response = await fetch('/api/submissions/delete', {
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
      })
      
      const data = await response.json()
      
      if (data.isSuccess) {
        toast({
          title: 'Success',
          description: 'Submission deleted successfully.',
        })
        // Optionally trigger a refresh or navigation
      } else {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: data.message || 'Failed to delete submission.',
        })
      }
    } catch (error) {
      console.error('Delete submission error:', error)
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to delete submission',
      })
    } finally {
      setIsDeleting(false)
    }
  }
  
  return (
    <Button
      variant="destructive"
      disabled={isDeleting}
      onClick={handleDelete}
      className="flex items-center text-sm py-1 px-3"
    >
      <Trash2 className="h-4 w-4 mr-2" />
      {isDeleting ? 'Deleting...' : 'Delete'}
    </Button>
  )
} 