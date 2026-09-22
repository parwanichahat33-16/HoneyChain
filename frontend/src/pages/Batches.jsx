import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import { batchApi } from '../services/api';
import { useLanguage } from '../hooks/useLanguage.jsx';

const STATUS_STYLES = {
  harvested: 'bg-yellow-100 text-yellow-700',
  extracted: 'bg-blue-100 text-blue-700',
  processed: 'bg-purple-100 text-purple-700',
  packaged: 'bg-indigo-100 text-indigo-700',
  distributed: 'bg-green-100 text-green-700',
};

export default function Batches({ user, onLogout }) {
  const { t } = useLanguage();
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    batchApi.mine().then((res) => setBatches(res.data)).finally(() => setLoading(false));
  }, []);

  return (
    <DashboardLayout user={user} onLogout={onLogout}>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-honey-900 dark:text-honey-100">{t.batchesPage.title}</h1>
        <Link to="/batches/new" className="px-4 py-2 bg-honey-500 text-white rounded-lg text-sm font-medium">
          {t.batchesPage.createBatch}
        </Link>
      </div>

      <div className="flex gap-2 mb-4">
        <input
          placeholder={t.batchesPage.searchPlaceholder}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 max-w-sm border border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded-lg px-3 py-2 text-sm"
        />
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
          className="border border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded-lg px-3 py-2 text-sm">
          <option value="all">{t.common.allStatuses}</option>
          <option value="harvested">{t.batchesPage.harvested}</option>
          <option value="extracted">{t.batchesPage.extracted}</option>
          <option value="processed">{t.batchesPage.processed}</option>
          <option value="packaged">{t.batchesPage.packaged}</option>
          <option value="distributed">{t.batchesPage.distributed}</option>
        </select>
      </div>

      {loading ? (
        <p className="text-gray-400 dark:text-gray-500">{t.common.loading}</p>
      ) : batches.length === 0 ? (
        <p className="text-gray-400 dark:text-gray-500">{t.batchesPage.noBatches}</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {batches
            .filter((b) => statusFilter === 'all' || b.status === statusFilter)
            .filter((b) =>
              search.trim() === '' ||
              b.batch_id.toLowerCase().includes(search.toLowerCase()) ||
              b.hive_number.toLowerCase().includes(search.toLowerCase())
            )
            .map((b) => (
            <div key={b.batch_id} className="bg-white dark:bg-gray-800 rounded-xl border border-honey-100 dark:border-gray-700 p-4">
              <div className="flex justify-between items-start mb-2">
                <p className="font-mono font-semibold text-honey-900 dark:text-honey-100 text-sm">{b.batch_id}</p>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_STYLES[b.status] || 'bg-gray-100 text-gray-600 dark:text-gray-300'}`}>
                  {b.status}
                </span>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Hive {b.hive_number} · {Number(b.quantity)} kg</p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Harvested {new Date(b.harvest_date).toLocaleDateString()}</p>
              <div className="flex gap-2 mt-3">
                <Link to={`/batches/${b.batch_id}/traceability`} className="text-xs font-medium text-honey-600 border border-honey-300 rounded-lg px-3 py-1.5">
                  {t.batchesPage.traceability}
                </Link>
                <Link to={`/batches/${b.batch_id}/qr`} className="text-xs font-medium text-honey-600 border border-honey-300 rounded-lg px-3 py-1.5">
                  {t.batchesPage.qrCode}
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
