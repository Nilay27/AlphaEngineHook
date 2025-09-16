/**
 * @file tests/api/companyDashboard.test.ts
 *
 * @description
 * Example Jest test suite that tries hitting `/api/company/dashboard/metrics`
 * using real DB. Adjust the `BASE_URL` as needed and ensure your DB
 * has a "company" row with the specified walletEns or walletAddress.
 *
 * You can run: npx jest tests/api/companyDashboard.test.ts
 */

import { describe, test, expect } from '@jest/globals'
import fetch from 'node-fetch'

const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3000'

describe('Company Dashboard Metrics API', () => {

  test('POST /api/company/dashboard/metrics => using walletEns', async () => {
    const url = `${BASE_URL}/api/company/dashboard/metrics`
    const payload = {
      role: 'company',
      walletEns: 'consentsam',         // or 'consentsam.eth' or whatever matches your DB
      walletAddress: '0xf73b452fa361f3403b20a35c4650f69916c3275a', // fallback
      timeframe: '24h'
    }

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })

    // Expect 200 if the DB record is found; or 404 if not found
    expect([200, 404]).toContain(res.status)

    const data = await res.json()
    if (res.status === 200) {
      // Check shape
      expect(data).toHaveProperty('totalSubmissions')
      expect(data).toHaveProperty('pullRequests')
      console.log('Company metrics:', data)
    } else {
      console.warn('Company metrics request failed:', data.message)
    }
  })

  test('GET /api/company/dashboard/metrics => using query params', async () => {
    const url = `${BASE_URL}/api/company/dashboard/metrics?walletEns=consentsam&walletAddress=0xf73b452fa361f3403b20a35c4650f69916c3275a&timeframe=7d`
    const res = await fetch(url)
    expect([200, 404]).toContain(res.status)

    const data = await res.json()
    if (res.status === 200) {
      expect(data).toHaveProperty('totalProjects')
      expect(data).toHaveProperty('statsUpdatedAt')
      console.log('Company metrics (GET) =>', data)
    } else {
      console.warn('Failed to fetch (GET) company metrics:', data.message)
    }
  })
})