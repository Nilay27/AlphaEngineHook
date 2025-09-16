"use client"

import React, { useState } from 'react'

import { useRouter, useParams } from 'next/navigation'


export default function CreateProjectPage() {
  const router = useRouter()
  const { companyId } = useParams() // This grabs [companyId] from the URL

  const [projectName, setProjectName] = useState('')
  const [projectDescription, setProjectDescription] = useState('')
  const [prizeAmount, setPrizeAmount] = useState('')
  const [requiredSkills, setRequiredSkills] = useState('')
  const [completionSkills, setCompletionSkills] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    

    try {
      const numericPrize = parseFloat(prizeAmount || '0')
      const payload = {
        projectName,
        projectDescription,
        prizeAmount: numericPrize,
        requiredSkills,
        completionSkills,
      }

      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.message || 'Failed to create project')
      }

      alert('Project created!')
      // Optionally: go back to /company/<companyId>/projects
      router.push(`/company/${companyId}/projects`)
    } catch (err: any) {
      alert(err.message)
    }
  }

  function handleCancel() {
    router.push(`/company/${companyId}/dashboard`)
  }

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold">Create Project</h2>
      <p className="text-gray-500 mb-2">Company ID: {companyId}</p>

      <form onSubmit={handleSubmit} className="space-y-3 max-w-md mt-4">
        <div>
          <label className="block font-semibold">Project Name</label>
          <input
            type="text"
            className="border w-full p-2 rounded"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block font-semibold">Description</label>
          <textarea
            className="border w-full p-2 rounded"
            rows={3}
            value={projectDescription}
            onChange={(e) => setProjectDescription(e.target.value)}
          />
        </div>

        <div>
          <label className="block font-semibold">Prize Amount</label>
          <input
            type="number"
            className="border w-full p-2 rounded"
            value={prizeAmount}
            onChange={(e) => setPrizeAmount(e.target.value)}
            placeholder="100"
          />
        </div>

        <div>
          <label className="block font-semibold">Required Skills</label>
          <input
            type="text"
            className="border w-full p-2 rounded"
            value={requiredSkills}
            onChange={(e) => setRequiredSkills(e.target.value)}
            placeholder="React,Solidity"
          />
        </div>

        <div>
          <label className="block font-semibold">Completion Skills</label>
          <input
            type="text"
            className="border w-full p-2 rounded"
            value={completionSkills}
            onChange={(e) => setCompletionSkills(e.target.value)}
            placeholder="UI/UX"
          />
        </div>

        <div className="flex gap-2 mt-4">
          <button
            type="button"
            onClick={handleCancel}
            className="px-4 py-2 bg-gray-300 rounded"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white rounded"
          >
            Publish
          </button>
        </div>
      </form>
    </div>
  )
}