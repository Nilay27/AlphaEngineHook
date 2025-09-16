// This is a simplified version based on shadcn/ui toast component

import { useState, useCallback } from 'react'

type ToastVariant = 'default' | 'destructive' | 'success'

export interface Toast {
  id?: string
  title?: string
  description?: string
  variant?: ToastVariant
}

export interface ToastActionElement {
  altText: string
}

export interface UseToastProps {
  toast: (props: Toast) => void
  dismiss: (id: string) => void
  toasts: Toast[]
}

export const useToast = (): UseToastProps => {
  const [toasts, setToasts] = useState<Toast[]>([])

  const toast = useCallback((props: Toast) => {
    const id = props.id || String(Date.now())
    setToasts((prev) => [...prev, { id, ...props }])
    
    // Optional: Auto-dismiss after 5 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 5000)
    
    return id
  }, [])

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  return {
    toast,
    dismiss,
    toasts
  }
} 