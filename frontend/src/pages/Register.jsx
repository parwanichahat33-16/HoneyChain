import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authApi } from '../services/api';
import { useLanguage } from '../hooks/useLanguage.jsx';
import LanguageSwitcher from '../components/LanguageSwitcher';

export default function Register({ onLogin }) {
  const { t } = useLanguage();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await authApi.register(form);
      onLogin(res.data.user, res.data.token);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-honey-50 dark:bg-gray-900 flex items-center justify-center px-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 w-full max-w-md border border-honey-100 dark:border-gray-700">
        <Link to="/" className="font-bold text-honey-900 dark:text-honey-100 text-lg mb-6 block">🐝 HoneyChain</Link>
        <div className="flex items-center justify-between mb-1">
          <h1 className="text-2xl font-bold text-honey-900 dark:text-honey-100">{t.registerPage.title}</h1>
          <LanguageSwitcher />
        </div>
        <p className="text-gray-500 dark:text-gray-400 mb-6 text-sm">{t.registerPage.subtitle}</p>

        {error && <p className="bg-red-50 text-red-600 text-sm rounded-lg px-3 py-2 mb-4">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700">{t.registerPage.fullName}</label>
            <input
              required value={form.name} onChange={(e) => update('name', e.target.value)}
              className="mt-1 w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-honey-400"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">{t.registerPage.email}</label>
            <input
              type="email" required value={form.email} onChange={(e) => update('email', e.target.value)}
              className="mt-1 w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-honey-400"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">{t.registerPage.password}</label>
            <input
              type="password" required minLength={6} value={form.password} onChange={(e) => update('password', e.target.value)}
              className="mt-1 w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-honey-400"
            />
          </div>
          <button
            type="submit" disabled={loading}
            className="w-full bg-honey-500 hover:bg-honey-600 text-white font-semibold py-2.5 rounded-lg"
          >
            {loading ? t.registerPage.creating : t.registerPage.create}
          </button>
        </form>

        <p className="text-sm text-gray-500 dark:text-gray-400 mt-6 text-center">
          {t.registerPage.haveAccount} <Link to="/login" className="text-honey-600 font-medium">{t.registerPage.login}</Link>
        </p>
      </div>
    </div>
  );
}
