import { queryUnderstandingAgent } from '../agents/queryUnderstanding.js';
import { sourcePlanningAgent } from '../agents/sourcePlanner.js';
import { webCmdRunner } from '../webcmd/runner.js';
import { deduplicationService } from './deduplicator.js';
import { activeTenderVerifier } from './verifier.js';
import { formatIndianCurrency, rankingEngine } from './ranker.js';
import { memoryCache } from './cache.js';
import { SearchOptions, SearchResponse, Tender } from '../schemas/tender.js';

export class SearchOrchestrator {
  /**
   * Orchestrates the complete end-to-end agentic search workflow.
   */
  public async search(options: SearchOptions): Promise<SearchResponse> {
    const rawQuery = options.query;
    const nowISO = new Date().toISOString();

    // 1. Check cache first
    const cached = memoryCache.get(rawQuery, options.location, options.category, options.max_value);
    if (cached) {
      return cached;
    }

    // 2. Agent 1: Query Understanding
    const parsedQuery = queryUnderstandingAgent.parse(rawQuery);

    // Override with explicit filter options if provided
    if (options.location) parsedQuery.location = [options.location];
    if (options.category) parsedQuery.category = options.category;
    if (options.organization) parsedQuery.organization = options.organization;
    if (options.min_value !== undefined) parsedQuery.min_value = options.min_value;
    if (options.max_value !== undefined) parsedQuery.max_value = options.max_value;

    // 3. Agent 2: Source Planning
    const plannedSources = sourcePlanningAgent.plan(parsedQuery);

    // 4. Parallel WebCMD Execution across all selected sources
    const sourceExecutionPromises = plannedSources.map(async (source) => {
      const startTime = Date.now();
      try {
        const result = await webCmdRunner.executeAdapter(source.adapter_name, parsedQuery, source);
        const latency = Date.now() - startTime;
        return {
          id: source.id,
          name: source.name,
          status: (result.error ? 'FAILED' : (result.tenders.length > 0 ? 'SUCCESS' : 'PARTIAL')) as 'SUCCESS' | 'FAILED' | 'PARTIAL',
          count: result.tenders.length,
          latency_ms: latency,
          error: result.error || undefined,
          tenders: result.tenders
        };
      } catch (err: any) {
        return {
          id: source.id,
          name: source.name,
          status: 'FAILED' as const,
          count: 0,
          latency_ms: Date.now() - startTime,
          error: err.message,
          tenders: []
        };
      }
    });

    const sourceResults = await Promise.all(sourceExecutionPromises);

    // Collect all raw normalized tenders
    let allTenders: Tender[] = [];
    const sourceSummaries = sourceResults.map(s => {
      allTenders.push(...s.tenders);
      return {
        id: s.id,
        name: s.name,
        status: s.status,
        count: s.count,
        latency_ms: s.latency_ms,
        error: s.error
      };
    });

    // 5. Multi-signal Deduplication
    const deduplicated = deduplicationService.deduplicate(allTenders);

    // 6. Active Tender Verification (URL reachability, deadline check, active status)
    const verified = await activeTenderVerifier.verifyAll(deduplicated, false); // fast probe mode

    // 7. Relevance Ranking and Explainability
    const ranked = rankingEngine.scoreAndRank(verified, parsedQuery);

    // Filter by max limit
    const finalTenders = ranked.slice(0, options.limit || 20);
    const verifiedActiveCount = finalTenders.filter(t => t.status === 'OPEN').length;

    // 8. Generate Natural Language Result Summary
    let naturalSummary = `🔎 Found ${finalTenders.length} relevant tenders (${verifiedActiveCount} verified active/open).`;
    if (parsedQuery.location.length > 0) {
      naturalSummary += ` Location: ${parsedQuery.location.join(', ')}.`;
    }
    if (parsedQuery.max_value) {
      naturalSummary += ` Budget limit: ${formatIndianCurrency(parsedQuery.max_value)}.`;
    }

    const response: SearchResponse = {
      query: rawQuery,
      parsed_parameters: parsedQuery,
      total_found: finalTenders.length,
      verified_active_count: verifiedActiveCount,
      sources_searched: sourceSummaries,
      tenders: finalTenders,
      natural_summary: naturalSummary,
      cached: false,
      searched_at: nowISO
    };

    // Cache the verified response
    memoryCache.set(rawQuery, response, options.location, options.category, options.max_value);

    return response;
  }
}

export const searchOrchestrator = new SearchOrchestrator();
