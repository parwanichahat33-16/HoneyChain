import { useEffect, useState } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { apiaryApi } from '../services/api';
import { useLanguage } from '../hooks/useLanguage.jsx';

const CLUSTERS = ['Ahmedabad', 'Rajkot', 'Junagadh', 'Banaskantha'];

export default function Apiaries({ user, onLogout }) {
  const { t } = useLanguage();
  const [apiaries, setApiaries] = useState([]);
  const [form, setForm] = useState({ name: '', location: '', cluster: CLUSTERS[0] });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', location: '', cluster: CLUSTERS[0] });
  const [error, setError] = useState('');

  function load() {
    apiaryApi.mine().then((res) => setApiaries(res.data)).finally(() => setLoading(false));
  }
  useEffect(load, []);

  async function handleCreate(e) {
    e.preventDefault();
    setSaving(true);
    try {
      await apiaryApi.create(form);
      setForm({ name: '', location: '', cluster: CLUSTERS[0] });
      load();
    } finally {
      setSaving(false);
    }
  }

  function startEdit(a) {
    setEditingId(a.id);
    setEditForm({ name: a.name, location: a.location, cluster: a.cluster });
    setError('');
  }

  async function saveEdit(id) {
    try {
      await apiaryApi.update(id, editForm);
      setEditingId(null);
      load();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update apiary');
    }
  }

  async function handleDelete(id) {
    setError('');
    try {
      await apiaryApi.remove(id);
      load();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete apiary');
    }
  }

  return (
    <DashboardLayout user={user} onLogout={onLogout}>
      <h1 className="text-2xl font-bold text-honey-900 dark:text-honey-100 mb-6">{t.apiariesPage.title}</h1>

      {error && <div className="bg-red-50 text-red-600 text-sm rounded-lg px-3 py-2 mb-4 max-w-2xl">{error}</div>}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <form onSubmit={handleCreate} className="bg-white dark:bg-gray-800 rounded-xl border border-honey-100 dark:border-gray-700 p-5 space-y-4 h-fit">
          <h3 className="font-semibold text-honey-900 dark:text-honey-100">{t.apiariesPage.registerNew}</h3>
          <div>
            <label className="text-sm font-medium text-gray-700">{t.apiariesPage.name}</label>
            <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="mt-1 w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded-lg px-3 py-2" />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">{t.apiariesPage.location}</label>
            <input required value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })}
              className="mt-1 w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded-lg px-3 py-2" placeholder={t.apiariesPage.locationPlaceholder} />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">{t.apiariesPage.cluster}</label>
            <select value={form.cluster} onChange={(e) => setForm({ ...form, cluster: e.target.value })}
              className="mt-1 w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded-lg px-3 py-2">
              {CLUSTERS.map((c) => <option key={c} value={c}>{t.clusters[c]}</option>)}
            </select>
          </div>
          <button type="submit" disabled={saving} className="w-full bg-honey-500 text-white font-semibold py-2 rounded-lg">
            {saving ? t.apiariesPage.saving : t.apiariesPage.addApiary}
          </button>
        </form>

        <div className="lg:col-span-2 space-y-3">
          {loading ? (
            <p className="text-gray-400 dark:text-gray-500">{t.common.loading}</p>
          ) : apiaries.length === 0 ? (
            <p className="text-gray-400 dark:text-gray-500">{t.apiariesPage.noApiaries}</p>
          ) : (
            apiaries.map((a) =>
              editingId === a.id ? (
                <div key={a.id} className="bg-white dark:bg-gray-800 rounded-xl border border-honey-300 p-4 flex flex-wrap gap-3 items-end">
                  <div>
                    <label className="text-xs font-medium text-gray-700">Name</label>
                    <input value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      className="mt-1 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded-lg px-3 py-1.5 text-sm" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-700">Location</label>
                    <input value={editForm.location} onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                      className="mt-1 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded-lg px-3 py-1.5 text-sm" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-700">Cluster</label>
                    <select value={editForm.cluster} onChange={(e) => setEditForm({ ...editForm, cluster: e.target.value })}
                      className="mt-1 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded-lg px-3 py-1.5 text-sm">
                      {CLUSTERS.map((c) => <option key={c} value={c}>{t.clusters[c]}</option>)}
                    </select>
                  </div>
                  <button onClick={() => saveEdit(a.id)} className="bg-honey-500 text-white text-sm font-medium px-4 py-1.5 rounded-lg">
                    Save
                  </button>
                  <button onClick={() => setEditingId(null)} className="text-sm px-4 py-1.5 rounded-lg border border-gray-300">
                    Cancel
                  </button>
                </div>
              ) : (
                <div key={a.id} className="bg-white dark:bg-gray-800 rounded-xl border border-honey-100 dark:border-gray-700 p-4 flex justify-between items-center">
                  <div>
                    <p className="font-semibold text-honey-900 dark:text-honey-100">{a.name}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{a.location} · {a.cluster}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium bg-honey-100 text-honey-700 px-3 py-1 rounded-full">
                      {a.hive_count} {t.apiariesPage.hivesCount}
                    </span>
                    <button onClick={() => startEdit(a)} className="text-xs px-2.5 py-1.5 rounded-lg border border-honey-300">
                      {t.common.edit}
                    </button>
                    <button onClick={() => handleDelete(a.id)} className="text-xs px-2.5 py-1.5 rounded-lg border border-red-300 text-red-600">
                      {t.common.delete}
                    </button>
                  </div>
                </div>
              )
            )
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
