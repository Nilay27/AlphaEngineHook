import fetch from 'node-fetch'

/**
 * Tests for the Projects folder endpoints
 * 
 * You can run these tests using Jest (or another test runner).
 * Example:
 *    npx jest tests/projects.test.ts
 */

const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3000'

describe('Projects API Tests', () => {

  let createdProjectId: string | null = null;

  test('GET /api/projects => list projects', async () => {
    const url = `${BASE_URL}/api/projects`
    const res = await fetch(url)
    expect(res.status).toBe(200)
    
    const json = await res.json()
    expect(json.isSuccess).toBe(true)
    expect(Array.isArray(json.data)).toBe(true)
  })

  test('POST /api/projects => create project', async () => {
    const url = `${BASE_URL}/api/projects`
    const payload = {
      projectName: 'New Awesome Project',
      projectDescription: 'Test project via Jest',
      projectOwner: '0xF000000000000000000000000000000000000AAA', // must be 0x + 40 hex chars
      prizeAmount: 500,
      requiredSkills: ['React', 'Node.js']
    }

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })

    expect(res.status).toBeLessThanOrEqual(201) // 200 or 201
    const json = await res.json()
    expect(json.isSuccess).toBe(true)
    expect(json.data).toBeDefined()

    // Save the newly created project’s id for later tests
    createdProjectId = json.data.id
  })

  test('GET /api/projects/[projectId] => get newly created project', async () => {
    // Skip if creation test didn’t set the ID
    if (!createdProjectId) return

    const url = `${BASE_URL}/api/projects/${createdProjectId}`
    const res = await fetch(url)
    expect(res.status).toBe(200)

    const json = await res.json()
    expect(json.isSuccess).toBe(true)
    expect(json.data.id).toBe(createdProjectId)
    expect(json.data.projectName).toBe('New Awesome Project')
  })

  test('PUT /api/projects/[projectId] => update project', async () => {
    if (!createdProjectId) return

    const url = `${BASE_URL}/api/projects/${createdProjectId}`
    const body = {
      walletAddress: '0xF000000000000000000000000000000000000AAA', // same as the owner
      projectName: 'Updated Project Name',
      projectDescription: 'Updated description from test',
      prizeAmount: 750.00,
    }

    const res = await fetch(url, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })

    expect(res.status).toBe(200)

    const json = await res.json()
    expect(json.isSuccess).toBe(true)
    expect(json.data.projectName).toBe('Updated Project Name')
    expect(json.data.prizeAmount).toBe('750.00') // stored as string in DB
  })

  test('GET /api/projects/search => search projects', async () => {
    const query = 'awesome'
    const url = `${BASE_URL}/api/projects/search?q=${encodeURIComponent(query)}`
    const res = await fetch(url)
    expect([200, 204]).toContain(res.status)

    // Some environments might return 204 if no data
    if (res.status === 200) {
      const data = await res.json()
      // The "data" property is an array or object. 
      // If you're returning just raw or something else, update accordingly
      expect(data.message || data.data).toBeDefined()
    }
  })

  test('GET /api/projects/stats => get project stats', async () => {
    const url = `${BASE_URL}/api/projects/stats`
    const res = await fetch(url)
    expect(res.status).toBe(200)

    const data = await res.json()
    // data.data.summary should have totalProjects, etc.
    expect(data.data).toBeDefined()
    expect(data.data.summary).toBeDefined()
  })

  test('DELETE /api/projects/[projectId] => delete project', async () => {
    if (!createdProjectId) return

    const url = `${BASE_URL}/api/projects/${createdProjectId}`
    const body = {
      walletAddress: '0xF000000000000000000000000000000000000AAA'
    }
    const res = await fetch(url, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })

    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.isSuccess).toBe(true)
    expect(json.message).toContain('deleted')
  })
})
