import { resultNormalizer, parseDateToISO, parseNumericValue, normalizeStatus } from '../services/normalizer.js';

describe('ResultNormalizerService', () => {
  test('normalizes raw disparate fields into stable Tender schema', () => {
    const raw = {
      tender_id: 'NIT-HP-2026-99',
      tender_title: 'Widening of National Highway in Kullu',
      dept: 'Himachal Pradesh PWD',
      place: 'Kullu, Himachal Pradesh',
      value: '45.5 Lakh',
      closing_date: '2026-09-15 17:00',
      status: 'Active',
      tender_url: 'https://hptenders.gov.in/nicgep/app?page=tender&id=99'
    };

    const tender = resultNormalizer.normalize(raw, 'HP State Portal', 'https://hptenders.gov.in');

    expect(tender.id).toBe('NIT-HP-2026-99');
    expect(tender.title).toBe('Widening of National Highway in Kullu');
    expect(tender.organization).toBe('Himachal Pradesh PWD');
    expect(tender.location).toBe('Kullu, Himachal Pradesh');
    expect(tender.estimated_value).toBe(4550000);
    expect(tender.currency).toBe('INR');
    expect(tender.status).toBe('OPEN');
    expect(tender.url).toBe('https://hptenders.gov.in/nicgep/app?page=tender&id=99');
    expect(tender.verification.url_verified).toBe(true);
  });

  test('parses various date formats to ISO string', () => {
    const iso = parseDateToISO('22-Aug-2026 05:00 PM');
    expect(iso).toContain('2026-08-22');
  });

  test('parses numeric values correctly', () => {
    expect(parseNumericValue('₹50,00,000')).toBe(5000000);
    expect(parseNumericValue('1.2 Cr')).toBe(12000000);
    expect(parseNumericValue('25 Lakhs')).toBe(2500000);
    expect(parseNumericValue(null)).toBeNull();
  });

  test('marks past deadlines as EXPIRED', () => {
    const pastDate = '2020-01-01T00:00:00.000Z';
    expect(normalizeStatus('OPEN', pastDate)).toBe('EXPIRED');
  });
});
