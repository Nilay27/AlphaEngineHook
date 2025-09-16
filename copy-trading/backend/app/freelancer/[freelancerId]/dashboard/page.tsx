import Link from 'next/link'
import { notFound } from 'next/navigation'

interface Props {
  params: { freelancerId: string }
}

export default async function FreelancerDashboardPage({ params }: Props) {
  const { freelancerId } = params

  // (Pretend we fetch some data from /api/freelancer/:id/dashboard)
  const res = await fetch(`http://localhost:3000/api/freelancer/${freelancerId}/dashboard`, {
    cache: 'no-store',
  })
  if (!res.ok) {
    notFound()
  }
  const json = await res.json()
  if (!json.isSuccess || !json.data) {
    notFound()
  }

  const { freelancer, stats } = json.data

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">
        Welcome, {freelancer.freelancerName}
      </h1>
      <p className="text-gray-700 mb-2">
        Your Wallet: {freelancer.walletAddress}
      </p>

      <div className="flex gap-4 items-center border p-4 rounded">
        <div>
          <span className="block text-xl font-bold">{stats.openProjectsCount}</span>
          <span className="text-gray-600">Open Projects</span>
        </div>
        <div>
          <span className="block text-xl font-bold">{stats.activeSubmissions}</span>
          <span className="text-gray-600">Active Submissions</span>
        </div>

        {/* "View All Projects" link => client fetch in next page */}
        <div className="mt-4">
        <Link
          href="/projects"
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          View All Projects
        </Link>
      </div>
      <div className="mt-4">
      <Link
        href={`/freelancer/${freelancerId}/submissions`}
        className="mt-4 px-3 py-2 bg-blue-600 text-white rounded inline-block"
      >
        View All Submissions
      </Link>
      </div>
      </div>
    </div>
  )
}