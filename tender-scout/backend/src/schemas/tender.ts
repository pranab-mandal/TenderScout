export type TenderStatus = 'OPEN' | 'EXPIRED' | 'CANCELLED' | 'UNVERIFIED';

export interface VerificationEvidence {
  source_reachable: boolean;
  deadline_verified: boolean;
  status_verified: boolean;
  url_verified: boolean;
  checked_at: string; // ISO 8601 timestamp
  notes?: string[];
  http_status?: number;
}

export interface Tender {
  id: string;
  title: string;
  organization: string;
  location: string;
  category?: string | null;
  description?: string | null;
  estimated_value?: number | null;
  currency?: string | null; // e.g. 'INR'
  emd?: number | null;
  published_at?: string | null; // ISO 8601 string
  deadline: string; // ISO 8601 string
  status: TenderStatus;
  url: string; // Must be the official source/tender URL
  source: string; // Source portal name
  source_url: string; // Base URL of source portal
  verified_at: string; // ISO 8601 string
  verification: VerificationEvidence;
  relevance_score?: number; // 0 - 100
  match_explanation?: string;
  raw_metadata?: Record<string, any>;
  duplicate_sources?: string[];
}

export interface ParsedQuery {
  raw_query: string;
  keywords: string[];
  location: string[];
  organization?: string | null;
  category?: string | null;
  min_value?: number | null;
  max_value?: number | null;
  status: TenderStatus;
  deadline_preference?: 'open' | 'closing_soon' | 'any';
}

export interface SearchOptions {
  query: string;
  location?: string;
  organization?: string;
  category?: string;
  min_value?: number;
  max_value?: number;
  status?: TenderStatus;
  limit?: number;
}

export interface AdapterSearchResult {
  tenders: Tender[];
  source_name: string;
  source_id: string;
  strategy_used: 'PUBLIC' | 'INTERCEPT' | 'COOKIE' | 'UI' | 'LOCAL';
  execution_time_ms: number;
  error?: string | null;
  total_found: number;
}

export interface SearchResponse {
  query: string;
  parsed_parameters: ParsedQuery;
  total_found: number;
  verified_active_count: number;
  sources_searched: {
    id: string;
    name: string;
    status: 'SUCCESS' | 'FAILED' | 'PARTIAL';
    count: number;
    latency_ms: number;
    error?: string;
  }[];
  tenders: Tender[];
  natural_summary: string;
  cached: boolean;
  searched_at: string;
}
