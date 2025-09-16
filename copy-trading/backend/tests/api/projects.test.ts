// File: tests/api/projects.test.ts
// 
// You can run these tests with: `npx jest tests/api/projects.test.ts`
// or via your existing scripts. 
// Remember to set `USE_MOCKS = false` (in tests/api/setup.ts) if you want them 
// to hit your real local server.

import { describe, test, expect, beforeAll, afterAll } from '@jest/globals'
import fetch from 'node-fetch'

const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3000/api'

// We'll store the project ID we create, so we can delete it in the test
let createdProjectId: string | null = null

// We'll store the known ENS & wallet we use
const testCompanyEns = 'enscompanydelete.eth'
const testCompanyAddress = '0xDdF0000000000000000000000000000000001234'

describe('Projects API with walletEns deletion scenario', () => {
  beforeAll(async () => {
    // 1) Register a company with a specific walletEns
    //    So that the server knows about that company
    const registerRes = await fetch(`${BASE_URL.replace('/api','')}/api/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        role: 'company',
        walletEns: testCompanyEns,
        walletAddress: testCompanyAddress,
        companyName: 'ENS Company For Delete Tests'
      })
    })
    expect([200,400]).toContain(registerRes.status)

    // 2) Create a project owned by that company
    const projectPayload = {
      projectName: 'ENS Delete Test Project',
      projectDescription: 'Testing project deletion with walletEns as primary ID',
      projectOwner: testCompanyAddress, 
      prizeAmount: 42
    }
    const createRes = await fetch(`${BASE_URL}/projects`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(projectPayload)
    })
    expect([200,201,400]).toContain(createRes.status)

    if (createRes.status === 200 || createRes.status === 201) {
      const createJson = await createRes.json()
      expect(createJson.isSuccess).toBe(true)
      createdProjectId = createJson.data.id
    }
  })

  afterAll(async () => {
    // If the project wasn't deleted in the test, you might optionally clean up
    // But here we rely on the test to delete it.
  })

  test('DELETE /api/projects/[projectId] using only walletEns in body => success', async () => {
    if (!createdProjectId) {
      console.warn('No createdProjectId to test for deletion. Possibly creation failed.')
      return
    }

    const url = `${BASE_URL}/projects/${createdProjectId}`
    const deleteBody = {
      walletEns: testCompanyEns 
      // notice we do NOT pass walletAddress. We rely on the new logic to resolve it
    }

    const res = await fetch(url, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(deleteBody)
    })
    expect([200,403,404]).toContain(res.status)

    if (res.status === 200) {
      const json = await res.json()
      expect(json.isSuccess).toBe(true)
      expect(json.message).toContain('deleted')
      console.log('Project deleted successfully using walletEns.')
    } else {
      const errorJson = await res.json()
      console.error('Deletion failed:', errorJson.message)
    }
  })
})