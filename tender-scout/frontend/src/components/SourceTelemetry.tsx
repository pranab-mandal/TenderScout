import React from 'react';
import { SourceTelemetryItem } from '../types';
import { CheckCircle2, AlertTriangle, XCircle, Activity, Globe } from 'lucide-react';

interface SourceTelemetryProps {
  sources: SourceTelemetryItem[];
  cached?: boolean;
}

export const SourceTelemetry: React.FC<SourceTelemetryProps> = ({ sources, cached }) => {
  if (!sources || sources.length === 0) return null;

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      flexWrap: 'wrap',
      padding: '12px 18px',
      backgroundColor: 'rgba(15, 23, 42, 0.6)',
      border: '1px solid var(--border-color)',
      borderRadius: 'var(--radius-md)',
      marginBottom: '24px'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', marginRight: '8px' }}>
        <Activity size={15} color="#38bdf8" />
        <span>Live WebCMD Adapters:</span>
      </div>

      {sources.map((s) => {
        const isSuccess = s.status === 'SUCCESS';
        const isPartial = s.status === 'PARTIAL';

        return (
          <div
            key={s.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '12px',
              padding: '4px 10px',
              borderRadius: '6px',
              backgroundColor: isSuccess ? 'rgba(16, 185, 129, 0.1)' : (isPartial ? 'rgba(245, 158, 11, 0.1)' : 'rgba(244, 63, 94, 0.1)'),
              border: `1px solid ${isSuccess ? 'rgba(16, 185, 129, 0.3)' : (isPartial ? 'rgba(245, 158, 11, 0.3)' : 'rgba(244, 63, 94, 0.3)')}`,
              color: isSuccess ? '#34d399' : (isPartial ? '#fbbf24' : '#fb7185')
            }}
            title={s.error || `Retrieved ${s.count} tenders in ${s.latency_ms}ms`}
          >
            {isSuccess ? <CheckCircle2 size={13} /> : (isPartial ? <AlertTriangle size={13} /> : <XCircle size={13} />)}
            <span style={{ fontWeight: 600 }}>{s.name.split('(')[0].trim()}</span>
            <span style={{ fontSize: '11px', opacity: 0.8 }}>({s.count} found • {s.latency_ms}ms)</span>
          </div>
        );
      })}

      {cached && (
        <span style={{
          marginLeft: 'auto',
          fontSize: '11px',
          padding: '2px 8px',
          borderRadius: '4px',
          backgroundColor: 'rgba(56, 189, 248, 0.15)',
          color: '#38bdf8',
          border: '1px solid rgba(56, 189, 248, 0.3)',
          fontWeight: 600
        }}>
          ⚡ Served from verified cache
        </span>
      )}
    </div>
  );
};
