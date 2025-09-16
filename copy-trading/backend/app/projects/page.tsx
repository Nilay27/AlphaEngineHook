/* app/projects/page.tsx */
"use client"

import Link from 'next/link'
import React, { useState, useEffect } from 'react'

export const dynamic = 'force-dynamic'

export default function ProjectsPage() {
  // We keep local states for our filters
  const [status, setStatus] = useState('open')
  const [skill, setSkill] = useState('')
  const [minPrize, setMinPrize] = useState('')
  const [maxPrize, setMaxPrize] = useState('')
  const [projects, setProjects] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // On “Search” or on mount, we can fetch data from /api/projects
  const handleSearch = async () => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams()
      if (status) params.set('status', status)
      if (skill.trim()) params.set('skill', skill.trim())
      if (minPrize.trim()) params.set('minPrize', minPrize.trim())
      if (maxPrize.trim()) params.set('maxPrize', maxPrize.trim())

      const url = `/api/projects?${params.toString()}`
      const res = await fetch(url)
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err?.message || 'Failed to load projects')
      }

      const data = await res.json()
      if (!data.isSuccess) {
        throw new Error(data?.message || 'Failed to load projects')
      }
      setProjects(data.data || [])
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Optionally, run the first fetch automatically on mount
  useEffect(() => {
    handleSearch()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold">All Projects</h1>

      <div className="my-4 flex items-center gap-3">
        <label className="font-semibold">Status:</label>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="border rounded px-2 py-1"
        >
          <option value="">(Any)</option>
          <option value="open">Open</option>
          <option value="closed">Closed</option>
        </select>

        <label className="font-semibold">Skill:</label>
        <input
          type="text"
          className="border rounded px-2 py-1"
          placeholder="e.g. React"
          value={skill}
          onChange={(e) => setSkill(e.target.value)}
        />

        <label className="font-semibold">Min Prize:</label>
        <input
          type="number"
          className="border rounded px-2 py-1"
          value={minPrize}
          onChange={(e) => setMinPrize(e.target.value)}
        />

        <label className="font-semibold">Max Prize:</label>
        <input
          type="number"
          className="border rounded px-2 py-1"
          value={maxPrize}
          onChange={(e) => setMaxPrize(e.target.value)}
        />

        <button
          onClick={handleSearch}
          className="px-4 py-2 bg-blue-600 text-white rounded"
        >
          Search
        </button>
      </div>

      {loading && <p>Loading projects...</p>}
      {error && <p className="text-red-600">Error: {error}</p>}
      {!loading && !error && projects.length === 0 && (
        <p>No projects found.</p>
      )}

      <ul className="mt-4 space-y-3">
        {projects.map((proj) => (
          <li key={proj.id} className="border p-3 rounded">
            <div className="font-bold">{proj.projectName}</div>
            <div className="text-sm text-gray-600">
              Status: {proj.projectStatus}
            </div>
            <p className="text-sm mt-1">{proj.projectDescription}</p>
            <div className="text-xs text-gray-400">
              Prize: {proj.prizeAmount}
            </div>

            <Link href={`/projects/${proj.id}`} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-600">
              View Details
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}