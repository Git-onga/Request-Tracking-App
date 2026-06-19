import type { Priority, Submission, Filters } from './types';

// ─── IDs ─────────────────────────────────────
export function uid(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

// ─── Dates ───────────────────────────────────
export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    month: 'short', day: 'numeric', year: 'numeric',
  });
}

export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

// ─── Strings ─────────────────────────────────
export function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

// ─── Filtering & sorting ─────────────────────
const PRIORITY_ORDER: Record<Priority, number> = { high: 0, medium: 1, low: 2 };

export function applyFilters(submissions: Submission[], filters: Filters): Submission[] {
  let list = [...submissions];

  if (filters.type !== 'all')   list = list.filter(s => s.type   === filters.type);
  if (filters.status !== 'all') list = list.filter(s => s.status === filters.status);

  if (filters.search) {
    const q = filters.search.toLowerCase();
    list = list.filter(s =>
      s.message.toLowerCase().includes(q) ||
      s.name.toLowerCase().includes(q) ||
      s.email.toLowerCase().includes(q)
    );
  }

  if (filters.sort === 'newest') {
    list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } else if (filters.sort === 'oldest') {
    list.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  } else if (filters.sort === 'priority') {
    list.sort((a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]);
  }

  return list;
}

// ─── Count helper ─────────────────────────────
export function countBy<T extends object>(arr: T[], key: keyof T): Record<string, number> {
  return arr.reduce<Record<string, number>>((acc, item) => {
    const val = String(item[key]);
    acc[val] = (acc[val] ?? 0) + 1;
    return acc;
  }, {});
}
