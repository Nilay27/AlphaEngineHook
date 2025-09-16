import { eq } from 'drizzle-orm'
import Image from 'next/image'
import { notFound } from 'next/navigation'

import { db } from '@/db/db'
import { companyTable } from '@/db/schema/company-schema'

interface CompanyProfileProps {
  params: { companyId: string }
}

export default async function CompanyProfilePage({ params }: CompanyProfileProps) {
  const companyId = params.companyId

  const [company] = await db
    .select()
    .from(companyTable)
    .where(eq(companyTable.id, companyId))
    .limit(1)

  if (!company) {
    notFound()
  }

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold">Company Profile</h2>
      <p className="text-gray-500">ID: {companyId}</p>

      <div className="mt-4 space-y-2">
        <div>
          <strong>Name:</strong> {company.companyName}
        </div>
        <div>
          <strong>Wallet Address:</strong> {company.walletAddress}
        </div>
        <div>
          <strong>Short Description:</strong> {company.shortDescription}
        </div>
        <div>
          <strong>Logo URL:</strong> {company.logoUrl ? (
            <Image 
              src={company.logoUrl} 
              alt="Company Logo"
              width={100}
              height={100}
              className="object-contain"
            />
          ) : 'N/A'}
        </div>
        {/* Etc. */}
      </div>
    </div>
  )
}