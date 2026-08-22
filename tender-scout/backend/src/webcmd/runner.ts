import { centralTendersAdapter } from './adapters/centralTenders.js';
import { stateTendersAdapter } from './adapters/stateTenders.js';
import { psuTendersAdapter } from './adapters/psuTenders.js';
import { searchTendersAdapter } from './adapters/searchTenders.js';
import { AdapterSearchResult, ParsedQuery } from '../schemas/tender.js';
import { PlannedSource } from '../agents/sourcePlanner.js';

export interface AdapterRegistryItem {
  name: string;
  description: string;
  strategy: 'PUBLIC' | 'INTERCEPT' | 'COOKIE' | 'UI' | 'LOCAL';
  instance: {
    search: (args: any) => Promise<AdapterSearchResult>;
  };
}

export class WebCmdRunner {
  private adapters: Map<string, AdapterRegistryItem> = new Map();

  constructor() {
    this.register('tender-central', {
      name: 'tender-central',
      description: 'Central Public Procurement Portal Adapter',
      strategy: 'PUBLIC',
      instance: centralTendersAdapter
    });

    this.register('tender-state', {
      name: 'tender-state',
      description: 'State Government eProcurement Adapter',
      strategy: 'PUBLIC',
      instance: stateTendersAdapter
    });

    this.register('tender-psu', {
      name: 'tender-psu',
      description: 'PSU & Infrastructure Procurement Adapter',
      strategy: 'PUBLIC',
      instance: psuTendersAdapter
    });

    this.register('tender-search', {
      name: 'tender-search',
      description: 'Government-wide Active Tender Discovery Crawler',
      strategy: 'PUBLIC',
      instance: searchTendersAdapter
    });
  }

  public register(name: string, adapter: AdapterRegistryItem): void {
    this.adapters.set(name, adapter);
  }

  public getAdapter(name: string): AdapterRegistryItem | undefined {
    return this.adapters.get(name);
  }

  public listAdapters(): { name: string; description: string; strategy: string }[] {
    return Array.from(this.adapters.values()).map(a => ({
      name: a.name,
      description: a.description,
      strategy: a.strategy
    }));
  }

  /**
   * Executes an adapter with given search parameters.
   */
  public async executeAdapter(
    adapterName: string,
    query: ParsedQuery,
    sourceConfig?: PlannedSource
  ): Promise<AdapterSearchResult> {
    const adapter = this.adapters.get(adapterName);
    if (!adapter) {
      return {
        tenders: [],
        source_name: sourceConfig?.name || adapterName,
        source_id: adapterName,
        strategy_used: 'PUBLIC',
        execution_time_ms: 0,
        error: `No registered WebCMD adapter found with name '${adapterName}'`,
        total_found: 0
      };
    }

    const searchArgs = {
      keyword: query.keywords.join(' '),
      location: query.location.join(', '),
      organization: query.organization || undefined,
      category: query.category || undefined,
      min_value: query.min_value || undefined,
      max_value: query.max_value || undefined,
      limit: 10
    };

    try {
      const result = await adapter.instance.search(searchArgs);
      return result;
    } catch (err: any) {
      return {
        tenders: [],
        source_name: sourceConfig?.name || adapterName,
        source_id: adapterName,
        strategy_used: adapter.strategy,
        execution_time_ms: 0,
        error: err.message || 'Execution failed',
        total_found: 0
      };
    }
  }
}

export const webCmdRunner = new WebCmdRunner();
