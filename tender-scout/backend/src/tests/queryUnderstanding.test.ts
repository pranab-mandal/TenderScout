import { queryUnderstandingAgent, parseIndianCurrency, extractLocations, detectCategory } from '../agents/queryUnderstanding.js';

describe('QueryUnderstandingAgent', () => {
  test('parses civil construction in Himachal Pradesh under 50 lakh', () => {
    const query = 'Find active road construction tenders in Himachal Pradesh under 50 lakh';
    const parsed = queryUnderstandingAgent.parse(query);

    expect(parsed.location).toContain('Himachal Pradesh');
    expect(parsed.max_value).toBe(5000000);
    expect(parsed.category).toBe('Works');
    expect(parsed.status).toBe('OPEN');
    expect(parsed.keywords).toContain('road');
    expect(parsed.keywords).toContain('construction');
  });

  test('parses Indian currency formats (crores, lakhs, and ranges)', () => {
    expect(parseIndianCurrency('under 2.5 crore')).toEqual({ min: undefined, max: 25000000 });
    expect(parseIndianCurrency('above 10 lakh')).toEqual({ min: 1000000, max: undefined });
    expect(parseIndianCurrency('between 10 lakh and 50 lakh')).toEqual({ min: 1000000, max: 5000000 });
    expect(parseIndianCurrency('upto ₹75,00,000')).toEqual({ min: undefined, max: 7500000 });
  });

  test('extracts locations and maps cities to states', () => {
    const locs = extractLocations('Road repair tender in Shimla and Kangra');
    expect(locs).toContain('Shimla');
    expect(locs).toContain('Kangra');
    expect(locs).toContain('Himachal Pradesh');
  });

  test('detects categories properly', () => {
    expect(detectCategory('Supply of medical equipment')).toBe('Goods');
    expect(detectCategory('Civil construction and paving')).toBe('Works');
    expect(detectCategory('IT maintenance and cloud consultancy')).toBe('Services');
  });
});
