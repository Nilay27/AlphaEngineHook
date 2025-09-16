/* app/freelancer/layout.tsx */
import React from 'react'

export default function FreelancerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <section className="min-h-screen w-full">
      <div className="border-b p-4">
        <h2 className="text-xl font-bold">Freelancer Panel</h2>
      </div>
      {children}
    </section>
  )
}