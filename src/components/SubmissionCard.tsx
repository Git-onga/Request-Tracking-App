import type { Submission } from '../types';
import { Badge } from './Badge';
import { formatDate } from '../utils';

const TYPE_COLORS: Record<string, string> = {
  bug:         '#ef4444', // Red
  feature:     '#8b5cf6', // Violet
  feedback:    '#f59e0b', // Amber
  partnership: '#10b981', // Emerald
  other:       '#6b7280', // Gray
};

const TYPE_DISPLAY: Record<string, string> = {
  bug: 'Bug',
  feature: 'Feature Request',
  feedback: 'Feedback',
  partnership: 'Partnership',
  other: 'Other'
};

const STATUS_DISPLAY: Record<string, string> = {
  new: 'New',
  review: 'In Review',
  resolved: 'Resolved',
  rejected: 'Rejected'
};

interface SubmissionCardProps {
  submission: Submission;
  onClick: (id: string) => void;
}

export function SubmissionCard({ submission: sub, onClick }: SubmissionCardProps) {
  const dotColor = TYPE_COLORS[sub.type] ?? '#94a3b8';

  // Derive title from first line of message
  const msg = sub.message || '';
  const lines = msg.split('\n');
  const rawTitle = lines[0].trim();
  const derivedTitle = rawTitle.length > 70 ? rawTitle.slice(0, 67) + '...' : rawTitle || 'Untitled Request';
  
  // Show rest of the message or fallback to full message
  const derivedPreview = lines.slice(1).join(' ').trim() || msg;

  return (
    <article
      className="submission-card"
      role="button"
      tabIndex={0}
      aria-label={derivedTitle}
      onClick={() => onClick(sub.id)}
      onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') onClick(sub.id); }}
    >
      <span className="type-dot" style={{ background: dotColor }} />

      <div className="card-body">
        <div className="card-meta">
          <Badge variant={sub.type}>{TYPE_DISPLAY[sub.type]}</Badge>
          <Badge variant={sub.status}>{STATUS_DISPLAY[sub.status]}</Badge>
          <Badge variant={sub.priority}>{sub.priority}</Badge>
        </div>
        <div className="card-title-text">{derivedTitle}</div>
        <div className="card-desc-preview">{derivedPreview}</div>
        <div className="card-footer-info">by {sub.name} &bull; {sub.email}</div>
      </div>

      <div className="card-side">
        <span className="card-date">{formatDate(sub.createdAt)}</span>
      </div>
    </article>
  );
}
