// File: tests/dashboard.test.ts
// (Create a "tests" folder at your project root or wherever you store tests.)

import fetch from 'node-fetch'

const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3000'

describe('Dashboard API Tests', () => {

  test('GET /api/updates (Freelancer)', async () => {
    const limit = 5
    const role = 'freelancer'
    const url = `${BASE_URL}/api/updates?limit=${limit}&role=${role}`
    const res = await fetch(url)
    expect(res.status).toBe(200)

    const body = await res.json()
    expect(body.isSuccess).toBe(true)
    expect(Array.isArray(body.updates)).toBe(true)
    expect(body.updates.length).toBeLessThanOrEqual(limit)
  })

  test('GET /api/updates (Company)', async () => {
    const url = `${BASE_URL}/api/updates?limit=2&role=company`
    const res = await fetch(url)
    expect(res.status).toBe(200)

    const body = await res.json()
    expect(body.isSuccess).toBe(true)
    expect(Array.isArray(body.updates)).toBe(true)
    expect(body.updates.length).toBeLessThanOrEqual(2)
  })

  test('GET /api/company/dashboard/metrics', async () => {
    const url = `${BASE_URL}/api/company/dashboard/metrics?walletAddress=0xb92749d0769eb9fb1b45f2de0cd51c97aa220f93`
    const res = await fetch(url)
    expect(res.status).toBe(200)

    const body = await res.json()
    expect(body.isSuccess).toBe(true)
    expect(body.data.totalSubmissions).toBeDefined()
    expect(body.data.earnings).toBeDefined()
  })

  test('GET /api/freelancer/dashboard/metrics', async () => {
    const url = `${BASE_URL}/api/freelancer/dashboard/metrics?walletAddress=0xf73b452fa361f3403b20a35c4650f69916c3274a`
    const res = await fetch(url)
    expect(res.status).toBe(200)

    const body = await res.json()
    expect(body.isSuccess).toBe(true)
    expect(body.data.totalSubmissions).toBeDefined()
    expect(body.data.approvedSubmissions).toBeDefined()
  })

  test('GET /api/freelancer/earnings', async () => {
    const url = `${BASE_URL}/api/freelancer/earnings?walletAddress=0xf73b452fa361f3403b20a35c4650f69916c3274a`
    const res = await fetch(url)
    expect(res.status).toBe(200)

    const body = await res.json()
    expect(body.isSuccess).toBe(true)
    expect(body.data.totalEarnings).toBeDefined()
    expect(Array.isArray(body.data.earningsHistory)).toBe(true)
  })
})
