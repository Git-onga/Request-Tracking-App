import type { View } from '../types';

interface HeaderProps {
  activeView: View;
  onNavigate: (view: View) => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

export function Header({ activeView, onNavigate, theme, onToggleTheme }: HeaderProps) {
  return (
    <header className="header">
      <div className="header-inner">
        <div className="logo">
          <span className="logo-icon">📋</span>
          <span className="logo-text">RequestBoard</span>
        </div>
        <nav className="nav">
          <button
            className={`nav-btn${activeView === 'submit' ? ' active' : ''}`}
            onClick={() => onNavigate('submit')}
          >
            Submit
          </button>
          <button
            className={`nav-btn${activeView === 'dashboard' ? ' active' : ''}`}
            onClick={() => onNavigate('dashboard')}
          >
            Dashboard
          </button>
          <button
            className="theme-toggle-btn"
            onClick={onToggleTheme}
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
        </nav>
      </div>
    </header>
  );
}
