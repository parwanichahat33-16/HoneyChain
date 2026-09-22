import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import { hiveApi, apiaryApi } from '../services/api';
import { useLanguage } from '../hooks/useLanguage.jsx';

const STATUS_STYLES = {
  healthy: 'bg-green-100 text-green-700',
  medium_risk: 'bg-yellow-100 text-yellow-700',
  high_risk: 'bg-red-100 text-red-700',
};

export default function Hives({ user, onLogout }) {
  const { t } = useLanguage();
  const [hives, setHives] = useState([]);
  const [apiaries, setApiaries] = useState([]);
  const [form, setForm] = useState({ hive_number: '', apiary_id: '', installation_date: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  function load() {
    Promise.all([hiveApi.mine(), apiaryApi.mine()]).then(([h, a]) => {
      setHives(h.data);
      setApiaries(a.data);
      if (a.data.length > 0 && !form.apiary_id) setForm((f) => ({ ...f, apiary_id: a.data[0].id }));
    }).finally(() => setLoading(false));
  }
  useEffect(load, []);

  const [error, setError] = useState('');

  async function handleCreate(e) {
    e.preventDefault();
    setSaving(true);
    try {
      await hiveApi.create(form);
      setForm({ ...form, hive_number: '' });
      load();
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(e, hiveId) {
    e.preventDefault();
    e.stopPropagation();
    setError('');
    try {
      await hiveApi.remove(hiveId);
      load();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete hive');
    }
  }

  return (
    <DashboardLayout user={user} onLogout={onLogout}>
      <h1 className="text-2xl font-bold text-honey-900 dark:text-honey-100 mb-6">{t.hivesPage.title}</h1>
      {error && <div className="bg-red-50 text-red-600 text-sm rounded-lg px-3 py-2 mb-4 max-w-2xl">{error}</div>}
      <div className="mb-4">
        <Link to="/hives/compare" className="text-sm font-medium text-honey-600 border border-honey-300 rounded-lg px-3 py-1.5">
          📊 Compare Hives
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <form onSubmit={handleCreate} className="bg-white dark:bg-gray-800 rounded-xl border border-honey-100 dark:border-gray-700 p-5 space-y-4 h-fit">
          <h3 className="font-semibold text-honey-900 dark:text-honey-100">{t.hivesPage.registerNew}</h3>
          <div>
            <label className="text-sm font-medium text-gray-700">{t.hivesPage.hiveNumber}</label>
            <input required placeholder="e.g. H001" value={form.hive_number}
              onChange={(e) => setForm({ ...form, hive_number: e.target.value })}
              className="mt-1 w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded-lg px-3 py-2" />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">{t.hivesPage.apiary}</label>
            <select required value={form.apiary_id} onChange={(e) => setForm({ ...form, apiary_id: e.target.value })}
              className="mt-1 w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded-lg px-3 py-2">
              {apiaries.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
            </select>
            {apiaries.length === 0 && <p className="text-xs text-red-500 mt-1">{t.hivesPage.registerApiaryFirst}</p>}
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">{t.hivesPage.installationDate}</label>
            <input required type="date" value={form.installation_date}
              onChange={(e) => setForm({ ...form, installation_date: e.target.value })}
              className="mt-1 w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded-lg px-3 py-2" />
          </div>
          <button type="submit" disabled={saving || apiaries.length === 0}
            className="w-full bg-honey-500 text-white font-semibold py-2 rounded-lg disabled:opacity-50">
            {saving ? t.apiariesPage.saving : t.hivesPage.addHive}
          </button>
        </form>

        <div className="lg:col-span-2 space-y-3">
          <div className="flex gap-2 mb-1">
            <input
              placeholder={t.hivesPage.searchPlaceholder}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded-lg px-3 py-2 text-sm"
            />
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded-lg px-3 py-2 text-sm">
              <option value="all">{t.common.allStatuses}</option>
              <option value="healthy">{t.common.healthy}</option>
              <option value="medium_risk">{t.common.mediumRisk}</option>
              <option value="high_risk">{t.common.highRisk}</option>
            </select>
          </div>

          {loading ? (
            <p className="text-gray-400 dark:text-gray-500">{t.common.loading}</p>
          ) : hives.length === 0 ? (
            <p className="text-gray-400 dark:text-gray-500">{t.hivesPage.noHives}</p>
          ) : (
            hives
              .filter((h) => statusFilter === 'all' || h.status === statusFilter)
              .filter((h) =>
                search.trim() === '' ||
                h.hive_number.toLowerCase().includes(search.toLowerCase()) ||
                h.apiary_name.toLowerCase().includes(search.toLowerCase())
              )
              .map((h) => (
              <Link key={h.id} to={`/hives/${h.id}`}
                className="bg-white dark:bg-gray-800 rounded-xl border border-honey-100 dark:border-gray-700 p-4 flex justify-between items-center hover:shadow-md transition block">
                <div>
                  <p className="font-semibold text-honey-900 dark:text-honey-100">{h.hive_number}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{h.apiary_name} · {h.cluster}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-medium px-3 py-1 rounded-full ${STATUS_STYLES[h.status]}`}>
                    {h.status.replace('_', ' ')}
                  </span>
                  <button onClick={(e) => handleDelete(e, h.id)}
                    className="text-xs px-2.5 py-1.5 rounded-lg border border-red-300 text-red-600">
                    {t.common.delete}
                  </button>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
