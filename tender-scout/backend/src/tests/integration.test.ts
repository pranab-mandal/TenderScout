import { searchOrchestrator } from '../services/searchOrchestrator.js';

describe('TenderScout Integration Tests', () => {
  test('executes end-to-end tender discovery workflow with real normalized schema', async () => {
    const response = await searchOrchestrator.search({
      query: 'Find active road construction tenders in Himachal Pradesh under 50 lakh'
    });

    expect(response).toBeDefined();
    expect(response.query).toBe('Find active road construction tenders in Himachal Pradesh under 50 lakh');
    expect(response.parsed_parameters.location).toContain('Himachal Pradesh');
    expect(response.parsed_parameters.max_value).toBe(5000000);
    expect(response.sources_searched.length).toBeGreaterThan(0);
    expect(response.tenders.length).toBeGreaterThan(0);

    // Verify properties of returned tenders
    const firstTender = response.tenders[0];
    expect(firstTender.id).toBeDefined();
    expect(firstTender.title).toBeDefined();
    expect(firstTender.url).toMatch(/^https?:\/\//);
    expect(firstTender.source).toBeDefined();
    expect(firstTender.verification).toBeDefined();
    expect(firstTender.verification.url_verified).toBe(true);
    expect(firstTender.relevance_score).toBeGreaterThan(50);
    expect(firstTender.match_explanation).toBeDefined();
  }, 20000);

  test('gracefully handles empty / unsupported location queries without crashing', async () => {
    const response = await searchOrchestrator.search({
      query: 'unusual specialized robotics procurement in unknown island'
    });

    expect(response).toBeDefined();
    expect(response.tenders).toBeDefined();
    expect(Array.isArray(response.tenders)).toBe(true);
  }, 20000);
});
