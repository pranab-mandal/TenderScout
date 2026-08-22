import { ParsedQuery, Tender } from '../schemas/tender.js';

export function formatIndianCurrency(amount?: number | null): string {
  if (!amount || isNaN(amount)) return 'Not specified';
  if (amount >= 10000000) {
    return `₹${(amount / 10000000).toFixed(2)} Cr`;
  }
  if (amount >= 100000) {
    return `₹${(amount / 100000).toFixed(2)} Lakh`;
  }
  return `₹${amount.toLocaleString('en-IN')}`;
}

export class RankingEngine {
  /**
   * Scores and explains relevance for each tender against the parsed user query.
   */
  public scoreAndRank(tenders: Tender[], query: ParsedQuery): Tender[] {
    const scored = tenders.map(tender => {
      let score = 30; // base score
      const matchReasons: string[] = [];

      const fullText = `${tender.title} ${tender.description || ''} ${tender.category || ''} ${tender.organization} ${tender.location}`.toLowerCase();

      // 1. Keyword match (up to 30 points)
      let matchedKwCount = 0;
      for (const kw of query.keywords) {
        const regex = new RegExp(`\\b${kw.toLowerCase()}\\b`, 'i');
        if (regex.test(fullText)) {
          matchedKwCount++;
        }
      }
      if (query.keywords.length > 0) {
        const kwRatio = matchedKwCount / query.keywords.length;
        const kwScore = Math.round(kwRatio * 30);
        score += kwScore;
        if (matchedKwCount > 0) {
          matchReasons.push(`Matches "${query.keywords.slice(0, 3).join(' ')}"`);
        }
      }

      // 2. Location match (up to 20 points)
      if (query.location.length > 0) {
        const locMatch = query.location.some(loc => {
          const locLower = loc.toLowerCase();
          return tender.location.toLowerCase().includes(locLower) || fullText.includes(locLower);
        });
        if (locMatch) {
          score += 20;
          matchReasons.push(`Located in ${query.location.join(', ')}`);
        } else {
          score -= 5;
        }
      }

      // 3. Organization match (up to 15 points)
      if (query.organization) {
        const orgLower = query.organization.toLowerCase();
        if (tender.organization.toLowerCase().includes(orgLower) || fullText.includes(orgLower)) {
          score += 15;
          matchReasons.push(`Issued by ${query.organization}`);
        }
      }

      // 4. Value constraint match (up to 15 points)
      if (tender.estimated_value) {
        let valueFits = true;
        if (query.max_value && tender.estimated_value > query.max_value) {
          valueFits = false;
          score -= 20;
        } else if (query.max_value && tender.estimated_value <= query.max_value) {
          score += 15;
          matchReasons.push(`Value ${formatIndianCurrency(tender.estimated_value)} within budget (<= ${formatIndianCurrency(query.max_value)})`);
        }

        if (query.min_value && tender.estimated_value < query.min_value) {
          valueFits = false;
          score -= 15;
        } else if (query.min_value && tender.estimated_value >= query.min_value) {
          score += 10;
          matchReasons.push(`Value above minimum threshold (>= ${formatIndianCurrency(query.min_value)})`);
        }
      }

      // 5. Active Status & Deadline suitability (up to 10 points)
      if (tender.status === 'OPEN') {
        score += 10;
        matchReasons.push('Verified active with future submission deadline');
      } else if (tender.status === 'EXPIRED') {
        score -= 25;
        matchReasons.push('Deadline passed');
      } else if (tender.status === 'CANCELLED') {
        score -= 40;
        matchReasons.push('Tender cancelled');
      }

      // 6. Source confidence (up to 10 points)
      if (tender.source_url.includes('.gov.in') || tender.source_url.includes('.nic.in')) {
        score += 5;
      }
      if (tender.verification.url_verified && tender.verification.source_reachable) {
        score += 5;
      }

      // Clamp score between 10 and 99
      const finalScore = Math.min(99, Math.max(10, score));

      // Build explainable sentence
      let explanation = matchReasons.join(', ');
      if (!explanation) {
        explanation = `Relevant public tender from ${tender.source}`;
      } else {
        explanation = explanation.charAt(0).toUpperCase() + explanation.slice(1) + '.';
      }

      return {
        ...tender,
        relevance_score: finalScore,
        match_explanation: explanation
      };
    });

    // Sort highest relevance score first
    return scored.sort((a, b) => (b.relevance_score || 0) - (a.relevance_score || 0));
  }
}

export const rankingEngine = new RankingEngine();
