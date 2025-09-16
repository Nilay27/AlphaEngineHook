import Link from 'next/link'
import { notFound } from 'next/navigation'

interface CompanyProjectsPageProps {
  params: { companyId: string }
  searchParams: { status?: string }
}

export default async function CompanyProjectsPage({
  params,
  searchParams,
}: CompanyProjectsPageProps) {
  const { companyId } = params
  const status = searchParams.status || '0'  // 0 => all

  const apiUrl = `http://localhost:3000/api/company/${companyId}/projects?status=${status}`
  const res = await fetch(apiUrl, { cache: 'no-store' })
  if (!res.ok) {
    notFound()
  }
  type ApiResponse = {
    isSuccess: boolean
    data?: {
      company: {
        id: string
        companyName: string
        walletAddress: string
      }
      projects: Array<{
        id: string
        projectName: string
        projectStatus: string
        projectDescription: string | null
      }>
    }
  }
  const json: ApiResponse = await res.json()

  if (!json.isSuccess || !json.data) {
    notFound()
  }

  const { company, projects } = json.data

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold">All Projects for {company.companyName}</h2>

      {/* Filter Links */}
      <div className="my-3 space-x-3">
        <Link href={`/company/${companyId}/projects?status=0`}>All</Link>
        <Link href={`/company/${companyId}/projects?status=1`}>Open</Link>
        <Link href={`/company/${companyId}/projects?status=2`}>Closed</Link>
      </div>

      {/* Go back link */}
      <div className="mt-2">
        <Link
          href={`/company/${companyId}/dashboard`}
          className="text-blue-600 underline hover:text-blue-800"
        >
          Go back to Company Dashboard
        </Link>
      </div>

      {projects.length === 0 ? (
        <p>No projects found.</p>
      ) : (
        <ul className="mt-4 space-y-2">
          {projects.map((proj) => (
            <li key={proj.id} className="border p-2 rounded">
              <div className="font-semibold">{proj.projectName}</div>
              <div className="text-sm text-gray-600">
                Status: {proj.projectStatus}
              </div>
              {proj.projectDescription && (
                <div className="text-sm text-gray-700 mt-1">
                  {proj.projectDescription}
                </div>
              )}

              <div className="mt-2">
                <Link
                  href={`/projects/${proj.id}`}
                  className="text-blue-600 underline hover:text-blue-800"
                >
                  View Details
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}