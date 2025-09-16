/**
 * @file tests/api/freelancerDashboard.test.ts
 *
 * @description
 * Example Jest test suite for the /api/freelancer/dashboard/metrics endpoint.
 *
 * Ensure you have a row in `freelancerTable` matching your test walletEns or
 * walletAddress in the DB. Set `USE_MOCKS = false` in your test setup to actually
 * call your real local dev server.
 */

import { describe, test, expect } from '@jest/globals'
import fetch from 'node-fetch'

const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3000'

describe('Freelancer Dashboard Metrics API', () => {

  test('POST /api/freelancer/dashboard/metrics => using walletEns', async () => {
    const url = `${BASE_URL}/api/freelancer/dashboard/metrics`
    const payload = {
      role: 'freelancer',
      walletEns: 'mytestfreelancer',   // or 'mytestfreelancer.eth'
      walletAddress: '0xF222222222222222222222222222222222222222'
    }

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })

    // Expect 200 or 404
    expect([200, 404]).toContain(res.status)

    const data = await res.json()
    if (res.status === 200) {
      // Validate shape
      expect(data).toHaveProperty('totalSubmissions')
      expect(data).toHaveProperty('earnings')
      console.log('Freelancer metrics:', data)
    } else {
      console.warn('Freelancer metrics request failed:', data.message)
    }
  })

  test('GET /api/freelancer/dashboard/metrics => using query params', async () => {
    const url = `${BASE_URL}/api/freelancer/dashboard/metrics?walletEns=mytestfreelancer&walletAddress=0xF222222222222222222222222222222222222222`
    const res = await fetch(url)

    expect([200, 404]).toContain(res.status)
    const data = await res.json()
    if (res.status === 200) {
      expect(data).toHaveProperty('approvedSubmissions')
      expect(data).toHaveProperty('statsUpdatedAt')
      console.log('Freelancer metrics (GET) =>', data)
    } else {
      console.warn('Failed to fetch freelancer metrics (GET):', data.message)
    }
  })
})