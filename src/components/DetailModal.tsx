import { useEffect } from 'react';
import type { Submission, Status } from '../types';
import { Badge } from './Badge';
import { formatDateTime } from '../utils';

const STATUSES: Status[] = ['new', 'review', 'resolved', 'rejected'];

const STATUS_LABELS: Record<Status, string> = {
  new: 'New',
  review: 'In Review',
  resolved: 'Resolved',
  rejected: 'Rejected'
};

const TYPE_DISPLAY: Record<string, string> = {
  bug: 'Bug',
  feature: 'Feature Request',
  feedback: 'Feedback',
  partnership: 'Partnership',
  other: 'Other'
};

interface DetailModalProps {
  submission: Submission;
  onClose: () => void;
  onStatusChange: (id: string, status: Status) => void;
  onDelete: (id: string) => void;
}

export function DetailModal({ submission: sub, onClose, onStatusChange, onDelete }: DetailModalProps) {
  // Close on Escape
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose]);

  function handleDelete() {
    if (window.confirm('Delete this request? This cannot be undone.')) {
      onDelete(sub.id);
    }
  }

  // Derive title from first line of message
  const lines = sub.message.split('\n');
  const rawTitle = lines[0].trim();
  const derivedTitle = rawTitle.length > 70 ? rawTitle.slice(0, 67) + '...' : rawTitle || 'Untitled Request';

  return (
    <div
      className="modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="modal">
        <button className="modal-close" onClick={onClose} aria-label="Close">
          &times;
        </button>

        {/* Type / status / priority row */}
        <div className="modal-type-row">
          <Badge variant={sub.type}>{TYPE_DISPLAY[sub.type]}</Badge>
          <Badge variant={sub.status}>{STATUS_LABELS[sub.status]}</Badge>
          <Badge variant={sub.priority}>{sub.priority} priority</Badge>
        </div>

        <h2 id="modal-title">{derivedTitle}</h2>

        {/* Meta grid */}
        <div className="modal-meta-grid">
          <div className="modal-meta-item">
            <strong>Submitted by</strong>
            {sub.name}
          </div>
          <div className="modal-meta-item">
            <strong>Email</strong>
            <a href={`mailto:${sub.email}`}>{sub.email}</a>
          </div>
          <div className="modal-meta-item">
            <strong>Submitted on</strong>
            {formatDateTime(sub.createdAt)}
          </div>
          <div className="modal-meta-item">
            <strong>ID</strong>
            <code style={{ fontSize: '.8rem', color: 'var(--color-text-muted)' }}>{sub.id}</code>
          </div>
        </div>

        {/* Description */}
        <div className="modal-section">
          <div className="modal-section-label">Message Details</div>
          <div className="modal-description">{sub.message}</div>
        </div>

        {/* Actions */}
        <div className="modal-actions">
          <label htmlFor="modal-status-select">Change status:</label>
          <select
            id="modal-status-select"
            value={sub.status}
            onChange={e => onStatusChange(sub.id, e.target.value as Status)}
          >
            {STATUSES.map(s => (
              <option key={s} value={s}>
                {STATUS_LABELS[s]}
              </option>
            ))}
          </select>
          <span className="spacer" />
          <button className="btn btn-danger" onClick={handleDelete}>
            Delete Request
          </button>
        </div>
      </div>
    </div>
  );
}
