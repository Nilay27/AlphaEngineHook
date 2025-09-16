"use client"

import Link from 'next/link'
import { useWallet } from '@/components/utilities/wallet-provider'

interface CreateProjectButtonProps {
  companyId: string
}

/**
 * Renders a "Create Project" button ONLY if `userRole` === 'company'.
 * Navigates to /company/[companyId]/projects/new
 */
export function CreateProjectButton({ companyId }: CreateProjectButtonProps) {
  const { userRole } = useWallet()

  // Only show if user is a company
  if (userRole !== 'company') {
    return null
  }

  return (
    <Link
      href={`/company/${companyId}/projects/new`}
      className="px-3 py-2 bg-green-600 text-white rounded-md"
    >
      Create Project
    </Link>
  )
}