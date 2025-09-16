import { notFound } from 'next/navigation'
import Image from 'next/image'

import { EditProjectButton } from './_components/edit-project-button'
import SubmissionList from './_components/submission-list'
import SubmitPrForm from './_components/submit-pr-form'

/**
 * @file page.tsx
 * This is the detail page for a single project at /projects/[projectId].
 * It fetches from /api/projects/[projectId] to get:
 *   - project data
 *   - the company's name that posted it
 * Then it displays:
 *   - Project name
 *   - Status
 *   - Company name
 *   - Prize, required skills, etc.
 *   - An Edit button if the connected user is the owner
 *   - The list of submissions (component)
 *   - A form to submit new PR if the user is not the owner
 */

export default async function ProjectDetailPage({
  params,
}: {
  params: { projectId: string }
}) {
  const { projectId } = params

  // 1) Fetch from the new endpoint
  const apiUrl = `http://localhost:3000/api/projects/${projectId}`
  const res = await fetch(apiUrl, { cache: 'no-store' })
  if (!res.ok) {
    notFound()
  }

  // 2) Parse response
  type ApiResponse = {
    isSuccess: boolean
    data?: {
      id: string
      projectName: string
      projectDescription: string | null
      projectStatus: string
      prizeAmount: string | null
      projectOwner: string
      requiredSkills: string | null
      completionSkills: string | null
      projectRepo: string | null
      companyName: string | null
      companyId: string | null
      // ...
    }
  }
  const json: ApiResponse = await res.json()
  if (!json.isSuccess || !json.data) {
    notFound()
  }

  const project = json.data
  // We'll load submissions separately from a client component (or you could do it server side).
  // The submission-list.tsx does a client fetch to /api/submissions or /api/projects/.../submissions.

  // 3) Render
  return (
    <main className="p-4 space-y-6">
      {/* Project Name */}
      <h1 className="text-2xl font-bold">
        {project.projectName || 'Untitled Project'}
      </h1>
      {/* Show project status + posted by */}
      <p className="text-gray-600">
        Status: <strong>{project.projectStatus}</strong> | Posted by:{' '}
        <strong>{project.companyName ?? '(No Company Found)'}</strong>
      </p>

      {/* Show description if any */}
      {project.projectDescription && (
        <p className="text-sm text-gray-700 mt-2">{project.projectDescription}</p>
      )}

      {/* Show prize + required skills */}
      <div className="border p-3 rounded space-y-1 text-sm">
        <div>
          <strong>Prize:</strong> {project.prizeAmount || '0'} tokens
        </div>
        <div>
          <strong>Required Skills:</strong>{' '}
          {project.requiredSkills || '(None)'}
        </div>
        <div>
          <strong>Repo Link:</strong> {project.projectRepo || '(None)'}
        </div>
      </div>

      {/* The edit button if the user is the owner. 
          We handle that check in the client with a dynamic check of wallet vs projectOwner. */}
      <EditProjectButton
        projectId={project.id}
        projectOwner={project.projectOwner}
        projectStatus={project.projectStatus}
      />

      {/* The PR Submission Form (only if user is NOT the owner + project is open) */}
      <SubmitPrForm
        projectId={project.id}
        projectOwner={project.projectOwner}
        projectStatus={project.projectStatus}
      />

      {/* The list of submissions */}
      <SubmissionList
        projectId={project.id}
        projectOwner={project.projectOwner}
        projectStatus={project.projectStatus}
      />
    </main>
  )
}