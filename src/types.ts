// ─────────────────────────────────────────────
// Domain types
// ─────────────────────────────────────────────

export type SubmissionType = 'bug' | 'feature' | 'feedback' | 'partnership' | 'other';
export type Priority       = 'low' | 'medium' | 'high';
export type Status         = 'new' | 'review' | 'resolved' | 'rejected';
export type SortOption     = 'newest' | 'oldest' | 'priority';
export type View           = 'submit' | 'dashboard';

export interface Submission {
  id:          string;
  name:        string;
  email:       string;
  type:        SubmissionType;
  priority:    Priority;
  message:     string;
  status:      Status;
  createdAt:   string; // ISO 8601
}

// ─────────────────────────────────────────────
// Form state
// ─────────────────────────────────────────────

export interface FormValues {
  name:        string;
  email:       string;
  type:        SubmissionType | '';
  priority:    Priority;
  message:     string;
}

export type FormErrors = Partial<Record<keyof FormValues, string>>;

// ─────────────────────────────────────────────
// Filter state
// ─────────────────────────────────────────────

export interface Filters {
  type:   SubmissionType | 'all';
  status: Status | 'all';
  search: string;
  sort:   SortOption;
}
