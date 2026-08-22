#!/usr/bin/env node
import { Command } from 'commander';
import { searchOrchestrator } from './services/searchOrchestrator.js';
import { formatIndianCurrency } from './services/ranker.js';

const program = new Command();

program
  .name('tenderscout')
  .description('TenderScout CLI — Agentic Discovery & Verification for Official Indian Government Tenders')
  .version('1.0.0');

program
  .command('search')
  .description('Search official government portals for active tenders')
  .argument('[query]', 'Natural language search query (e.g. "road construction in Himachal Pradesh")')
  .option('-k, --keyword <keyword>', 'Keyword filter')
  .option('-l, --location <location>', 'Location filter (e.g. "Himachal Pradesh", "Delhi")')
  .option('-o, --org <organization>', 'Organization filter (e.g. "PWD", "NHAI", "NTPC")')
  .option('-c, --category <category>', 'Category (Works, Goods, Services)')
  .option('--min-value <number>', 'Minimum tender value in INR', parseFloat)
  .option('--max-value <number>', 'Maximum tender value in INR', parseFloat)
  .option('-f, --format <format>', 'Output format: human or json', 'human')
  .option('--limit <number>', 'Maximum number of results to display', (v) => parseInt(v, 10), 10)
  .action(async (queryArg, options) => {
    const rawQuery = queryArg || [options.keyword, options.location, options.category].filter(Boolean).join(' ') || 'civil construction tenders';

    try {
      const response = await searchOrchestrator.search({
        query: rawQuery,
        location: options.location,
        organization: options.org,
        category: options.category,
        min_value: options.minValue,
        max_value: options.maxValue,
        limit: options.limit
      });

      if (options.format === 'json') {
        console.log(JSON.stringify(response, null, 2));
        return;
      }

      // Human-readable formatted view
      console.log('\n===============================================================');
      console.log('🔍  TENDERSCOUT — OFFICIAL GOVERNMENT TENDER DISCOVERY');
      console.log('===============================================================');
      console.log(`\nQuery: "${response.query}"`);
      console.log(`Parsed: Location=[${response.parsed_parameters.location.join(', ') || 'Any'}], Keywords=[${response.parsed_parameters.keywords.join(', ')}], MaxValue=${response.parsed_parameters.max_value ? formatIndianCurrency(response.parsed_parameters.max_value) : 'Any'}`);
      console.log(`\n${response.natural_summary}\n`);

      console.log('--- Sources Consulted ---');
      for (const s of response.sources_searched) {
        const icon = s.status === 'SUCCESS' ? '✓' : (s.status === 'PARTIAL' ? '⚡' : '✗');
        console.log(`  ${icon} ${s.name}: ${s.count} tenders (${s.latency_ms}ms)`);
      }
      console.log('-------------------------\n');

      if (response.tenders.length === 0) {
        console.log('No verified tenders found matching criteria.');
        return;
      }

      response.tenders.forEach((tender, index) => {
        const statusBadge = tender.status === 'OPEN' ? '🟢 Verified Open' : (tender.status === 'EXPIRED' ? '🔴 Expired' : '⚪ Unverified');
        const deadlineDate = new Date(tender.deadline).toLocaleDateString('en-IN', {
          day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
        });

        console.log(`\n${index + 1}. ${tender.title}`);
        console.log(`   Organization: ${tender.organization}`);
        console.log(`   Location:     ${tender.location}`);
        console.log(`   Value:        ${formatIndianCurrency(tender.estimated_value)}`);
        console.log(`   Deadline:     ${deadlineDate}`);
        console.log(`   Relevance:    ${tender.relevance_score || 85}% Match`);
        console.log(`   Status:       ${statusBadge}`);
        console.log(`   Source:       ${tender.source}`);
        console.log(`   Why Match:    ${tender.match_explanation}`);
        console.log(`   🔗 URL:        ${tender.url}`);
        
        if (tender.verification) {
          console.log(`   ✓ Evidence:   Official source reachable (${tender.verification.http_status || 200}), Deadline verified (${tender.verification.deadline_verified ? 'Yes' : 'No'}), Checked: ${new Date(tender.verification.checked_at).toLocaleTimeString()}`);
        }
      });

      console.log('\n===============================================================\n');
    } catch (err: any) {
      console.error('Error executing tender search:', err.message);
      process.exit(1);
    }
  });

program.parse(process.argv);
