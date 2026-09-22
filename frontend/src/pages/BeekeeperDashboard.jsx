import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import StatCard from '../components/StatCard';
import { hiveApi, batchApi } from '../services/api';
import { useLanguage } from '../hooks/useLanguage.jsx';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const STATUS_COLORS = { healthy: '#22c55e', medium_risk: '#f59e0b', high_risk: '#ef4444' };

export default function BeekeeperDashboard({ user, onLogout }) {
  const { t } = useLanguage();
  const [hives, setHives] = useState([]);
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([hiveApi.mine(), batchApi.mine()])
      .then(([hiveRes, batchRes]) => {
        setHives(hiveRes.data);
        setBatches(batchRes.data);
      })
      .finally(() => setLoading(false));
  }, []);

  const totalHives = hives.length;
  const healthy = hives.filter((h) => h.status === 'healthy').length;
  const atRisk = hives.filter((h) => h.status === 'high_risk').length;
  const totalHoney = batches.reduce((sum, b) => sum + Number(b.quantity), 0).toFixed(1);

  const healthPie = ['healthy', 'medium_risk', 'high_risk'].map((status) => ({
    name: status,
    value: hives.filter((h) => h.status === status).length,
  })).filter((d) => d.value > 0);

  const productionByBatch = batches.slice(0, 8).map((b) => ({ name: b.batch_id.split('-').pop(), kg: Number(b.quantity) }));

  return (
    <DashboardLayout user={user} onLogout={onLogout}>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-honey-900 dark:text-honey-100">{t.dash.welcome}, {user?.name?.split(' ')[0]}</h1>
        <div className="flex gap-2">
          <Link to="/hives" className="px-4 py-2 bg-white border border-honey-300 rounded-lg text-sm font-medium">{t.dash.addHive}</Link>
          <Link to="/batches/new" className="px-4 py-2 bg-honey-500 text-white rounded-lg text-sm font-medium">{t.dash.createBatch}</Link>
        </div>
      </div>

      {loading ? (
        <p className="text-gray-400 dark:text-gray-500">Loading dashboard…</p>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <StatCard label={t.dash.totalHives} value={totalHives} />
            <StatCard label={t.dash.healthy} value={healthy} accent="green" />
            <StatCard label={t.dash.atRisk} value={atRisk} accent="red" />
            <StatCard label={t.dash.honeyProducedKg} value={totalHoney} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-honey-100 dark:border-gray-700 p-5">
              <h3 className="font-semibold text-honey-900 dark:text-honey-100 mb-4">{t.dash.hiveHealthBreakdown}</h3>
              {healthPie.length === 0 ? (
                <p className="text-sm text-gray-400 dark:text-gray-500">{t.dash.noHives}</p>
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie data={healthPie} dataKey="value" nameKey="name" outerRadius={80} label>
                      {healthPie.map((entry) => (
                        <Cell key={entry.name} fill={STATUS_COLORS[entry.name]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-honey-100 dark:border-gray-700 p-5">
              <h3 className="font-semibold text-honey-900 dark:text-honey-100 mb-4">{t.dash.recentProduction}</h3>
              {productionByBatch.length === 0 ? (
                <p className="text-sm text-gray-400 dark:text-gray-500">{t.dash.noBatches}</p>
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={productionByBatch}>
                    <XAxis dataKey="name" fontSize={12} />
                    <YAxis fontSize={12} />
                    <Tooltip />
                    <Bar dataKey="kg" fill="#e8a317" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl border border-honey-100 dark:border-gray-700 p-5">
            <h3 className="font-semibold text-honey-900 dark:text-honey-100 mb-4">{t.dash.yourHives}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {hives.map((h) => (
                <Link
                  key={h.id} to={`/hives/${h.id}`}
                  className="border border-honey-100 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition"
                >
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-semibold text-honey-900 dark:text-honey-100">{h.hive_number}</span>
                    <span
                      className="text-xs font-medium px-2 py-0.5 rounded-full"
                      style={{ backgroundColor: STATUS_COLORS[h.status] + '22', color: STATUS_COLORS[h.status] }}
                    >
                      {h.status.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">{h.apiary_name}</p>
                  {h.latest_prediction && (
                    <p className="text-xs text-gray-600 dark:text-gray-300">
                      Risk: {h.latest_prediction.disease_risk}% · Yield: {h.latest_prediction.predicted_yield} kg
                    </p>
                  )}
                </Link>
              ))}
              {hives.length === 0 && <p className="text-sm text-gray-400 dark:text-gray-500">{t.dash.noHives}</p>}
            </div>
          </div>
        </>
      )}
    </DashboardLayout>
  );
}
