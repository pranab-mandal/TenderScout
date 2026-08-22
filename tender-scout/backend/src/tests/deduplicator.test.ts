import { deduplicationService, titleSimilarity } from '../services/deduplicator.js';
import { Tender } from '../schemas/tender.js';

describe('DeduplicationService', () => {
  test('calculates title similarity accurately', () => {
    const simHigh = titleSimilarity('Construction of Rural Road in Kangra', 'Construction and Improvement of Rural Road in Kangra');
    expect(simHigh).toBeGreaterThan(0.6);

    const simLow = titleSimilarity('Supply of hospital medicines', 'Construction of bridge');
    expect(simLow).toBeLessThan(0.2);
  });

  test('merges duplicate tenders from multiple sources without dropping unique ones', () => {
    const tenderA: Tender = {
      id: 'TND-101',
      title: 'Construction of Road in Shimla',
      organization: 'HP PWD',
      location: 'Himachal Pradesh',
      deadline: '2026-09-01T00:00:00Z',
      status: 'OPEN',
      url: 'https://hptenders.gov.in/tender/101',
      source: 'State Portal',
      source_url: 'https://hptenders.gov.in',
      verified_at: '2026-08-22T00:00:00Z',
      verification: { source_reachable: true, deadline_verified: true, status_verified: true, url_verified: true, checked_at: '2026-08-22T00:00:00Z' }
    };

    const tenderB: Tender = {
      ...tenderA,
      id: 'TND-101',
      source: 'Central CPPP Portal',
      url: 'https://eprocure.gov.in/tender/101',
      estimated_value: 4500000
    };

    const uniqueTender: Tender = {
      id: 'TND-202',
      title: 'Solar Panel Installation in Solan',
      organization: 'Energy Dept',
      location: 'Solan',
      deadline: '2026-09-10T00:00:00Z',
      status: 'OPEN',
      url: 'https://hptenders.gov.in/tender/202',
      source: 'State Portal',
      source_url: 'https://hptenders.gov.in',
      verified_at: '2026-08-22T00:00:00Z',
      verification: { source_reachable: true, deadline_verified: true, status_verified: true, url_verified: true, checked_at: '2026-08-22T00:00:00Z' }
    };

    const result = deduplicationService.deduplicate([tenderA, tenderB, uniqueTender]);

    expect(result.length).toBe(2);
    const merged = result.find(t => t.id === 'TND-101');
    expect(merged).toBeDefined();
    expect(merged?.duplicate_sources).toContain('State Portal');
    expect(merged?.duplicate_sources).toContain('Central CPPP Portal');
    expect(merged?.estimated_value).toBe(4500000);
  });
});
