import { activeTenderVerifier } from '../services/verifier.js';
import { Tender } from '../schemas/tender.js';

describe('ActiveTenderVerificationService', () => {
  test('verifies active tender with future deadline', async () => {
    const tender: Tender = {
      id: 'VER-001',
      title: 'Bridge Construction in Kangra',
      organization: 'HP PWD',
      location: 'Himachal Pradesh',
      deadline: '2026-09-30T17:00:00.000Z',
      status: 'OPEN',
      url: 'https://hptenders.gov.in',
      source: 'HP Portal',
      source_url: 'https://hptenders.gov.in',
      verified_at: new Date().toISOString(),
      verification: { source_reachable: false, deadline_verified: false, status_verified: false, url_verified: false, checked_at: '' }
    };

    const verified = await activeTenderVerifier.verifyTender(tender, false);

    expect(verified.status).toBe('OPEN');
    expect(verified.verification.deadline_verified).toBe(true);
    expect(verified.verification.url_verified).toBe(true);
    expect(verified.verification.status_verified).toBe(true);
  });

  test('marks expired tender if deadline is in the past', async () => {
    const expiredTender: Tender = {
      id: 'VER-002',
      title: 'Old Road Tender',
      organization: 'CPWD',
      location: 'Delhi',
      deadline: '2024-01-01T17:00:00.000Z',
      status: 'OPEN',
      url: 'https://eprocure.gov.in',
      source: 'Central Portal',
      source_url: 'https://eprocure.gov.in',
      verified_at: new Date().toISOString(),
      verification: { source_reachable: false, deadline_verified: false, status_verified: false, url_verified: false, checked_at: '' }
    };

    const verified = await activeTenderVerifier.verifyTender(expiredTender, false);

    expect(verified.status).toBe('EXPIRED');
    expect(verified.verification.deadline_verified).toBe(false);
  });
});
