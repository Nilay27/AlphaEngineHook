"use client"

import React from 'react'

import { Button } from '@/components/ui/button'

interface RoleSelectionModalProps {
  onSelect: (role: 'company' | 'freelancer') => void
  onClose: () => void
}

/**
 * A simple full-screen overlay that prompts the user to pick
 * either "Post Job (Company)" or "Mint Money (Freelancer)."
 */
export default function RoleSelectionModal({
  onSelect,
  onClose,
}: RoleSelectionModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      {/* White box */}
      <div className="bg-white p-6 rounded shadow-md w-[300px] space-y-4 relative">
        <h2 className="text-lg font-bold text-center">Choose Your Role</h2>
        <p className="text-sm text-gray-600 text-center">
          Please select how you want to use this platform:
        </p>

        <div className="flex flex-col gap-2">
          <Button variant="default" onClick={() => onSelect('company')}>
            Post Job (I am a Company)
          </Button>
          <Button variant="default" onClick={() => onSelect('freelancer')}>
            Mint Money (I am a Freelancer)
          </Button>
        </div>

        <button
          onClick={onClose}
          className="absolute top-2 right-3 text-sm text-gray-500 hover:text-gray-700"
        >
          X
        </button>
      </div>
    </div>
  )
}