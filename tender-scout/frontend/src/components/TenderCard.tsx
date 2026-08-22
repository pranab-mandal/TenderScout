import React from 'react';
import { Tender } from '../types';
import { Building2, MapPin, Calendar, IndianRupee, ExternalLink, ShieldCheck, Sparkles, AlertCircle, Layers } from 'lucide-react';

interface TenderCardProps {
  tender: Tender;
  onViewEvidence: (tender: Tender) => void;
}

export function formatValue(amount?: number | null): string {
  if (!amount || isNaN(amount)) return 'Not specified / Item rate';
  if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(2)} Cr`;
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(2)} Lakh`;
  return `₹${amount.toLocaleString('en-IN')}`;
}

export const TenderCard: React.FC<TenderCardProps> = ({ tender, onViewEvidence }) => {
  const isOpen = tender.status === 'OPEN';
  const isExpired = tender.status === 'EXPIRED';

  const deadlineDate = new Date(tender.deadline);
  const formattedDeadline = !isNaN(deadlineDate.getTime())
    ? deadlineDate.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
    : tender.deadline;

  const score = tender.relevance_score || 85;
  const scoreColor = score >= 90 ? '#10b981' : (score >= 75 ? '#06b6d4' : '#f59e0b');

  return (
    <div className="glass-panel" style={{
      padding: '24px',
      marginBottom: '16px',
      transition: 'all 0.2s ease',
      borderLeft: `4px solid ${scoreColor}`
    }}>
      {/* Top Header: Relevance Score & Status Badge */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px', marginBottom: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            padding: '3px 8px',
            borderRadius: '6px',
            backgroundColor: `${scoreColor}20`,
            border: `1px solid ${scoreColor}50`,
            color: scoreColor,
            fontSize: '12px',
            fontWeight: 700
          }}>
            <Sparkles size={13} />
            <span>{score}% Match</span>
          </div>

          <span className={`badge ${isOpen ? 'badge-open' : (isExpired ? 'badge-expired' : 'badge-unverified')}`}>
            {isOpen && <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#10b981', display: 'inline-block' }} />}
            <span>{isOpen ? 'Verified Open' : (isExpired ? 'Expired' : 'Unverified')}</span>
          </span>

          <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
            Ref: {tender.id}
          </span>
        </div>

        <button
          type="button"
          onClick={() => onViewEvidence(tender)}
          className="btn btn-secondary"
          style={{ padding: '6px 12px', fontSize: '12px' }}
        >
          <ShieldCheck size={14} color="#34d399" />
          <span>Verification Evidence</span>
        </button>
      </div>

      {/* Main Title */}
      <h2 style={{ fontSize: '18px', fontWeight: 700, lineHeight: 1.4, color: 'var(--text-primary)', marginBottom: '12px' }}>
        {tender.title}
      </h2>

      {/* Tender Metadata Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '12px',
        padding: '14px 16px',
        backgroundColor: 'rgba(15, 23, 42, 0.6)',
        borderRadius: 'var(--radius-md)',
        marginBottom: '16px',
        border: '1px solid rgba(255, 255, 255, 0.04)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Building2 size={16} color="#94a3b8" />
          <div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>Organization</div>
            <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>{tender.organization}</div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <MapPin size={16} color="#94a3b8" />
          <div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>Location</div>
            <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>{tender.location}</div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <IndianRupee size={16} color="#10b981" />
          <div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>Estimated Value</div>
            <div style={{ fontSize: '14px', fontWeight: 700, color: '#34d399' }}>{formatValue(tender.estimated_value)}</div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Calendar size={16} color="#38bdf8" />
          <div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>Submission Deadline</div>
            <div style={{ fontSize: '13px', fontWeight: 600, color: isOpen ? '#38bdf8' : '#fb7185' }}>{formattedDeadline}</div>
          </div>
        </div>
      </div>

      {/* Why it Matches Explainability Box */}
      {tender.match_explanation && (
        <div style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: '8px',
          padding: '10px 14px',
          borderRadius: 'var(--radius-sm)',
          backgroundColor: 'rgba(56, 189, 248, 0.08)',
          border: '1px solid rgba(56, 189, 248, 0.2)',
          marginBottom: '16px',
          fontSize: '13px',
          color: '#e0f2fe'
        }}>
          <Sparkles size={16} color="#38bdf8" style={{ flexShrink: 0, marginTop: '2px' }} />
          <div>
            <span style={{ fontWeight: 700, color: '#38bdf8' }}>Why it matches: </span>
            <span>{tender.match_explanation}</span>
          </div>
        </div>
      )}

      {/* Bottom Footer: Official Source & Clickable Link */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', paddingTop: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: 'var(--text-muted)' }}>
          <span>Source: <strong style={{ color: 'var(--text-secondary)' }}>{tender.source}</strong></span>
          {tender.duplicate_sources && tender.duplicate_sources.length > 1 && (
            <span style={{
              fontSize: '11px',
              padding: '2px 6px',
              borderRadius: '4px',
              backgroundColor: 'rgba(99, 102, 241, 0.15)',
              color: '#818cf8',
              border: '1px solid rgba(99, 102, 241, 0.3)'
            }}>
              Found on {tender.duplicate_sources.length} official portals
            </span>
          )}
        </div>

        <a
          href={tender.url}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-primary"
          style={{ padding: '8px 16px', fontSize: '13px' }}
        >
          <span>View Official Tender</span>
          <ExternalLink size={14} />
        </a>
      </div>
    </div>
  );
};
