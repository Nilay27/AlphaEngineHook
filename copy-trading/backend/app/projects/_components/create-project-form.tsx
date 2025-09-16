"use client"

/**
 * @file create-project-form.tsx
 *
 * @description
 * A client component for rendering a form that the "company" (project owner) uses
 * to create a project. This form now includes:
 * - requiredSkills: Skills a student must have to submit a PR
 * - completionSkills: Skills a student will earn upon project completion
 *
 * Key features:
 * - On submit, calls an API endpoint or server action with these fields
 * - Accepts `walletAddress` from a global wallet context (Metamask)
 *
 * @dependencies
 * - React, useState for local form state
 * - useWallet from your "wallet-provider"
 * - Next.js useRouter for refreshing the page after creation
 */

import React, { useState, FormEvent } from 'react'

import { useRouter } from 'next/navigation'

import { Button } from '@/components/ui/button'
import { useWallet } from '@/components/utilities/wallet-provider'

/**
 * Optional toggle to show/hide the creation form. 
 * Exports a single component to create a project. 
 */
export function ProjectCreationToggle() {
  const [showForm, setShowForm] = useState(false)

  // Basic project fields
  const [projectName, setProjectName] = useState('')
  const [projectDescription, setProjectDescription] = useState('')
  const [prizeAmount, setPrizeAmount] = useState('')
  const [projectRepo, setProjectRepo] = useState('')

  /**
   * @field requiredSkills 
   * Comma-separated skills the student must have
   */
  const [requiredSkills, setRequiredSkills] = useState('')

  /**
   * @field completionSkills 
   * Comma-separated skills the student gains upon completion
   */
  const [completionSkills, setCompletionSkills] = useState('')

  const [deadline, setDeadline] = useState('')

  const { walletAddress } = useWallet()
  const router = useRouter()

  /**
   * @function handleToggleForm
   * toggles whether the creation form is shown
   */
  const handleToggleForm = () => setShowForm(!showForm)

  /**
   * Converts a date string from the date input (YYYY-MM-DD) to ISO format with time
   * @param dateStr Date string from input
   * @returns ISO 8601 formatted string
   */
  const formatDateToISO = (dateStr: string): string => {
    if (!dateStr) return ''
    // Add time component (noon UTC) and convert to ISO string
    const date = new Date(`${dateStr}T12:00:00Z`)
    return date.toISOString()
  }

  /**
   * @function handleSubmit
   * Submits the project creation to your chosen endpoint. 
   */
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!walletAddress) {
      alert('Please connect your Metamask wallet before creating a project.')
      return
    }

    const numericPrize = parseFloat(prizeAmount || '0')
    if (numericPrize < 0) {
      alert('Prize amount cannot be negative.')
      return
    }

    const payload = {
      walletAddress,
      projectName,
      projectDescription,
      projectRepo,
      prizeAmount: numericPrize,
      requiredSkills,
      completionSkills,
      deadline: deadline ? formatDateToISO(deadline) : undefined,
    }

    try {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await response.json()

      if (!response.ok) {
        alert(`Error creating project: ${data.message}`)
        return
      }

      // success
      alert('Project created successfully.')
      router.refresh()

      // reset form
      setShowForm(false)
      setProjectName('')
      setProjectDescription('')
      setPrizeAmount('')
      setProjectRepo('')
      setRequiredSkills('')
      setCompletionSkills('')
      setDeadline('')
    } catch (error) {
      console.error('Error creating project:', error)
      alert('Error occurred while creating the project.')
    }
  }

  return (
    <div className="space-y-4">
      <Button variant="default" onClick={handleToggleForm}>
        {showForm ? 'Cancel' : 'Create Project'}
      </Button>

      {showForm && (
        <form onSubmit={handleSubmit} className="border p-4 rounded space-y-4">
          <h3 className="text-lg font-semibold">Create a new project</h3>

          {/* Project Name */}
          <div>
            <label className="block text-sm font-medium mb-1">Project Name</label>
            <input
              type="text"
              className="w-full border p-2 rounded"
              required
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              placeholder="e.g. 'Build a Landing Page'"
            />
          </div>

          {/* Project Description */}
          <div>
            <label className="block text-sm font-medium mb-1">Project Description</label>
            <textarea
              className="w-full border p-2 rounded"
              rows={3}
              value={projectDescription}
              onChange={(e) => setProjectDescription(e.target.value)}
              placeholder="Brief description of the tasks..."
            ></textarea>
          </div>

          {/* Project Repo */}
          <div>
            <label className="block text-sm font-medium mb-1">Project Repo</label>
            <input
              type="text"
              className="w-full border p-2 rounded"
              value={projectRepo}
              onChange={(e) => setProjectRepo(e.target.value)}
              placeholder="github.com/org/repo"
            />
          </div>

          {/* Deadline */}
          <div>
            <label className="block text-sm font-medium mb-1">Deadline (optional)</label>
            <input
              type="date"
              className="w-full border p-2 rounded"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              placeholder="Deadline for project completion"
            />
          </div>

          {/* Prize Amount */}
          <div>
            <label className="block text-sm font-medium mb-1">Prize Amount</label>
            <input
              type="number"
              step="0.01"
              className="w-full border p-2 rounded"
              value={prizeAmount}
              onChange={(e) => setPrizeAmount(e.target.value)}
              placeholder="100"
            />
          </div>

          {/* Required Skills */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Required Skills <span className="text-xs text-gray-500">(comma-separated)</span>
            </label>
            <input
              type="text"
              className="w-full border p-2 rounded"
              value={requiredSkills}
              onChange={(e) => setRequiredSkills(e.target.value)}
              placeholder="e.g. React, Typescript"
            />
          </div>

          {/* Completion Skills */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Completion Skills <span className="text-xs text-gray-500">(comma-separated)</span>
            </label>
            <input
              type="text"
              className="w-full border p-2 rounded"
              value={completionSkills}
              onChange={(e) => setCompletionSkills(e.target.value)}
              placeholder="e.g. UI/UX, Next.js"
            />
          </div>

          <Button type="submit" variant="default">
            Submit
          </Button>
        </form>
      )}
    </div>
  )
}
