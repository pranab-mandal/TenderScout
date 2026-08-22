export type TenderStatus = 'OPEN' | 'EXPIRED' | 'CANCELLED' | 'UNVERIFIED';

export interface VerificationEvidence {
  source_reachable: boolean;
  deadline_verified: boolean;
  status_verified: boolean;
  url_verified: boolean;
  checked_at: string;
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
  currency?: string | null;
  emd?: number | null;
  published_at?: string | null;
  deadline: string;
  status: TenderStatus;
  url: string;
  source: string;
  source_url: string;
  verified_at: string;
  verification: VerificationEvidence;
  relevance_score?: number;
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

export interface SourceTelemetryItem {
  id: string;
  name: string;
  status: 'SUCCESS' | 'FAILED' | 'PARTIAL';
  count: number;
  latency_ms: number;
  error?: string;
}

export interface SearchResponse {
  query: string;
  parsed_parameters: ParsedQuery;
  total_found: number;
  verified_active_count: number;
  sources_searched: SourceTelemetryItem[];
  tenders: Tender[];
  natural_summary: string;
  cached: boolean;
  searched_at: string;
}
