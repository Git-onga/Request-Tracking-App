import type { Submission } from './types';
import { uid } from './utils';

const STORAGE_KEY = 'rb_submissions';

export function loadSubmissions(): Submission[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return seedData();
    const parsed = JSON.parse(raw) as any[];
    
    const migrated = parsed.map(item => {
      const migratedItem = { ...item };
      
      // 1. Rename description/title to message
      if (migratedItem.description !== undefined && migratedItem.message === undefined) {
        migratedItem.message = migratedItem.description;
        delete migratedItem.description;
      }
      if (migratedItem.title) {
        if (migratedItem.message && !migratedItem.message.startsWith(migratedItem.title)) {
          migratedItem.message = migratedItem.title + '\n\n' + migratedItem.message;
        } else if (!migratedItem.message) {
          migratedItem.message = migratedItem.title;
        }
        delete migratedItem.title;
      }
      if (migratedItem.message === undefined) {
        migratedItem.message = '';
      }

      // 2. Map legacy types
      if (migratedItem.type === 'issue') {
        migratedItem.type = 'bug';
      } else if (migratedItem.type === 'idea') {
        migratedItem.type = 'feature';
      } else if (migratedItem.type === 'request') {
        migratedItem.type = 'other';
      } else if (!['bug', 'feature', 'feedback', 'partnership', 'other'].includes(migratedItem.type)) {
        migratedItem.type = 'other';
      }

      // 3. Map legacy priority
      if (migratedItem.priority === 'normal') {
        migratedItem.priority = 'medium';
      } else if (!['low', 'medium', 'high'].includes(migratedItem.priority)) {
        migratedItem.priority = 'medium';
      }

      // 4. Map legacy status
      if (migratedItem.status === 'in-progress') {
        migratedItem.status = 'review';
      } else if (migratedItem.status === 'closed') {
        migratedItem.status = 'rejected';
      } else if (!['new', 'review', 'resolved', 'rejected'].includes(migratedItem.status)) {
        migratedItem.status = 'new';
      }

      return migratedItem as Submission;
    });

    saveSubmissions(migrated);
    return migrated;
  } catch {
    return seedData();
  }
}

export function saveSubmissions(submissions: Submission[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(submissions));
}

// ─── Seed data (shown on first visit) ────────
function seedData(): Submission[] {
  const now = Date.now();
  const seed: Submission[] = [
    {
      id: uid(), name: 'Alice Mensah', email: 'alice@example.com',
      type: 'bug', priority: 'high',
      message:
        'Login page throws 500 error on mobile\n\nWhen I try to log in on my phone (iPhone 14, Safari), the page just shows a white screen with a 500 error. I have tried clearing the cache but it still happens.\n\nSteps to reproduce:\n1. Open the login page on Safari iOS\n2. Enter valid credentials\n3. Tap "Log in"\n4. White screen appears',
      status: 'new',
      createdAt: new Date(now - 2 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: uid(), name: 'Brian Osei', email: 'brian@example.com',
      type: 'feedback', priority: 'medium',
      message:
        'Dashboard loads really fast — great job!\n\nJust wanted to say the new dashboard update is noticeably faster. The filters are snappy and the overall experience feels polished. Keep it up!',
      status: 'resolved',
      createdAt: new Date(now - 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: uid(), name: 'Clara Diallo', email: 'clara@example.com',
      type: 'feature', priority: 'medium',
      message:
        'Add dark mode support\n\nIt would be really nice to have a dark mode option. I work late at night and the bright white background is hard on my eyes. A simple toggle in the header would be perfect.',
      status: 'review',
      createdAt: new Date(now - 3 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: uid(), name: 'David Asante', email: 'david@example.com',
      type: 'partnership', priority: 'high',
      message:
        'Export submissions to CSV\n\nCould you add a way to export all submissions (or filtered ones) to a CSV file? We need this for our monthly reporting to management. Even a basic export would help a lot.',
      status: 'new',
      createdAt: new Date(now - 5 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: uid(), name: 'Esi Boateng', email: 'esi@example.com',
      type: 'bug', priority: 'medium',
      message:
        "Email notifications arrive with wrong time zone\n\nThe timestamps in the notification emails show UTC time, but I am in GMT+3. It is confusing because the time shown is 3 hours behind my local time. Please use the user's local time zone.",
      status: 'rejected',
      createdAt: new Date(now - 7 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ];

  saveSubmissions(seed);
  return seed;
}
