// File: app/projects/[projectId]/_components/submission-list.tsx
"use client"

import React, { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'

interface SubmissionListProps {
  projectId: string
  projectOwner: string
  projectStatus: string
}

export default function SubmissionList({
  projectId,
  projectOwner,
  projectStatus,
}: SubmissionListProps) {
  const [submissions, setSubmissions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [approveLoading, setApproveLoading] = useState<string | null>(null)
  const router = useRouter()

  // automatically fetch submissions
  useEffect(() => {
    async function fetchSubmissions() {
      try {
        const res = await fetch(`/api/projects/${projectId}/submissions`, {
          cache: 'no-store',
        })
        if (!res.ok) {
          throw new Error('Failed to load submissions')
        }
        const json = await res.json()
        if (json.isSuccess && Array.isArray(json.data)) {
          setSubmissions(json.data)
        }
      } catch (err) {
        console.error('Error loading submissions:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchSubmissions()
  }, [projectId])

  async function handleApprove(freelancerAddress: string) {
    try {
      setApproveLoading(freelancerAddress)
      const resp = await fetch('/api/projects/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId,
          freelancerAddress,
          // used to be "walletAddress" for metamask. 
          // You can add logic for who is truly the “owner” by decoding the ID token on the server.
        }),
      })
      if (!resp.ok) {
        const err = await resp.json()
        throw new Error(err.message || 'Failed to approve submission')
      }
      alert('Submission approved.')
      router.refresh()
    } catch (error: any) {
      alert('Error: ' + error.message)
      console.error('Approve error:', error)
    } finally {
      setApproveLoading(null)
    }
  }

  if (loading) {
    return <div className="text-sm text-gray-500">Loading submissions...</div>
  }

  if (submissions.length === 0) {
    return <div className="text-sm text-gray-500">No submissions yet.</div>
  }

  return (
    <div className="space-y-2">
      <h3 className="font-semibold">Submissions</h3>
      <ul className="space-y-1">
        {submissions.map((sub) => (
          <li
            key={sub.id}
            className="border p-2 rounded flex items-center justify-between"
          >
            <div>
              <div className="text-sm text-blue-600">
                {sub.freelancerAddress}
              </div>
              <div className="text-xs text-gray-500 break-all">
                <a
                  href={sub.prLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-blue-700"
                >
                  {sub.prLink}
                </a>
              </div>
            </div>

            {/* If you want to keep an Approve button, we show it unconditionally. 
                Or add your own “Is user = projectOwner?” check using OCID in the future. */}
            {projectStatus === 'open' && (
              <Button
                onClick={() => handleApprove(sub.freelancerAddress)}
                disabled={approveLoading === sub.freelancerAddress}
              >
                {approveLoading === sub.freelancerAddress
                  ? 'Approving...'
                  : 'Approve'}
              </Button>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}