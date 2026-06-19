import { useState, useCallback } from 'react';
import type { Submission, Status } from '../types';
import { loadSubmissions, saveSubmissions } from '../storage';

export function useSubmissions() {
  const [submissions, setSubmissions] = useState<Submission[]>(loadSubmissions);

  const addSubmission = useCallback((sub: Submission) => {
    setSubmissions(prev => {
      const next = [sub, ...prev];
      saveSubmissions(next);
      return next;
    });
  }, []);

  const updateStatus = useCallback((id: string, status: Status) => {
    setSubmissions(prev => {
      const next = prev.map(s => (s.id === id ? { ...s, status } : s));
      saveSubmissions(next);
      return next;
    });
  }, []);

  const deleteSubmission = useCallback((id: string) => {
    setSubmissions(prev => {
      const next = prev.filter(s => s.id !== id);
      saveSubmissions(next);
      return next;
    });
  }, []);

  return { submissions, addSubmission, updateStatus, deleteSubmission };
}
