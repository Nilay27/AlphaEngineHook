import Link from 'next/link'
import { notFound } from 'next/navigation'

interface CompanySubmissionsPageProps {
  params: { companyId: string }
  searchParams: { merged?: string }
}

export default async function CompanySubmissionsPage({
  params,
  searchParams,
}: CompanySubmissionsPageProps) {
  const { companyId } = params
  const merged = searchParams.merged || ''

  const apiUrl = `http://localhost:3000/api/company/${companyId}/submissions?merged=${merged}`
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
        // ...
      }
      submissions: Array<{
        submissionId: string
        freelancerAddress: string
        prLink: string
        isMerged: boolean
        projectId: string
        createdAt: string
      }>
    }
  }

  const json: ApiResponse = await res.json()
  if (!json.isSuccess || !json.data) {
    notFound()
  }

  const { company, submissions } = json.data

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold">Submissions</h1>
      <p className="text-sm text-gray-500 mb-4">
        Viewing all PR submissions for {company.companyName}. Filter below:
      </p>

      <div className="space-x-4 mb-4">
        <Link
          href={`/company/${companyId}/submissions`}
          className="px-3 py-1 bg-gray-200 text-sm rounded"
        >
          All
        </Link>
        <Link
          href={`/company/${companyId}/dashboard`}
          className="px-3 py-1 bg-gray-200 text-sm rounded"
        >
          Company Dashboard
        </Link>
        <Link
          href={`/company/${companyId}/submissions?merged=1`}
          className="px-3 py-1 bg-red-300 text-sm rounded"
        >
          Only Merged
        </Link>
        <Link
          href={`/company/${companyId}/submissions?merged=0`}
          className="px-3 py-1 bg-green-300 text-sm rounded"
        >
          Only Not Merged
        </Link>
      </div>

      {submissions.length === 0 ? (
        <p>No submissions found.</p>
      ) : (
        <div className="mt-6 overflow-x-auto border rounded">
          <table className="w-full border-collapse text-sm">
            <thead className="bg-gray-100 border-b">
              <tr>
                <th className="py-2 px-3 text-left">Submission ID</th>
                <th className="py-2 px-3 text-left">Freelancer</th>
                <th className="py-2 px-3 text-left">PR Link</th>
                <th className="py-2 px-3 text-left">Merged?</th>
              </tr>
            </thead>
            <tbody>
              {submissions.map(sub => (
                <tr key={sub.submissionId} className="border-b">
                  <td className="py-2 px-3">{sub.submissionId}</td>
                  <td className="py-2 px-3">{sub.freelancerAddress}</td>
                  <td className="py-2 px-3">
                    <a
                      href={sub.prLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 underline"
                    >
                      {sub.prLink}
                    </a>
                  </td>
                  <td className="py-2 px-3">
                    {sub.isMerged ? 'Yes' : 'No'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}