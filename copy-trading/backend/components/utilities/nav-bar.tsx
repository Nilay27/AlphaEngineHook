"use client"
import React from 'react'

export function NavBar() {
  return (
    <nav className="w-full px-4 py-2 border-b">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <div className="font-semibold">AlphaEngine (Backend Admin)</div>
        <div className="text-sm opacity-70">Server Tools</div>
      </div>
    </nav>
  )
}