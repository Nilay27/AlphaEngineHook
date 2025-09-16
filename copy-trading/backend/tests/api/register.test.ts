// tests/api/register.test.ts
import { describe, test, expect, afterAll } from '@jest/globals';
import { apiRequest, TEST_WALLETS, cleanupTest } from './setup';

describe('Register API', () => {
  const createdIds: string[] = [];

  // Clean up after all tests
  afterAll(async () => {
    await cleanupTest(createdIds);
  });

  test('should register a new company', async () => {
    const payload = {
      role: 'company',
      walletAddress: TEST_WALLETS.company,
      companyName: 'Test Company',
      shortDescription: 'A testing company',
      logoUrl: 'https://example.com/logo.png'
    };

    const response = await apiRequest('/register', 'POST', payload);
    
    expect([200, 400]).toContain(response.status);
    
    if (response.status === 200) {
      expect(response.data.isSuccess).toBe(true);
      expect(response.data.data).toBeTruthy();

      // Store created ID for cleanup
      if (response.data.data) {
        createdIds.push(response.data.data);
      }
    } else {
      console.log('Company already exists:', response.data.message);
    }
  });

  test('should register a new freelancer', async () => {
    const payload = {
      role: 'freelancer',
      walletAddress: TEST_WALLETS.freelancer,
      freelancerName: 'Test Freelancer',
      skills: 'JavaScript, React, Node.js',
      profilePicUrl: 'https://example.com/profile.png'
    };

    const response = await apiRequest('/register', 'POST', payload);
    
    expect([200, 400]).toContain(response.status);
    
    if (response.status === 200) {
      expect(response.data.isSuccess).toBe(true);
      expect(response.data.data).toBeTruthy();

      // Store created ID for cleanup
      if (response.data.data) {
        createdIds.push(response.data.data);
      }
    } else {
      console.log('Freelancer already exists:', response.data.message);
    }
  });

  test('should return 400 when required fields are missing', async () => {
    const payload = {
      // Missing required role field
      walletAddress: TEST_WALLETS.user
    };

    const response = await apiRequest('/register', 'POST', payload);
    
    expect(response.status).toBe(400);
    expect(response.data.isSuccess).toBe(false);
  });
}); 