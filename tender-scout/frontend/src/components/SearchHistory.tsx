import React from 'react';
import { History, ArrowUpRight, Trash2 } from 'lucide-react';

interface SearchHistoryProps {
  history: string[];
  onSelect: (query: string) => void;
  onClear: () => void;
}

export const SearchHistory: React.FC<SearchHistoryProps> = ({ history, onSelect, onClear }) => {
  if (!history || history.length === 0) return null;

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      marginBottom: '20px',
      flexWrap: 'wrap'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>
        <History size={14} />
        <span>Recent Searches:</span>
      </div>

      {history.slice(0, 5).map((h, i) => (
        <button
          key={i}
          onClick={() => onSelect(h)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            fontSize: '12px',
            padding: '4px 10px',
            backgroundColor: 'rgba(30, 41, 59, 0.6)',
            border: '1px solid var(--border-color)',
            borderRadius: '6px',
            color: 'var(--text-secondary)',
            cursor: 'pointer',
            transition: 'all 0.15s ease'
          }}
        >
          <span>{h.length > 40 ? `${h.slice(0, 40)}...` : h}</span>
          <ArrowUpRight size={12} />
        </button>
      ))}

      <button
        onClick={onClear}
        style={{
          background: 'transparent',
          border: 'none',
          color: 'var(--text-muted)',
          cursor: 'pointer',
          padding: '4px',
          fontSize: '11px',
          display: 'flex',
          alignItems: 'center',
          gap: '3px'
        }}
        title="Clear recent search history"
      >
        <Trash2 size={12} />
        <span>Clear</span>
      </button>
    </div>
  );
};
