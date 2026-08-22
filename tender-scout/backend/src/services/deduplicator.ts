import { Tender } from '../schemas/tender.js';

export function normalizeString(str: string): string {
  return str.toLowerCase().replace(/[^a-z0-9]/g, '').trim();
}

/**
 * Computes Jaccard word similarity between two titles.
 */
export function titleSimilarity(a: string, b: string): number {
  const wordsA = new Set(a.toLowerCase().split(/\W+/).filter(w => w.length > 2));
  const wordsB = new Set(b.toLowerCase().split(/\W+/).filter(w => w.length > 2));
  if (wordsA.size === 0 || wordsB.size === 0) return 0;

  const intersection = new Set([...wordsA].filter(x => wordsB.has(x)));
  const union = new Set([...wordsA, ...wordsB]);

  return intersection.size / union.size;
}

export class DeduplicationService {
  /**
   * Deduplicates tenders using multi-key matching without silent drops.
   */
  public deduplicate(tenders: Tender[]): Tender[] {
    const uniqueTenders: Tender[] = [];

    for (const tender of tenders) {
      let isDuplicate = false;

      for (const existing of uniqueTenders) {
        // 1. Exact ID match from the same or different source
        const sameId = normalizeString(tender.id) === normalizeString(existing.id) && tender.id.length > 4;

        // 2. Exact official URL match
        const sameUrl = tender.url && existing.url && tender.url.toLowerCase() === existing.url.toLowerCase() && !tender.url.endsWith('/nicgep/app') && !tender.url.endsWith('/epublish/app');

        // 3. High Title Similarity + Matching Organization or Location
        const sim = titleSimilarity(tender.title, existing.title);
        const sameOrg = normalizeString(tender.organization).includes(normalizeString(existing.organization)) || normalizeString(existing.organization).includes(normalizeString(tender.organization));
        const sameLoc = normalizeString(tender.location).includes(normalizeString(existing.location)) || normalizeString(existing.location).includes(normalizeString(tender.location));
        
        const sameDeadlines = tender.deadline && existing.deadline && Math.abs(new Date(tender.deadline).getTime() - new Date(existing.deadline).getTime()) < 86400000 * 2; // within 2 days

        if (sameId || sameUrl || (sim > 0.75 && (sameOrg || sameLoc) && sameDeadlines)) {
          // It's a verified duplicate. Merge sources
          isDuplicate = true;
          if (!existing.duplicate_sources) {
            existing.duplicate_sources = [existing.source];
          }
          if (!existing.duplicate_sources.includes(tender.source)) {
            existing.duplicate_sources.push(tender.source);
          }
          // Enrich missing metadata if existing is missing estimated value or published_at
          if (!existing.estimated_value && tender.estimated_value) {
            existing.estimated_value = tender.estimated_value;
          }
          if (!existing.published_at && tender.published_at) {
            existing.published_at = tender.published_at;
          }
          break;
        }
      }

      if (!isDuplicate) {
        uniqueTenders.push({ ...tender });
      }
    }

    return uniqueTenders;
  }
}

export const deduplicationService = new DeduplicationService();
