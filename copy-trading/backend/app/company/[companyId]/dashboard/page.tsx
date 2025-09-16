import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { CreateProjectButton } from './_components/create-project-button' // NEW import

interface CompanyDashboardPageProps {
  params: { companyId: string }
}

export default async function CompanyDashboardPage({
  params,
}: CompanyDashboardPageProps) {
  const { companyId } = params

  // Fetch from the new endpoint:
  const apiUrl = `http://localhost:3000/api/company/${companyId}/dashboard`
  const res = await fetch(apiUrl, { cache: 'no-store' })
  if (!res.ok) {
    notFound()
  }

  type ApiResponse = {
    isSuccess: boolean
    data?: {
      companyName: string
      walletAddress: string
      numActive: number
      numPullRequests: number
    }
    message?: string
  }
  const json: ApiResponse = await res.json()

  if (!json.isSuccess || !json.data) {
    notFound()
  }

  const { companyName, walletAddress, numActive, numPullRequests } = json.data

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-2xl font-bold">Hello {companyName}</h2>
      <p className="text-sm text-gray-500">
        Company ID: {companyId} (Wallet: {walletAddress})
      </p>

      <div className="flex gap-8 border p-4 rounded">
        <div>
          <div className="text-2xl font-bold">{numActive}</div>
          <div>Active Projects</div>
        </div>
        <div>
          <div className="text-2xl font-bold">{numPullRequests}</div>
          <div>Pull Requests to Review</div>
        </div>
      </div>

      {/* "View My Projects" link => calls /company/[companyId]/projects (which fetches from /api/...) */}
      <div className="flex gap-4 mt-4">
        <Link
          href={`/company/${companyId}/projects`}
          className="px-3 py-2 bg-blue-600 text-white rounded-md"
        >
          View My Projects
        </Link>

        {/* The new Create Project Button (only if user is "company") */}
        <CreateProjectButton companyId={companyId} />
      </div>

      <div className="border p-4 mt-4 rounded">
        <h3 className="font-semibold">Project Activity Chart</h3>
        <Image
          src="https://docs.github.com/assets/cb-35216/mw-1440/images/help/profile/contributions-graph.webp"
          alt="Project Activity Chart"
          width={600}
          height={300}
          className="w-full"
        />
      </div>
    </div>
  )
}