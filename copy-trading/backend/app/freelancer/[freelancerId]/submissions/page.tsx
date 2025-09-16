/* app/freelancer/[freelancerId]/submissions/page.tsx */

import { and, eq } from 'drizzle-orm'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { db } from '@/db/db'
import { freelancerTable } from '@/db/schema/freelancer-schema'
import { projectSubmissionsTable } from '@/db/schema/project-submissions-schema'
import { projectsTable } from '@/db/schema/projects-schema'

interface FreelancerSubmissionsPageProps {
  params: { freelancerId: string }
  searchParams: { merged?: string }
}

/**
 * Displays all PR submissions by the current freelancer across all projects.
 * Allows filtering merged=1 or merged=0, with color-coded buttons:
 * - Red if isMerged = true OR projectStatus = 'closed'
 * - Green if isMerged = false AND projectStatus = 'open'
 */
export default async function FreelancerSubmissionsPage({
  params,
  searchParams
}: FreelancerSubmissionsPageProps) {
  const { freelancerId } = params
  const mergedFilter = searchParams.merged

  // 1) Find this freelancer so we can read their wallet address
  const [freelancer] = await db
    .select()
    .from(freelancerTable)
    .where(eq(freelancerTable.id, freelancerId))
    .limit(1)

  if (!freelancer) {
    notFound()
  }

  // 2) Build conditions for filtering by isMerged if user used ?merged=1 or ?merged=0
  //    We'll always match "freelancer_address = freelancer.walletAddress"
  const conditions = [eq(projectSubmissionsTable.freelancerAddress, freelancer.walletAddress)]

  if (mergedFilter === '1') {
    conditions.push(eq(projectSubmissionsTable.isMerged, true))
  } else if (mergedFilter === '0') {
    conditions.push(eq(projectSubmissionsTable.isMerged, false))
  }

  // 3) Query all submissions that match the above, left-joined with the project info
  const submissions = await db
    .select({
      submissionId: projectSubmissionsTable.id,
      isMerged: projectSubmissionsTable.isMerged,
      prLink: projectSubmissionsTable.prLink,
      createdAt: projectSubmissionsTable.createdAt,
      projectId: projectsTable.id,
      projectName: projectsTable.projectName,
      projectStatus: projectsTable.projectStatus,
      prizeAmount: projectsTable.prizeAmount,
    })
    .from(projectSubmissionsTable)
    .leftJoin(
      projectsTable,
      eq(projectSubmissionsTable.projectId, projectsTable.id)
    )
    .where(and(...conditions))

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold">My Submissions</h2>
      <p className="text-sm text-gray-600">
        Viewing all PR submissions for <strong>{freelancer.freelancerName}</strong>
      </p>

      {/* Filter Buttons */}
      <div className="mt-4 space-x-2">
        <Link
          href={`/freelancer/${freelancerId}/submissions`}
          className="px-2 py-1 bg-gray-200 text-sm rounded"
        >
          All
        </Link>
        <Link
          href={`/freelancer/${freelancerId}/submissions?merged=1`}
          className="px-2 py-1 bg-red-300 text-sm rounded"
        >
          Only Merged
        </Link>
        <Link
          href={`/freelancer/${freelancerId}/submissions?merged=0`}
          className="px-2 py-1 bg-green-300 text-sm rounded"
        >
          Only Not Merged
        </Link>
      </div>

      {submissions.length === 0 ? (
        <p className="mt-4">No submissions found with this filter.</p>
      ) : (
        <table className="mt-6 w-full border border-gray-200 text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 text-left">Project</th>
              <th className="p-2 text-left">Status</th>
              <th className="p-2 text-left">Prize</th>
              <th className="p-2 text-left">PR Link</th>
              <th className="p-2 text-left">Submitted At</th>
            </tr>
          </thead>
          <tbody>
            {submissions.map((sub) => {
              const projectClosed = sub.projectStatus === 'closed'
              const merged = sub.isMerged

              // We color the button red if merged OR project is closed => "expired"
              // else green
              const buttonColor = (merged || projectClosed)
                ? 'bg-red-500 hover:bg-red-600'
                : 'bg-green-500 hover:bg-green-600'
              const buttonLabel = merged
                ? 'Merged'
                : projectClosed
                ? 'Expired'
                : 'Open'

              return (
                <tr key={sub.submissionId} className="border-b">
                  <td className="p-2">{sub.projectName}</td>
                  <td className="p-2">
                    {sub.projectStatus === 'open' ? (
                      <span className="text-green-600">Open</span>
                    ) : (
                      <span className="text-gray-600">Closed</span>
                    )}
                  </td>
                  <td className="p-2">{sub.prizeAmount?.toString() || '0'} tokens</td>
                  <td className="p-2">
                    <a
                      href={sub.prLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`inline-block px-3 py-1 text-white rounded ${buttonColor}`}
                    >
                      {buttonLabel}
                    </a>
                  </td>
                  <td className="p-2">
                    {/* Basic date formatting (time of submission) */}
                    {new Date(sub.createdAt).toLocaleString()}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      )}
    </div>
  )
}