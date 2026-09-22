import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import { hiveApi, batchApi } from '../services/api';
import { useLanguage } from '../hooks/useLanguage.jsx';

const CLUSTERS = ['Ahmedabad', 'Rajkot', 'Junagadh', 'Banaskantha'];

export default function CreateBatch({ user, onLogout }) {
  const { t } = useLanguage();
  const [hives, setHives] = useState([]);
  const [form, setForm] = useState({
    hive_id: '', harvest_date: '', quantity: '', honey_type: 'Raw Wildflower Honey', location: '', cluster: CLUSTERS[0],
  });
  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    hiveApi.mine().then((res) => {
      setHives(res.data);
      if (res.data.length > 0) setForm((f) => ({ ...f, hive_id: res.data[0].id }));
    });
  }, []);

  function validate() {
    if (!form.hive_id) return 'Please select a hive.';
    if (!form.harvest_date) return 'Please enter a harvest date.';
    if (new Date(form.harvest_date) > new Date()) return 'Harvest date cannot be in the future.';
    if (!form.quantity || Number(form.quantity) <= 0) return 'Quantity must be a positive number.';
    if (!form.location.trim()) return 'Please enter a harvest location.';
    return '';
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }
    setSaving(true);
    try {
      const res = await batchApi.create(form);
      setResult(res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create batch');
    } finally {
      setSaving(false);
    }
  }

  if (result) {
    return (
      <DashboardLayout user={user} onLogout={onLogout}>
        <div className="max-w-lg mx-auto bg-white dark:bg-gray-800 rounded-xl border border-honey-100 dark:border-gray-700 p-8 text-center">
          <div className="text-4xl mb-3">✅</div>
          <h1 className="text-xl font-bold text-honey-900 dark:text-honey-100 mb-2">{t.createBatchPage.batchCreated}</h1>
          <p className="font-mono text-honey-700 text-lg mb-4">{result.batch.batch_id}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
            {result.blockchain?.txHash
              ? `Recorded on-chain (tx ${result.blockchain.txHash.slice(0, 12)}…)`
              : 'Blockchain not configured — batch saved in database only.'}
          </p>
          <div className="flex gap-3 justify-center">
            <button onClick={() => navigate(`/batches/${result.batch.batch_id}/traceability`)}
              className="px-4 py-2 bg-honey-500 text-white rounded-lg text-sm font-medium">
              {t.createBatchPage.addEvents}
            </button>
            <button onClick={() => navigate(`/batches/${result.batch.batch_id}/qr`)}
              className="px-4 py-2 border border-honey-300 rounded-lg text-sm font-medium">
              {t.createBatchPage.generateQr}
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout user={user} onLogout={onLogout}>
      <h1 className="text-2xl font-bold text-honey-900 dark:text-honey-100 mb-6">{t.createBatchPage.title}</h1>

      <form onSubmit={handleSubmit} className="max-w-lg bg-white dark:bg-gray-800 rounded-xl border border-honey-100 dark:border-gray-700 p-6 space-y-4">
        {error && <p className="bg-red-50 text-red-600 text-sm rounded-lg px-3 py-2">{error}</p>}

        <div>
          <label className="text-sm font-medium text-gray-700">{t.createBatchPage.hive}</label>
          <select required value={form.hive_id} onChange={(e) => setForm({ ...form, hive_id: e.target.value })}
            className="mt-1 w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded-lg px-3 py-2">
            {hives.map((h) => <option key={h.id} value={h.id}>{h.hive_number} — {h.apiary_name}</option>)}
          </select>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700">{t.createBatchPage.harvestDate}</label>
          <input required type="date" value={form.harvest_date} onChange={(e) => setForm({ ...form, harvest_date: e.target.value })}
            className="mt-1 w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded-lg px-3 py-2" />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700">{t.createBatchPage.quantity}</label>
          <input required type="number" step="0.1" min="0.1" value={form.quantity}
            onChange={(e) => setForm({ ...form, quantity: e.target.value })}
            className="mt-1 w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded-lg px-3 py-2" />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700">{t.createBatchPage.honeyType}</label>
          <input value={form.honey_type} onChange={(e) => setForm({ ...form, honey_type: e.target.value })}
            className="mt-1 w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded-lg px-3 py-2" />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700">{t.createBatchPage.clusterLabel}</label>
          <select value={form.cluster} onChange={(e) => setForm({ ...form, cluster: e.target.value })}
            className="mt-1 w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded-lg px-3 py-2">
            {CLUSTERS.map((c) => <option key={c} value={c}>{t.clusters[c]}</option>)}
          </select>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700">{t.createBatchPage.harvestLocation}</label>
          <input required value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })}
            placeholder="e.g. Ahmedabad, Gujarat"
            className="mt-1 w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded-lg px-3 py-2" />
        </div>

        <button type="submit" disabled={saving || hives.length === 0}
          className="w-full bg-honey-500 text-white font-semibold py-2.5 rounded-lg disabled:opacity-50">
          {saving ? t.createBatchPage.creating : t.createBatchPage.submit}
        </button>
        {hives.length === 0 && <p className="text-xs text-red-500">{t.createBatchPage.registerHiveFirst}</p>}
      </form>
    </DashboardLayout>
  );
}
