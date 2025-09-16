/**********************************************************************
 * File: /Users/sattu/Library/CloudStorage/Dropbox/blockchain/teachnook/api_for_fe/tests/api/userProfile.test.ts
 **********************************************************************/

import fetch from 'node-fetch';
import { describe, test, expect, beforeAll, afterAll } from '@jest/globals';
import { apiRequest, TEST_WALLETS, cleanupTest } from './setup';

const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3000';

// We will store any created user(s) so we can delete them at the end
const createdProfiles: Array<{ role: string; walletAddress: string }> = [];

describe('UserProfile API tests (Update & Delete flow)', () => {
  // This ensures we have a test freelancer & test company to delete
  beforeAll(async () => {
    // 1) Create a test freelancer
    const fPayload = {
      role: 'freelancer',
      walletAddress: TEST_WALLETS.freelancer,
      walletEns: 'testfreelancer-ens',
      freelancerName: 'FreelancerToDelete',
      skills: 'nodejs, jest'
    };
    const fRes = await fetch(`${BASE_URL}/api/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(fPayload),
    });
    if (fRes.status === 200) {
      createdProfiles.push({ role: 'freelancer', walletAddress: TEST_WALLETS.freelancer });
    }

    // 2) Create a test company
    const cPayload = {
      role: 'company',
      walletAddress: TEST_WALLETS.company,
      walletEns: 'testcompany-ens',
      companyName: 'CompanyToDelete'
    };
    const cRes = await fetch(`${BASE_URL}/api/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(cPayload),
    });
    if (cRes.status === 200) {
      createdProfiles.push({ role: 'company', walletAddress: TEST_WALLETS.company });
    }
  });

  afterAll(async () => {
    // If anything didn't get removed properly, try to remove them here
    // Or rely on the tests below which do the actual deletion
  });

  // We can add or keep existing "PUT" tests here ...
  
  test('DELETE /api/userProfile => remove a freelancer properly', async () => {
    // Ensure we have a known freelancer from the "beforeAll" step
    const fl = createdProfiles.find(p => p.role === 'freelancer');
    if (!fl) {
      console.warn('No freelancer to delete. Skipping test.');
      return;
    }

    const delPayload = {
      role: 'freelancer',
      walletAddress: fl.walletAddress, 
      // we can pass walletEns if we want, but not strictly required in the new logic
    };

    const resp = await fetch(`${BASE_URL}/api/userProfile`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(delPayload),
    });

    expect(resp.status).toBe(200);
    const json = await resp.json();
    expect(json.isSuccess).toBe(true);
    expect(json.message.toLowerCase()).toContain('freelancer profile deleted successfully');
    expect(json.data.walletAddress.toLowerCase()).toBe(fl.walletAddress.toLowerCase());
    // optional: check that it also returns the id or walletEns if we want
    // e.g. expect(json.data.id).toBeDefined();

    // try to GET again => should be 404
    const checkUrl = `${BASE_URL}/api/userProfile?role=freelancer&walletAddress=${encodeURIComponent(fl.walletAddress)}`;
    const checkResp = await fetch(checkUrl);
    expect([404, 400]).toContain(checkResp.status);
  });

  test('DELETE /api/userProfile => remove a company properly', async () => {
    // Ensure we have a known company from the "beforeAll" step
    const cp = createdProfiles.find(p => p.role === 'company');
    if (!cp) {
      console.warn('No company to delete. Skipping test.');
      return;
    }

    const delPayload = {
      role: 'company',
      walletAddress: cp.walletAddress
    };

    const resp = await fetch(`${BASE_URL}/api/userProfile`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(delPayload),
    });

    expect(resp.status).toBe(200);
    const json = await resp.json();
    expect(json.isSuccess).toBe(true);
    expect(json.message.toLowerCase()).toContain('company profile deleted successfully');
    expect(json.data.walletAddress.toLowerCase()).toBe(cp.walletAddress.toLowerCase());

    // try to GET again => should be 404
    const checkUrl = `${BASE_URL}/api/userProfile?role=company&walletAddress=${encodeURIComponent(cp.walletAddress)}`;
    const checkResp = await fetch(checkUrl);
    expect([404, 400]).toContain(checkResp.status);
  });
});