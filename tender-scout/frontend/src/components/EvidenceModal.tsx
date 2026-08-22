import React from 'react';
import { Tender } from '../types';
import { ShieldCheck, CheckCircle2, AlertCircle, X, ExternalLink, Globe, Clock, FileText } from 'lucide-react';

interface EvidenceModalProps {
  tender: Tender | null;
  onClose: () => void;
}

export const EvidenceModal: React.FC<EvidenceModalProps> = ({ tender, onClose }) => {
  if (!tender) return null;

  const ver = tender.verification;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.75)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 50,
      padding: '20px'
    }} onClick={onClose}>
      <div
        className="glass-panel animate-fade-in"
        style={{
          width: '100%',
          maxWidth: '650px',
          maxHeight: '90vh',
          overflowY: 'auto',
          padding: '28px',
          position: 'relative',
          backgroundColor: '#0f172a',
          border: '1px solid rgba(56, 189, 248, 0.3)',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.8)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', paddingBottom: '16px', borderBottom: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              backgroundColor: 'rgba(16, 185, 129, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <ShieldCheck size={20} color="#34d399" />
            </div>
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)' }}>Tender Verification Evidence</h3>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Autonomous validation telemetry from source portal</p>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              padding: '6px',
              borderRadius: '6px'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Tender Reference */}
        <div style={{ marginBottom: '20px' }}>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>TENDER TITLE</div>
          <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.4 }}>{tender.title}</div>
          <div style={{ fontSize: '12px', color: '#38bdf8', fontFamily: 'var(--font-mono)', marginTop: '4px' }}>ID: {tender.id}</div>
        </div>

        {/* Verification Check List */}
        <div style={{
          backgroundColor: 'rgba(15, 23, 42, 0.8)',
          borderRadius: 'var(--radius-md)',
          padding: '16px',
          border: '1px solid var(--border-color)',
          marginBottom: '20px'
        }}>
          <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '12px' }}>
            Verification Checklist
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px' }}>
              <CheckCircle2 size={16} color={ver.source_reachable ? '#34d399' : '#f43f5e'} />
              <span style={{ color: 'var(--text-primary)' }}>Official Source Reachability:</span>
              <strong style={{ color: ver.source_reachable ? '#34d399' : '#f43f5e' }}>
                {ver.source_reachable ? `Reachable (HTTP ${ver.http_status || 200})` : 'Unreachable'}
              </strong>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px' }}>
              <CheckCircle2 size={16} color={ver.url_verified ? '#34d399' : '#f43f5e'} />
              <span style={{ color: 'var(--text-primary)' }}>Official Government URL Structure:</span>
              <strong style={{ color: '#34d399' }}>Verified Official Scheme</strong>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px' }}>
              <CheckCircle2 size={16} color={ver.deadline_verified ? '#34d399' : '#f43f5e'} />
              <span style={{ color: 'var(--text-primary)' }}>Submission Deadline Verified:</span>
              <strong style={{ color: ver.deadline_verified ? '#34d399' : '#f43f5e' }}>
                {ver.deadline_verified ? 'Future Active Date' : 'Expired / Past Deadline'}
              </strong>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px' }}>
              <CheckCircle2 size={16} color={ver.status_verified ? '#34d399' : '#fbbf24'} />
              <span style={{ color: 'var(--text-primary)' }}>Current State Status:</span>
              <strong style={{ color: ver.status_verified ? '#34d399' : '#fbbf24' }}>
                {tender.status}
              </strong>
            </div>
          </div>
        </div>

        {/* Verification Logs / Notes */}
        {ver.notes && ver.notes.length > 0 && (
          <div style={{ marginBottom: '20px' }}>
            <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px' }}>
              AGENT VERIFICATION LOGS
            </div>
            <div style={{
              backgroundColor: '#090d16',
              padding: '12px 14px',
              borderRadius: 'var(--radius-sm)',
              fontSize: '12px',
              fontFamily: 'var(--font-mono)',
              color: '#94a3b8',
              lineHeight: 1.6
            }}>
              {ver.notes.map((n, i) => (
                <div key={i}>{n}</div>
              ))}
              <div>Checked at: {new Date(ver.checked_at).toLocaleString('en-IN')}</div>
            </div>
          </div>
        )}

        {/* Official URL Direct Jump */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '12px', borderTop: '1px solid var(--border-color)' }}>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            Official Source: <strong>{tender.source}</strong>
          </div>

          <a
            href={tender.url}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary"
            style={{ padding: '8px 16px', fontSize: '13px' }}
          >
            <span>Open Official Tender Page</span>
            <ExternalLink size={14} />
          </a>
        </div>
      </div>
    </div>
  );
};
