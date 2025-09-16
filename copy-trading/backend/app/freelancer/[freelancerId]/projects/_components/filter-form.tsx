"use client"

/**
 * @file filter-form.tsx
 * 
 * @description
 * A client component for filtering projects by minimum/maximum prize and skills.
 * This component uses client-side navigation to prevent full page reloads,
 * which would cause wallet disconnection and role selection prompts.
 */

import React, { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'

interface FilterFormProps {
  freelancerId: string
  initialMinPrize: string
  initialMaxPrize: string
  initialSkill: string
}

export default function FilterForm({
  freelancerId,
  initialMinPrize,
  initialMaxPrize,
  initialSkill
}: FilterFormProps) {
  // Initialize state with the current search params
  const [minPrize, setMinPrize] = useState(initialMinPrize)
  const [maxPrize, setMaxPrize] = useState(initialMaxPrize)
  const [skill, setSkill] = useState(initialSkill)
  
  const router = useRouter()

  // Handle form submission
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault() // Prevent the default form submission behavior
    
    // Build the query string with only the non-empty values
    const params = new URLSearchParams()
    if (minPrize) params.append('minPrize', minPrize)
    if (maxPrize) params.append('maxPrize', maxPrize)
    if (skill) params.append('skill', skill)
    
    // Navigate to the same page with the new query params
    // This uses Next.js client-side navigation without a full page reload
    const queryString = params.toString()
    const path = `/freelancer/${freelancerId}/projects${queryString ? `?${queryString}` : ''}`
    router.push(path)
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 mt-4">
      <input
        type="number"
        placeholder="Min Prize"
        className="border p-1 rounded"
        value={minPrize}
        onChange={(e) => setMinPrize(e.target.value)}
      />
      <input
        type="number"
        placeholder="Max Prize"
        className="border p-1 rounded"
        value={maxPrize}
        onChange={(e) => setMaxPrize(e.target.value)}
      />
      <input
        type="text"
        placeholder="Skill (e.g. React)"
        className="border p-1 rounded"
        value={skill}
        onChange={(e) => setSkill(e.target.value)}
      />
      <button type="submit" className="bg-blue-500 text-white px-3 py-1 rounded">
        Filter
      </button>
    </form>
  )
} 