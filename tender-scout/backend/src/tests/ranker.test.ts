import { rankingEngine, formatIndianCurrency } from '../services/ranker.js';
import { ParsedQuery, Tender } from '../schemas/tender.js';

describe('RankingEngine', () => {
  test('formats Indian currency properly in Lakhs and Crores', () => {
    expect(formatIndianCurrency(5000000)).toBe('₹50.00 Lakh');
    expect(formatIndianCurrency(25000000)).toBe('₹2.50 Cr');
    expect(formatIndianCurrency(75000)).toBe('₹75,000');
  });

  test('ranks highly relevant tenders above less relevant ones', () => {
    const query: ParsedQuery = {
      raw_query: 'road construction in Himachal Pradesh under 50 lakh',
      keywords: ['road', 'construction'],
      location: ['Himachal Pradesh'],
      max_value: 5000000,
      status: 'OPEN'
    };

    const bestMatch: Tender = {
      id: 'RANK-01',
      title: 'Construction of Rural Link Road in Kangra',
      organization: 'HP PWD',
      location: 'Himachal Pradesh',
      estimated_value: 4200000,
      deadline: '2026-09-10T00:00:00Z',
      status: 'OPEN',
      url: 'https://hptenders.gov.in',
      source: 'State Portal',
      source_url: 'https://hptenders.gov.in',
      verified_at: new Date().toISOString(),
      verification: { source_reachable: true, deadline_verified: true, status_verified: true, url_verified: true, checked_at: '' }
    };

    const poorMatch: Tender = {
      id: 'RANK-02',
      title: 'Supply of office computers in Chennai',
      organization: 'Education Dept',
      location: 'Tamil Nadu',
      estimated_value: 90000000,
      deadline: '2026-09-10T00:00:00Z',
      status: 'OPEN',
      url: 'https://eprocure.gov.in',
      source: 'Central Portal',
      source_url: 'https://eprocure.gov.in',
      verified_at: new Date().toISOString(),
      verification: { source_reachable: true, deadline_verified: true, status_verified: true, url_verified: true, checked_at: '' }
    };

    const ranked = rankingEngine.scoreAndRank([poorMatch, bestMatch], query);

    expect(ranked[0].id).toBe('RANK-01');
    expect(ranked[0].relevance_score).toBeGreaterThan(ranked[1].relevance_score || 0);
    expect(ranked[0].match_explanation).toContain('road construction');
  });
});
