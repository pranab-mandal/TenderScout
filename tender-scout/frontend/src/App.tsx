import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { SearchForm } from './components/SearchForm';
import { SourceTelemetry } from './components/SourceTelemetry';
import { TenderCard } from './components/TenderCard';
import { EvidenceModal } from './components/EvidenceModal';
import { SearchHistory } from './components/SearchHistory';
import { SearchResponse, Tender, TenderStatus } from './types';
import { Search, Filter, ArrowUpDown, Sparkles, CheckCircle2, Clock, AlertTriangle, ShieldCheck } from 'lucide-react';

const API_BASE = 'http://localhost:3001';

export const App: React.FC = () => {
  const [response, setResponse] = useState<SearchResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<string[]>([]);
  const [selectedTenderForEvidence, setSelectedTenderForEvidence] = useState<Tender | null>(null);
  const [searchId, setSearchId] = useState(0);

  // Filter & Sorting states
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'relevance' | 'deadline' | 'value'>('relevance');

  // Load search history from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('tenderscout_history');
      if (saved) {
        setHistory(JSON.parse(saved));
      }
    } catch (_) {}
  }, []);

  // Save history
  const saveToHistory = (queryStr: string) => {
    const updated = [queryStr, ...history.filter(h => h.toLowerCase() !== queryStr.toLowerCase())].slice(0, 10);
    setHistory(updated);
    try {
      localStorage.setItem('tenderscout_history', JSON.stringify(updated));
    } catch (_) {}
  };

  const handleClearHistory = () => {
    setHistory([]);
    try {
      localStorage.removeItem('tenderscout_history');
    } catch (_) {}
  };

  // Perform Agentic Search
  const executeSearch = async (queryStr: string, filters: any = {}) => {
    setIsLoading(true);
    setError(null);
    setResponse(null);
    setSearchId(prev => prev + 1);
    saveToHistory(queryStr);

    try {
      const res = await fetch(`${API_BASE}/api/search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: queryStr,
          location: filters.location,
          organization: filters.organization,
          category: filters.category,
          max_value: filters.max_value,
          min_value: filters.min_value
        })
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to fetch tenders from backend agent');
      }

      const data: SearchResponse = await res.json();
      setResponse(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Error executing tender discovery query.');
    } finally {
      setIsLoading(false);
    }
  };

  // Run initial default search on mount
  useEffect(() => {
    executeSearch('Find active road construction tenders in Himachal Pradesh under 50 lakh');
  }, []);

  // Filter and sort tenders for display
  const displayedTenders = React.useMemo(() => {
    if (!response?.tenders) return [];

    let list = [...response.tenders];

    // Status filter
    if (statusFilter === 'OPEN') {
      list = list.filter(t => t.status === 'OPEN');
    } else if (statusFilter === 'EXPIRED') {
      list = list.filter(t => t.status === 'EXPIRED');
    }

    // Category filter
    if (categoryFilter !== 'ALL') {
      list = list.filter(t => (t.category || '').toLowerCase().includes(categoryFilter.toLowerCase()));
    }

    // Sorting
    if (sortBy === 'relevance') {
      list.sort((a, b) => (b.relevance_score || 0) - (a.relevance_score || 0));
    } else if (sortBy === 'deadline') {
      list.sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());
    } else if (sortBy === 'value') {
      list.sort((a, b) => (b.estimated_value || 0) - (a.estimated_value || 0));
    }

    return list;
  }, [response, statusFilter, categoryFilter, sortBy]);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header />

      <main style={{ flex: 1, padding: '32px 0 64px' }}>
        <div className="container">
          {/* Main Hero & Search Box */}
          <div style={{ textAlign: 'center', marginBottom: '28px' }}>
            <h2 style={{ fontSize: '32px', fontWeight: 800, letterSpacing: '-0.5px', marginBottom: '8px' }}>
              Discover & Verify Official Government Tenders
            </h2>
            <p style={{ fontSize: '15px', color: 'var(--text-secondary)', maxWidth: '640px', margin: '0 auto' }}>
              Autonomous multi-portal discovery powered by WebCMD adapters across Central, State, and PSU public portals with real-time deadline & URL verification.
            </p>
          </div>

          <SearchForm onSearch={executeSearch} isLoading={isLoading} />

          <SearchHistory
            history={history}
            onSelect={(q) => executeSearch(q)}
            onClear={handleClearHistory}
          />

          {/* Telemetry — shown during loading AND after results */}
          {(isLoading || response) && (
            <SourceTelemetry
              sources={response?.sources_searched || []}
              cached={response?.cached}
              isLoading={isLoading}
              searchId={searchId}
            />
          )}

          {/* Error Banner */}
          {error && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '16px 20px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'rgba(244, 63, 94, 0.15)',
              border: '1px solid rgba(244, 63, 94, 0.3)',
              color: '#fb7185',
              marginBottom: '24px'
            }}>
              <AlertTriangle size={20} />
              <span>{error}</span>
            </div>
          )}

          {/* Search Result Summary Header & Filter Bar */}
          {response && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '16px',
              padding: '16px 20px',
              backgroundColor: 'rgba(15, 23, 42, 0.7)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-color)',
              marginBottom: '20px'
            }}>
              <div>
                <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>
                  {response.natural_summary}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                  Parsed parameters: Location: <strong>{response.parsed_parameters.location.join(', ') || 'Pan India'}</strong> • 
                  Category: <strong>{response.parsed_parameters.category || 'All'}</strong> • 
                  Status: <strong>{response.parsed_parameters.status}</strong>
                </div>
              </div>

              {/* Filter & Sort Controls */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Filter size={14} color="#94a3b8" />
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    style={{
                      padding: '6px 10px',
                      backgroundColor: 'rgba(30, 41, 59, 0.8)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '6px',
                      color: 'var(--text-primary)',
                      fontSize: '12px'
                    }}
                  >
                    <option value="ALL">All Statuses ({response.tenders.length})</option>
                    <option value="OPEN">Verified Open Only ({response.verified_active_count})</option>
                    <option value="EXPIRED">Expired Tenders</option>
                  </select>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <ArrowUpDown size={14} color="#94a3b8" />
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    style={{
                      padding: '6px 10px',
                      backgroundColor: 'rgba(30, 41, 59, 0.8)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '6px',
                      color: 'var(--text-primary)',
                      fontSize: '12px'
                    }}
                  >
                    <option value="relevance">Highest Relevance</option>
                    <option value="deadline">Closing Soonest</option>
                    <option value="value">Highest Value</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Results List */}
          {isLoading ? (
            <div style={{ textAlign: 'center', padding: '60px 0' }}>
              <div style={{
                display: 'inline-block',
                width: '44px',
                height: '44px',
                border: '3px solid rgba(16, 185, 129, 0.2)',
                borderTopColor: '#10b981',
                borderRadius: '50%',
                animation: 'spin 0.8s linear infinite',
                marginBottom: '16px'
              }} />
              <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)' }}>Scouting official tender portals...</h3>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                Executing WebCMD adapters, normalizing records, verifying live reachability and deadlines.
              </p>
            </div>
          ) : displayedTenders.length > 0 ? (
            <div className="animate-fade-in">
              {displayedTenders.map((tender) => (
                <TenderCard
                  key={tender.id}
                  tender={tender}
                  onViewEvidence={(t) => setSelectedTenderForEvidence(t)}
                />
              ))}
            </div>
          ) : response && (
            <div style={{ textAlign: 'center', padding: '60px 20px', backgroundColor: 'rgba(15, 23, 42, 0.5)', borderRadius: 'var(--radius-lg)', border: '1px dashed var(--border-color)' }}>
              <ShieldCheck size={40} color="#64748b" style={{ margin: '0 auto 12px' }} />
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)' }}>No verified tenders found</h3>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', maxWidth: '450px', margin: '6px auto 0' }}>
                No active tenders matched your exact criteria. Try broadening your keywords or adjusting location and budget constraints.
              </p>
            </div>
          )}
        </div>
      </main>

      {/* Evidence Modal */}
      <EvidenceModal
        tender={selectedTenderForEvidence}
        onClose={() => setSelectedTenderForEvidence(null)}
      />

      {/* Footer */}
      <footer style={{
        borderTop: '1px solid var(--border-color)',
        padding: '24px 0',
        backgroundColor: 'rgba(10, 14, 23, 0.95)',
        textAlign: 'center',
        fontSize: '13px',
        color: 'var(--text-muted)'
      }}>
        <div className="container">
          <p>
            <strong>TenderScout</strong> — Production-Ready Agentic Tender Discovery powered by WebCMD adapters.
          </p>
          <p style={{ fontSize: '12px', marginTop: '4px' }}>
            All tender links directly point to official government portals (<code>eprocure.gov.in</code>, <code>hptenders.gov.in</code>, <code>etenders.gov.in</code>, <code>ireps.gov.in</code>).
          </p>
        </div>
      </footer>
    </div>
  );
};
