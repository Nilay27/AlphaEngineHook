import { eq } from 'drizzle-orm'
import Image from 'next/image'
import { notFound } from 'next/navigation'

import { db } from '@/db/db'
import { freelancerTable } from '@/db/schema/freelancer-schema'

interface FreelancerProfileProps {
  params: { freelancerId: string }
}

export default async function FreelancerProfilePage({ params }: FreelancerProfileProps) {
  const freelancerId = params.freelancerId

  const [freelancer] = await db
    .select()
    .from(freelancerTable)
    .where(eq(freelancerTable.id, freelancerId))
    .limit(1)
  if (!freelancer) {
    notFound()
  }

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold">Freelancer Profile</h2>
      <p>
        <strong>Name:</strong> {freelancer.freelancerName}
      </p>
      <p>
        <strong>Wallet:</strong> {freelancer.walletAddress}
      </p>
      <p>
        <strong>Skills:</strong> {freelancer.skills}
      </p>
      {freelancer.profilePicUrl ? (
        <Image 
          src={freelancer.profilePicUrl} 
          alt="Profile Picture"
          width={150}
          height={150}
          className="rounded-full object-cover"
        />
      ) : null}
    </div>
  )
}