"use client"

import React, { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useWallet } from '@/components/utilities/wallet-provider'

// Component with useSearchParams
function RegisterForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { walletAddress } = useWallet()

  // The role is read from ?role=company or ?role=freelancer
  const role = searchParams.get('role') as 'company' | 'freelancer' | null

  // We'll store form fields differently for company vs freelancer
  const [companyName, setCompanyName] = useState('')
  const [shortDescription, setShortDescription] = useState('')
  const [logoUrl, setLogoUrl] = useState('')

  const [freelancerName, setFreelancerName] = useState('')
  const [skills, setSkills] = useState('')
  const [profilePicUrl, setProfilePicUrl] = useState('')

  // We also need a local "loading existing profile" state, in case they are already registered
  const [loading, setLoading] = useState<boolean>(true)

  useEffect(() => {
    if (!walletAddress) {
      // If the wallet isn't connected, force them to do that first
      setLoading(false)
      return
    }
    if (!role) {
      // If no role param, we can do a redirect or show an error
      setLoading(false)
      return
    }

    // 1) Check if they are already in the DB for that role
    const checkProfile = async () => {
      try {
        const resp = await fetch(`/api/userProfile?wallet=${walletAddress}&role=${role}`)
        const data = await resp.json()
        if (!data.isSuccess) {
          // If the check fails for some reason, just stop
          console.error('Profile check failed', data.message)
          setLoading(false)
          return
        }
        if (data.data) {
          // Already have a profile => skip the form => go to the dashboard
          const recordId = data.data.id
          if (role === 'company') {
            router.push(`/company/${recordId}/dashboard`)
          } else {
            router.push(`/freelancer/${recordId}/dashboard`)
          }
          return
        }
        // Not found => show the form
        setLoading(false)
      } catch (err) {
        console.error('Error checking user profile:', err)
        setLoading(false)
      }
    }

    checkProfile()
  }, [walletAddress, role, router])

  // 2) If loading, show a spinner or message
  if (loading) {
    return <div className="p-4">Checking existing profile...</div>
  }

  // 3) If no role or no wallet, show a quick message
  if (!walletAddress) {
    return <div className="p-4 text-red-500">Please connect your wallet first.</div>
  }
  if (!role) {
    return <div className="p-4 text-red-500">No role specified in URL.</div>
  }

  // 4) We define a handleSubmit that sends the correct fields for company or freelancer
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Prepare request body for register
    const body: any = {
      walletAddress,
      role,
    }
    if (role === 'company') {
      body.companyName = companyName
      body.shortDescription = shortDescription
      body.logoUrl = logoUrl
    } else {
      body.freelancerName = freelancerName
      body.skills = skills
      body.profilePicUrl = profilePicUrl
    }

    try {
      const resp = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await resp.json()
      if (!resp.ok || !data.isSuccess) {
        alert('Registration failed: ' + (data.message || 'Unknown error'))
        return
      }

      // data.data = newly created row's ID
      const newId = data.data
      if (role === 'company') {
        router.push(`/company/${newId}/dashboard`)
      } else {
        router.push(`/freelancer/${newId}/dashboard`)
      }
    } catch (err: any) {
      alert(err.message)
    }
  }

  // 5) Render the correct form
  return (
    <div className="p-4 max-w-md mx-auto border rounded shadow bg-white">
      {role === 'company' ? (
        <>
          <h2 className="text-xl font-bold mb-4">Register as Company</h2>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-sm font-semibold">Company Name</label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="border w-full rounded p-2"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold">
                Short Description
              </label>
              <textarea
                value={shortDescription}
                onChange={(e) => setShortDescription(e.target.value)}
                className="border w-full rounded p-2"
                rows={2}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold">Logo URL</label>
              <input
                type="text"
                value={logoUrl}
                onChange={(e) => setLogoUrl(e.target.value)}
                className="border w-full rounded p-2"
                placeholder="http://..."
              />
            </div>

            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded"
            >
              Register
            </button>
          </form>
        </>
      ) : (
        <>
          <h2 className="text-xl font-bold mb-4">Register as Freelancer</h2>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-sm font-semibold">
                Freelancer Name
              </label>
              <input
                type="text"
                value={freelancerName}
                onChange={(e) => setFreelancerName(e.target.value)}
                className="border w-full rounded p-2"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold">
                Skills (comma-separated)
              </label>
              <input
                type="text"
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
                className="border w-full rounded p-2"
                placeholder="React, Next.js, UI/UX, etc."
              />
            </div>

            <div>
              <label className="block text-sm font-semibold">
                Profile Pic URL
              </label>
              <input
                type="text"
                value={profilePicUrl}
                onChange={(e) => setProfilePicUrl(e.target.value)}
                className="border w-full rounded p-2"
                placeholder="http://..."
              />
            </div>

            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded"
            >
              Register
            </button>
          </form>
        </>
      )}
    </div>
  )
}

// Main page component with Suspense boundary
export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="p-4">Loading registration form...</div>}>
      <RegisterForm />
    </Suspense>
  )
}