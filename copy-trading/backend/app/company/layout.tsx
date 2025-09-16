import React from 'react'

/**
 * @file layout.tsx (Company Layout)
 *
 * This layout wraps all pages under /company with a header that says "Company Dashboard"
 */
export default function CompanyLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <section className="min-h-screen w-full">
      <div className="border-b p-4 flex justify-between">
        <h2 className="text-xl font-bold">Company Dashboard</h2>
      </div>
      {children}
    </section>
  )
}