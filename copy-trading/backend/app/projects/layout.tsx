/**
 * @description
 * This layout file applies a specific UI wrapper for all /projects routes.
 * It might include a sidebar or contextual navigation for project-related pages.
 *
 * Key features (future):
 * - Could display a "Projects" navigation menu
 * - Could display high-level project statistics
 *
 * @notes
 * - Currently a placeholder to establish folder structure.
 * - Must not conflict with the root layout in app/layout.tsx.
 */

import React from 'react'

export default function ProjectsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <section className="min-h-screen w-full">
      {/* ProjectsLayout Placeholder */}
      {children}
    </section>
  )
}
