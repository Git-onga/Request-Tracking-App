import { useState, useEffect } from 'react';
import type { View, Status } from './types';
import { useSubmissions } from './hooks/useSubmissions';
import { useToast } from './hooks/useToast';
import { Header } from './components/Header';
import { SubmitForm } from './components/SubmitForm';
import { Dashboard } from './components/Dashboard';
import { DetailModal } from './components/DetailModal';
import { Toast } from './components/Toast';

export default function App() {
  const [view, setView]         = useState<View>('submit');
  const [modalId, setModalId]   = useState<string | null>(null);
  
  // Theme state
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const stored = localStorage.getItem('rb_theme');
    return (stored === 'light' || stored === 'dark') ? stored : 'dark';
  });

  const { submissions, addSubmission, updateStatus, deleteSubmission } = useSubmissions();
  const { message: toastMsg, visible: toastVisible, showToast } = useToast();

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('rb_theme', theme);
  }, [theme]);

  const modalSub = modalId ? submissions.find(s => s.id === modalId) ?? null : null;

  function handleSubmit(sub: Parameters<typeof addSubmission>[0]) {
    addSubmission(sub);
    showToast('✅ Request received! You can view it in the Dashboard.');
  }

  function handleStatusChange(id: string, status: Status) {
    updateStatus(id, status);
  }

  function handleDelete(id: string) {
    deleteSubmission(id);
    setModalId(null);
    showToast('🗑️ Request deleted.');
  }

  function toggleTheme() {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  }

  return (
    <>
      <Header 
        activeView={view} 
        onNavigate={setView} 
        theme={theme} 
        onToggleTheme={toggleTheme} 
      />

      <main className="main">
        {/* Submit view */}
        <section className={`view${view === 'submit' ? ' active' : ''}`}>
          <SubmitForm onSubmit={handleSubmit} />
        </section>

        {/* Dashboard view */}
        <section className={`view${view === 'dashboard' ? ' active' : ''}`}>
          <Dashboard
            submissions={submissions}
            onCardClick={setModalId}
            onNavigate={setView}
          />
        </section>
      </main>

      {/* Detail modal */}
      {modalSub && (
        <DetailModal
          submission={modalSub}
          onClose={() => setModalId(null)}
          onStatusChange={handleStatusChange}
          onDelete={handleDelete}
        />
      )}

      <Toast message={toastMsg} visible={toastVisible} />
    </>
  );
}
