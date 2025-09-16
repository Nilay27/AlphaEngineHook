// tests/api/dashboard.test.ts
import fetch from 'node-fetch'
import { describe, test, expect } from '@jest/globals'

const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3000'

describe('Freelancer Dashboard Metrics', () => {
  test('should return correct metrics', async () => {
    const payload = {
      role: 'freelancer',
      walletEns: 'testfreelancer-ens',
      walletAddress: '0xsomeWallet'
    }

    const res = await fetch(`${BASE_URL}/api/freelancer/dashboard/metrics`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.totalSubmissions).not.toBeUndefined()
    // etc.
  })
})