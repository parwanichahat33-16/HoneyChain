import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authApi } from '../services/api';
import { useLanguage } from '../hooks/useLanguage.jsx';
import LanguageSwitcher from '../components/LanguageSwitcher';

export default function Login({ onLogin }) {
  const { t } = useLanguage();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await authApi.login(email, password);
      onLogin(res.data.user, res.data.token, rememberMe);
      navigate(res.data.user.role === 'admin' ? '/admin' : '/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-honey-50 dark:bg-gray-900 flex items-center justify-center px-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 w-full max-w-md border border-honey-100 dark:border-gray-700">
        <Link to="/" className="font-bold text-honey-900 dark:text-honey-100 text-lg mb-6 block">🐝 HoneyChain</Link>
        <div className="flex items-center justify-between mb-1">
          <h1 className="text-2xl font-bold text-honey-900 dark:text-honey-100">{t.loginPage.welcome}</h1>
          <LanguageSwitcher />
        </div>
        <p className="text-gray-500 dark:text-gray-400 mb-6 text-sm">{t.loginPage.subtitle}</p>

        {error && <p className="bg-red-50 text-red-600 text-sm rounded-lg px-3 py-2 mb-4">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700">{t.loginPage.email}</label>
            <input
              type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-honey-400"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">{t.loginPage.password}</label>
            <input
              type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-honey-400"
            />
          </div>
          <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
            <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} />
            Remember me on this device
          </label>
          <button
            type="submit" disabled={loading}
            className="w-full bg-honey-500 hover:bg-honey-600 text-white font-semibold py-2.5 rounded-lg"
          >
            {loading ? t.loginPage.loggingIn : t.loginPage.login}
          </button>
        </form>

        <p className="text-sm text-gray-500 dark:text-gray-400 mt-6 text-center">
          {t.loginPage.noAccount} <Link to="/register" className="text-honey-600 font-medium">{t.loginPage.register}</Link>
        </p>
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-4 text-center">
          Demo: admin@honeychain.gov.in / admin123 &nbsp;|&nbsp; rajesh.patel@honeychain.in / password123
        </p>
      </div>
    </div>
  );
}
