import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useLanguage } from '../hooks/useLanguage.jsx';
import LanguageSwitcher from './LanguageSwitcher';
import DarkModeToggle from './DarkModeToggle';

export default function DashboardLayout({ user, onLogout, children }) {
  const location = useLocation();
  const { t } = useLanguage();
  const [menuOpen, setMenuOpen] = useState(false);

  const BEEKEEPER_LINKS = [
    { to: '/dashboard', label: t.nav.dashboard },
    { to: '/apiaries', label: t.nav.apiaries },
    { to: '/hives', label: t.nav.hives },
    { to: '/batches', label: t.nav.batches },
    { to: '/alerts', label: t.nav.alerts },
  ];
  const ADMIN_LINKS = [{ to: '/admin', label: t.nav.kvicDashboard }, { to: '/admin/audit-log', label: 'Audit Log' }];

  const links = user?.role === 'admin' ? ADMIN_LINKS : BEEKEEPER_LINKS;

  return (
    <div className="min-h-screen bg-honey-50 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 border-b border-honey-100 dark:border-gray-700 sticky top-0 z-30 print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-2">
          <Link to="/" className="flex items-center gap-2 font-bold text-honey-900 dark:text-honey-100 text-base sm:text-lg whitespace-nowrap">
            🐝 HoneyChain
          </Link>

          <nav className="hidden lg:flex items-center gap-1">
            {links.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-150 ${
                  location.pathname === l.to
                    ? 'bg-honey-500 text-white'
                    : 'text-honey-900 dark:text-honey-100 hover:bg-honey-100 dark:hover:bg-gray-700'
                }`}
              >
                {l.label}
              </Link>
            ))}
          </nav>

          <div className="hidden lg:flex items-center gap-3">
            <DarkModeToggle />
            <LanguageSwitcher />
            <span className="text-sm text-gray-600 dark:text-gray-300 max-w-[120px] truncate">{user?.name}</span>
            <button
              onClick={onLogout}
              className="text-sm px-3 py-1.5 rounded-lg border border-honey-300 dark:border-gray-600 hover:bg-honey-100 dark:hover:bg-gray-700 transition-colors duration-150"
            >
              {t.nav.logout}
            </button>
          </div>

          <button
            onClick={() => setMenuOpen((o) => !o)}
            className="lg:hidden p-2 rounded-lg border border-honey-200 dark:border-gray-600 text-honey-900 dark:text-honey-100"
            aria-label="Menu"
          >
            {menuOpen ? (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
            ) : (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
            )}
          </button>
        </div>

        {menuOpen && (
          <div className="lg:hidden border-t border-honey-100 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-3 space-y-1 animate-fade-in">
            {links.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                onClick={() => setMenuOpen(false)}
                className={`block px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-150 ${
                  location.pathname === l.to
                    ? 'bg-honey-500 text-white'
                    : 'text-honey-900 dark:text-honey-100 hover:bg-honey-100 dark:hover:bg-gray-700'
                }`}
              >
                {l.label}
              </Link>
            ))}
            <div className="flex items-center gap-2 pt-2 flex-wrap">
              <DarkModeToggle />
              <LanguageSwitcher />
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-honey-100 dark:border-gray-700 mt-2">
              <span className="text-sm text-gray-600 dark:text-gray-300 truncate">{user?.name}</span>
              <button
                onClick={onLogout}
                className="text-sm px-3 py-1.5 rounded-lg border border-honey-300 dark:border-gray-600"
              >
                {t.nav.logout}
              </button>
            </div>
          </div>
        )}
      </header>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">{children}</main>
    </div>
  );
}