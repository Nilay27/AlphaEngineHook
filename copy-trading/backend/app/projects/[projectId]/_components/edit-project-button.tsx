// File: app/projects/[projectId]/_components/edit-project-button.tsx
"use client"

import React from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'

interface EditProjectButtonProps {
  projectId: string
  projectOwner: string
  projectStatus: string
}

export function EditProjectButton({
  projectId,
  projectOwner,
  projectStatus,
}: EditProjectButtonProps) {
  const router = useRouter()

  // No more check if user is walletOwner. 
  // If you want to require the user to be the "company", do it with OCID server checks.

  if (projectStatus !== 'open') {
    return null
  }

  const handleClick = () => {
    router.push(`/company/edit/${projectId}`)
  }

  return (
    <Button onClick={handleClick} variant="default">
      Edit Project
    </Button>
  )
}