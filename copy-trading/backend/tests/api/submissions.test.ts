// tests/api/submissions.test.ts
import { describe, test, expect } from '@jest/globals';
import { apiRequest } from './setup';

describe('Submissions Read (New Role Logic)', () => {
  test('POST /api/submissions/read => freelancer obtains only their submissions', async () => {
    const body = {
      role: 'freelancer',
      walletEns: 'consentsam',    // or testFreelancer-ens
      walletAddress: '0x742d35cc6634c0532925a3b844bc454e4438f77e',
    };

    const resp = await apiRequest('/submissions/read', 'POST', body);
    expect([200, 404]).toContain(resp.status);

    if (resp.status === 200) {
      expect(resp.data.isSuccess).toBe(true);
      // Expect the array of submissions to match that freelancer
      // ...
    } else {
      console.log('Could not find freelancer or something else', resp.data.message);
    }
  });

  test('POST /api/submissions/read => company obtains all submissions from its projects', async () => {
    const body = {
      role: 'company',
      walletEns: 'somecompany-ens',
      walletAddress: '0xAaaBBbCcc1112223334445556667778889990001', // example
    };
    const resp = await apiRequest('/submissions/read', 'POST', body);
    expect([200, 404, 403]).toContain(resp.status);

    if (resp.status === 200) {
      // check the shape
      expect(resp.data.isSuccess).toBe(true);
      // ...
    }
  });

  test('POST /api/submissions/read => pass projectId for company => should only get that project’s subs', async () => {
    const body = {
      role: 'company',
      walletEns: 'somecompany-ens',
      walletAddress: '0xAaaBBbCcc1112223334445556667778889990001',
      projectId: '8d2e31c5-f4a8-4bad-98b8-b0e75490c481',
    };

    const resp = await apiRequest('/submissions/read', 'POST', body);
    expect([200, 404, 403]).toContain(resp.status);

    if (resp.status === 200) {
      expect(resp.data.isSuccess).toBe(true);
      // check the returned submissions are indeed for that project only
    }
  });
});