import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useLanguage } from '../hooks/useLanguage.jsx';
import LanguageSwitcher from '../components/LanguageSwitcher';
import DarkModeToggle from '../components/DarkModeToggle';
import InstallButton from '../components/InstallButton';

export default function Landing({ user }) {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [lookupId, setLookupId] = useState('');
  const dashboardLink = user?.role === 'admin' ? '/admin' : '/dashboard';

  function handleLookup(e) {
    e.preventDefault();
    if (lookupId.trim()) navigate(`/verify/${lookupId.trim()}`);
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-honey-50 to-white dark:from-gray-900 dark:to-gray-900">
      <header className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-5 flex items-center justify-between gap-2 flex-wrap">
        <div className="font-bold text-lg sm:text-xl text-honey-900 dark:text-honey-100 whitespace-nowrap">🐝 HoneyChain</div>
        <nav className="flex items-center gap-2 sm:gap-4 flex-wrap justify-end">
          <DarkModeToggle />
          <LanguageSwitcher />
          {user ? (
            <Link to={dashboardLink} className="px-3 sm:px-4 py-2 rounded-lg bg-honey-500 text-white font-medium text-sm sm:text-base whitespace-nowrap">
              {t.goToDashboard}
            </Link>
          ) : (
            <>
              <Link to="/login" className="text-honey-900 dark:text-honey-100 font-medium text-sm sm:text-base whitespace-nowrap">{t.beekeeperLogin}</Link>
              <Link to="/register" className="px-3 sm:px-4 py-2 rounded-lg bg-honey-500 text-white font-medium text-sm sm:text-base whitespace-nowrap">
                {t.getStarted}
              </Link>
            </>
          )}
        </nav>
      </header>

      <section className="max-w-4xl mx-auto text-center px-4 sm:px-6 py-12 sm:py-20">
        <h1 className="text-3xl sm:text-5xl font-extrabold text-honey-900 dark:text-honey-100 mb-4">HoneyChain</h1>
        <p className="text-lg sm:text-xl text-honey-600 font-medium mb-6">"{t.tagline}"</p>
        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-10">{t.subtitle}</p>
        <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
          <Link to="/verify/demo" className="px-6 py-3 rounded-xl bg-honey-900 text-white font-semibold shadow-lg text-sm sm:text-base">
            {t.verifyHoney}
          </Link>
                    <Link to="/login" className="px-6 py-3 rounded-xl border-2 border-honey-500 text-honey-900 dark:text-honey-100 font-semibold text-sm sm:text-base">
            {t.beekeeperLogin}
          </Link>
          <InstallButton />
        </div>

        <form onSubmit={handleLookup} className="mt-8 max-w-sm mx-auto flex flex-col sm:flex-row gap-2">
          <input
            value={lookupId}
            onChange={(e) => setLookupId(e.target.value)}
            placeholder="Lost your QR? Enter batch ID"
            className="flex-1 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded-lg px-3 py-2 text-sm min-w-0"
          />
          <button type="submit" className="text-sm font-medium bg-honey-900 text-white rounded-lg px-4 py-2 whitespace-nowrap">
            Look up
          </button>
        </form>
      </section>

      <section className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center justify-center gap-3 sm:gap-4">
          {t.journey.map((step, i) => (
            <div key={step} className="flex items-center gap-2 sm:gap-4">
              <div className="bg-white dark:bg-gray-800 border-2 border-honey-300 dark:border-gray-600 rounded-full px-4 sm:px-5 py-2 sm:py-3 font-semibold text-honey-900 dark:text-honey-100 shadow-sm text-sm sm:text-base whitespace-nowrap">
                {step}
              </div>
              {i < t.journey.length - 1 && (
                <span className="hidden sm:inline text-honey-400 text-2xl">&rarr;</span>
              )}
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-6">
        {t.benefits.map((b) => (
          <div key={b.title} className="bg-white dark:bg-gray-800 rounded-xl border border-honey-100 dark:border-gray-700 shadow-sm p-5 sm:p-6 text-center">
            <div className="text-3xl mb-3">{b.icon}</div>
            <h3 className="font-semibold text-honey-900 dark:text-honey-100 mb-2 text-sm sm:text-base">{b.title}</h3>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">{b.desc}</p>
          </div>
        ))}
      </section>

      <footer className="text-center text-xs sm:text-sm text-gray-400 py-8 px-4">
        Built for Smart India Hackathon 2026 — SIH26021 · <Link to="/about" className="underline">How it works</Link>
      </footer>
    </div>
  );
}