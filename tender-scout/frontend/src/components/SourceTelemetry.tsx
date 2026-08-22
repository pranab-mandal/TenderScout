import React, { useEffect, useState, useRef } from 'react';
import { SourceTelemetryItem } from '../types';
import { CheckCircle2, AlertTriangle, XCircle, Activity, Loader2, Database, Globe } from 'lucide-react';

interface SourceTelemetryProps {
  sources: SourceTelemetryItem[];
  cached?: boolean;
  isLoading?: boolean;
  searchId?: number; // changes on every new search to trigger re-animation
}

export const SourceTelemetry: React.FC<SourceTelemetryProps> = ({ sources, cached, isLoading, searchId }) => {
  const [visibleCount, setVisibleCount] = useState(0);
  const [elapsedMs, setElapsedMs] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const prevSearchId = useRef<number | undefined>(undefined);

  // Reset animation when searchId changes (new search started)
  useEffect(() => {
    if (searchId !== prevSearchId.current) {
      prevSearchId.current = searchId;
      setVisibleCount(0);
      setElapsedMs(0);
    }
  }, [searchId]);

  // Staggered reveal of source pills after results arrive
  useEffect(() => {
    if (!sources || sources.length === 0 || isLoading) {
      setVisibleCount(0);
      return;
    }

    let count = 0;
    const interval = setInterval(() => {
      count++;
      setVisibleCount(count);
      if (count >= sources.length) {
        clearInterval(interval);
      }
    }, 220);

    return () => clearInterval(interval);
  }, [sources, isLoading]);

  // Live elapsed timer during loading
  useEffect(() => {
    if (isLoading) {
      setElapsedMs(0);
      const start = Date.now();
      timerRef.current = setInterval(() => {
        setElapsedMs(Date.now() - start);
      }, 100);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isLoading]);

  // Loading state — show scanning animation
  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        flexWrap: 'wrap',
        padding: '14px 20px',
        backgroundColor: 'rgba(15, 23, 42, 0.6)',
        border: '1px solid rgba(56, 189, 248, 0.25)',
        borderRadius: 'var(--radius-md)',
        marginBottom: '24px',
        animation: 'pulse 1.5s ease-in-out infinite'
      }}>
        <style>{`
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.7; }
          }
          @keyframes slideInRight {
            from { opacity: 0; transform: translateX(-12px); }
            to { opacity: 1; transform: translateX(0); }
          }
        `}</style>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 700, color: '#38bdf8' }}>
          <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
          <span>Scanning Official Portals...</span>
        </div>
        <div style={{
          display: 'flex', alignItems: 'center', gap: '6px',
          fontSize: '11px', color: 'var(--text-muted)', marginLeft: 'auto'
        }}>
          <span>Elapsed: {(elapsedMs / 1000).toFixed(1)}s</span>
        </div>
      </div>
    );
  }

  if (!sources || sources.length === 0) return null;

  const totalTenders = sources.reduce((sum, s) => sum + s.count, 0);
  const totalLatency = Math.max(...sources.map(s => s.latency_ms));
  const successCount = sources.filter(s => s.status === 'SUCCESS').length;
  const failedCount = sources.filter(s => s.status === 'FAILED').length;

  return (
    <div style={{
      padding: '16px 20px',
      backgroundColor: 'rgba(15, 23, 42, 0.6)',
      border: '1px solid var(--border-color)',
      borderRadius: 'var(--radius-md)',
      marginBottom: '24px'
    }}>
      <style>{`
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(-12px); }
          to { opacity: 1; transform: translateX(0); }
        }
      `}</style>

      {/* Header row with summary stats */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '12px',
        flexWrap: 'wrap',
        gap: '8px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Activity size={15} color="#38bdf8" />
          <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-secondary)' }}>
            WebCMD Adapter Telemetry
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', fontSize: '11px', color: 'var(--text-muted)' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Database size={12} color="#64748b" />
            {totalTenders} records from {sources.length} portals
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Globe size={12} color="#64748b" />
            {(totalLatency / 1000).toFixed(1)}s total
          </span>
          {successCount > 0 && (
            <span style={{ color: '#34d399' }}>
              ✓ {successCount} succeeded
            </span>
          )}
          {failedCount > 0 && (
            <span style={{ color: '#fb7185' }}>
              ✗ {failedCount} failed
            </span>
          )}
          {cached && (
            <span style={{
              padding: '2px 8px',
              borderRadius: '4px',
              backgroundColor: 'rgba(56, 189, 248, 0.15)',
              color: '#38bdf8',
              border: '1px solid rgba(56, 189, 248, 0.3)',
              fontWeight: 600
            }}>
              ⚡ Cached
            </span>
          )}
        </div>
      </div>

      {/* Source pills with staggered animation */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
        {sources.map((s, index) => {
          const isSuccess = s.status === 'SUCCESS';
          const isPartial = s.status === 'PARTIAL';
          const isVisible = index < visibleCount;

          return (
            <div
              key={`${searchId}-${s.id}`}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '12px',
                padding: '5px 12px',
                borderRadius: '8px',
                backgroundColor: isSuccess
                  ? 'rgba(16, 185, 129, 0.1)'
                  : isPartial
                    ? 'rgba(245, 158, 11, 0.1)'
                    : 'rgba(244, 63, 94, 0.1)',
                border: `1px solid ${isSuccess
                  ? 'rgba(16, 185, 129, 0.3)'
                  : isPartial
                    ? 'rgba(245, 158, 11, 0.3)'
                    : 'rgba(244, 63, 94, 0.3)'}`,
                color: isSuccess ? '#34d399' : isPartial ? '#fbbf24' : '#fb7185',
                opacity: isVisible ? 1 : 0,
                transform: isVisible ? 'translateX(0)' : 'translateX(-12px)',
                transition: 'opacity 0.3s ease, transform 0.3s ease'
              }}
              title={s.error || `Retrieved ${s.count} tenders in ${s.latency_ms}ms from ${s.name}`}
            >
              {isSuccess ? <CheckCircle2 size={13} /> : isPartial ? <AlertTriangle size={13} /> : <XCircle size={13} />}
              <span style={{ fontWeight: 600, maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {s.name.split('(')[0].trim()}
              </span>
              <span style={{
                fontSize: '10px',
                opacity: 0.85,
                padding: '1px 6px',
                borderRadius: '4px',
                backgroundColor: 'rgba(255,255,255,0.05)'
              }}>
                {s.count} · {s.latency_ms}ms
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
