import React, { useState } from 'react';
import { Search, SlidersHorizontal, ArrowRight, MapPin, Building2, IndianRupee, Layers, Calendar, Sparkles } from 'lucide-react';

interface SearchFormProps {
  onSearch: (query: string, filters: any) => void;
  isLoading: boolean;
}

const QUICK_CHIPS = [
  'Road construction in Himachal Pradesh under 50 lakh',
  'Civil works in Shimla PWD',
  'NTPC & NHAI infrastructure tenders',
  'Maharashtra civil construction tenders',
  'Medical supplies AIIMS open tenders',
  'Electrical maintenance works Delhi'
];

export const SearchForm: React.FC<SearchFormProps> = ({ onSearch, isLoading }) => {
  const [query, setQuery] = useState('Find active road construction tenders in Himachal Pradesh under 50 lakh');
  const [showFilters, setShowFilters] = useState(false);
  const [location, setLocation] = useState('');
  const [org, setOrg] = useState('');
  const [category, setCategory] = useState('');
  const [maxValue, setMaxValue] = useState('');
  const [deadlinePref, setDeadlinePref] = useState('open');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() && !location.trim()) return;

    onSearch(query.trim(), {
      location: location.trim() || undefined,
      organization: org.trim() || undefined,
      category: category.trim() || undefined,
      max_value: maxValue ? Number(maxValue) : undefined,
      deadline_preference: deadlinePref
    });
  };

  const handleChipClick = (chipText: string) => {
    setQuery(chipText);
    onSearch(chipText, {});
  };

  return (
    <div className="glass-panel" style={{ padding: '28px', marginBottom: '24px' }}>
      <form onSubmit={handleSubmit}>
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <div style={{ position: 'absolute', left: '18px', color: 'var(--accent-emerald)', display: 'flex', alignItems: 'center' }}>
            <Search size={22} />
          </div>

          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ask TenderScout in plain English (e.g. Find civil construction tenders in Himachal Pradesh under 50 lakh)..."
            style={{
              width: '100%',
              padding: '18px 180px 18px 52px',
              fontSize: '16px',
              fontWeight: 500,
              color: 'var(--text-primary)',
              backgroundColor: 'rgba(15, 23, 42, 0.9)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-md)',
              outline: 'none',
              transition: 'all 0.2s ease',
              boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.4)'
            }}
          />

          <div style={{ position: 'absolute', right: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className="btn btn-secondary"
              style={{ padding: '10px 14px', fontSize: '13px' }}
              title="Toggle detailed filters"
            >
              <SlidersHorizontal size={16} />
              <span>Filters</span>
            </button>

            <button
              type="submit"
              disabled={isLoading}
              className="btn btn-primary"
              style={{ minWidth: '130px' }}
            >
              {isLoading ? (
                <span>Scouting...</span>
              ) : (
                <>
                  <span>Find Tenders</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </div>
        </div>

        {/* Quick Suggestion Chips */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '16px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>
            <Sparkles size={14} color="#38bdf8" />
            <span>Try:</span>
          </div>
          {QUICK_CHIPS.map((chip, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleChipClick(chip)}
              className="chip"
            >
              {chip}
            </button>
          ))}
        </div>

        {/* Expandable Precise Filters */}
        {showFilters && (
          <div className="animate-fade-in" style={{
            marginTop: '20px',
            paddingTop: '20px',
            borderTop: '1px solid var(--border-color)',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '16px'
          }}>
            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                <MapPin size={14} color="#38bdf8" />
                <span>Location / State</span>
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Himachal Pradesh, Shimla"
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  backgroundColor: 'rgba(30, 41, 59, 0.5)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-sm)',
                  color: 'var(--text-primary)',
                  fontSize: '13px'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                <Building2 size={14} color="#38bdf8" />
                <span>Organization / Dept</span>
              </label>
              <input
                type="text"
                value={org}
                onChange={(e) => setOrg(e.target.value)}
                placeholder="e.g. PWD, NHAI, NTPC, CPWD"
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  backgroundColor: 'rgba(30, 41, 59, 0.5)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-sm)',
                  color: 'var(--text-primary)',
                  fontSize: '13px'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                <IndianRupee size={14} color="#38bdf8" />
                <span>Maximum Value (INR)</span>
              </label>
              <input
                type="number"
                value={maxValue}
                onChange={(e) => setMaxValue(e.target.value)}
                placeholder="e.g. 5000000 (50 Lakh)"
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  backgroundColor: 'rgba(30, 41, 59, 0.5)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-sm)',
                  color: 'var(--text-primary)',
                  fontSize: '13px'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                <Layers size={14} color="#38bdf8" />
                <span>Category</span>
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  backgroundColor: 'rgba(30, 41, 59, 0.5)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-sm)',
                  color: 'var(--text-primary)',
                  fontSize: '13px'
                }}
              >
                <option value="">All Categories</option>
                <option value="Works">Civil & Works</option>
                <option value="Goods">Goods & Supplies</option>
                <option value="Services">Services & IT</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                <Calendar size={14} color="#38bdf8" />
                <span>Deadline</span>
              </label>
              <select
                value={deadlinePref}
                onChange={(e) => setDeadlinePref(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  backgroundColor: 'rgba(30, 41, 59, 0.5)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-sm)',
                  color: 'var(--text-primary)',
                  fontSize: '13px'
                }}
              >
                <option value="open">Any Active Tender (Future Deadline)</option>
                <option value="closing_soon">Closing This Week</option>
                <option value="any">Include All (Archived/Expired)</option>
              </select>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};
