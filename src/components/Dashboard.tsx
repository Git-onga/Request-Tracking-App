import { useState } from 'react';
import type { Submission, Filters, SubmissionType, Status, SortOption, View } from '../types';
import { applyFilters, countBy } from '../utils';
import { SubmissionCard } from './SubmissionCard';

const TYPE_FILTERS  = ['all', 'bug', 'feature', 'feedback', 'partnership', 'other'] as const;
const STATUS_FILTERS = ['all', 'new', 'review', 'resolved', 'rejected'] as const;

const TYPE_LABELS: Record<string, string> = {
  all: 'All',
  bug: 'Bug',
  feature: 'Feature Request',
  feedback: 'General Feedback',
  partnership: 'Partnership',
  other: 'Other'
};

const STATUS_LABELS: Record<string, string> = {
  all: 'All',
  new: 'New',
  review: 'In Review',
  resolved: 'Resolved',
  rejected: 'Rejected'
};

const DEFAULT_FILTERS: Filters = {
  type: 'all', status: 'all', search: '', sort: 'newest',
};

interface DashboardProps {
  submissions: Submission[];
  onCardClick: (id: string) => void;
  onNavigate: (view: View) => void;
}

export function Dashboard({ submissions, onCardClick, onNavigate }: DashboardProps) {
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);

  const filtered = applyFilters(submissions, filters);
  const byStatus = countBy(submissions, 'status');

  function setFilter<K extends keyof Filters>(key: K, value: Filters[K]) {
    setFilters(prev => ({ ...prev, [key]: value }));
  }

  return (
    <>
      {/* Dashboard header */}
      <div className="dashboard-header">
        <h1>All Requests</h1>
        <div className="summary-chips">
          <span className="summary-chip" style={{ background: '#e2e8f0' }}>
            {submissions.length} total
          </span>
          <span className="summary-chip" style={{ background: '#dbeafe' }}>
            {byStatus['new'] ?? 0} new
          </span>
          <span className="summary-chip" style={{ background: '#fef3c7' }}>
            {byStatus['review'] ?? 0} in review
          </span>
          <span className="summary-chip" style={{ background: '#dcfce7' }}>
            {byStatus['resolved'] ?? 0} resolved
          </span>
          <span className="summary-chip" style={{ background: '#fee2e2' }}>
            {byStatus['rejected'] ?? 0} rejected
          </span>
        </div>
      </div>

      {/* Filters */}
      <div className="filters card">
        <div className="filter-group">
          <label>Type</label>
          <div className="chip-group">
            {TYPE_FILTERS.map(t => (
              <button
                key={t}
                className={`chip${filters.type === t ? ' active' : ''}`}
                onClick={() => setFilter('type', t as SubmissionType | 'all')}
              >
                {TYPE_LABELS[t]}
              </button>
            ))}
          </div>
        </div>

        <div className="filter-group">
          <label>Status</label>
          <div className="chip-group">
            {STATUS_FILTERS.map(s => (
              <button
                key={s}
                className={`chip${filters.status === s ? ' active' : ''}`}
                onClick={() => setFilter('status', s as Status | 'all')}
              >
                {STATUS_LABELS[s]}
              </button>
            ))}
          </div>
        </div>

        <div className="filter-group filter-search">
          <label htmlFor="search-input">Search</label>
          <input
            id="search-input"
            type="search"
            placeholder="Search name, email, or message…"
            value={filters.search}
            onChange={e => setFilter('search', e.target.value)}
          />
        </div>

        <div className="filter-group filter-sort">
          <label htmlFor="sort-select">Sort</label>
          <select
            id="sort-select"
            value={filters.sort}
            onChange={e => setFilter('sort', e.target.value as SortOption)}
          >
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
            <option value="priority">Priority</option>
          </select>
        </div>
      </div>

      {/* List or empty state */}
      {filtered.length > 0 ? (
        <div className="submission-list">
          {filtered.map(sub => (
            <SubmissionCard key={sub.id} submission={sub} onClick={onCardClick} />
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <span className="empty-icon">🗂️</span>
          <p>No submissions yet — or nothing matches your filters.</p>
          <button className="btn btn-primary" onClick={() => onNavigate('submit')}>
            Make the first submission
          </button>
        </div>
      )}
    </>
  );
}
