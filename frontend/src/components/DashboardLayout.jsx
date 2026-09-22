import { Link, useLocation } from 'react-router-dom';
import { useLanguage } from '../hooks/useLanguage.jsx';
import LanguageSwitcher from './LanguageSwitcher';
import DarkModeToggle from './DarkModeToggle';

export default function DashboardLayout({ user, onLogout, children }) {
  const location = useLocation();
  const { t } = useLanguage();

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
      <header className="bg-white border-b border-honey-100 dark:border-gray-700 sticky top-0 z-10 print:hidden">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 font-bold text-honey-900 dark:text-honey-100 text-lg">
            🐝 HoneyChain
          </Link>
          <nav className="flex items-center gap-1">
            {links.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                className={`px-3 py-2 rounded-lg text-sm font-medium ${
                  location.pathname === l.to
                    ? 'bg-honey-500 text-white'
                    : 'text-honey-900 dark:text-honey-100 hover:bg-honey-100'
                }`}
              >
                {l.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            <DarkModeToggle />
            <LanguageSwitcher />
            <span className="text-sm text-gray-600 dark:text-gray-300">{user?.name}</span>
            <button
              onClick={onLogout}
              className="text-sm px-3 py-1.5 rounded-lg border border-honey-300 hover:bg-honey-100"
            >
              {t.nav.logout}
            </button>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-6 py-8">{children}</main>
    </div>
  );
}
