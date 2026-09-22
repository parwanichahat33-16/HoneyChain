import { useEffect, useState } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import StatCard from '../components/StatCard';
import ClusterMap from '../components/ClusterMap';
import { adminApi } from '../services/api';
import { useLanguage } from '../hooks/useLanguage.jsx';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

const STATUS_COLORS = { healthy: '#22c55e', medium_risk: '#f59e0b', high_risk: '#ef4444' };

function downloadCsv(filename, rows) {
  if (!rows || rows.length === 0) return;
  const headers = Object.keys(rows[0]);
  const csvLines = [
    headers.join(','),
    ...rows.map((row) => headers.map((h) => `"${String(row[h]).replace(/"/g, '""')}"`).join(',')),
  ];
  const blob = new Blob([csvLines.join('\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export default function AdminDashboard({ user, onLogout }) {
  const { t } = useLanguage();
  const [stats, setStats] = useState(null);
  const [clusters, setClusters] = useState([]);
  const [hiveHealth, setHiveHealth] = useState([]);
  const [apiaryLocations, setApiaryLocations] = useState([]);
  const [flaggedHives, setFlaggedHives] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([adminApi.dashboard(), adminApi.clusters(), adminApi.hiveHealth(), adminApi.apiaryLocations(), adminApi.flaggedHives()])
      .then(([s, c, h, l, f]) => {
        setStats(s.data);
        setClusters(c.data);
        setHiveHealth(h.data.map((d) => ({ name: d.status, value: Number(d.count) })));
        setApiaryLocations(l.data);
        setFlaggedHives(f.data);
      })
      .finally(() => setLoading(false));
  }, []);

  function handleExportCsv() {
    downloadCsv(`honeychain-cluster-report-${new Date().toISOString().slice(0, 10)}.csv`, clusters);
  }

  function handleExportPdf() {
    window.print();
  }

  return (
    <DashboardLayout user={user} onLogout={onLogout}>
      <h1 className="text-2xl font-bold text-honey-900 dark:text-honey-100 mb-1">{t.admin.title}</h1>
      <div className="flex items-center justify-between mb-6">
        <p className="text-sm text-gray-500 dark:text-gray-400">{t.admin.subtitle}</p>
        <button onClick={handleExportPdf} className="text-xs font-medium border border-honey-300 rounded-lg px-3 py-1.5 print:hidden">
          🖨️ Export Full Dashboard (PDF)
        </button>
      </div>
      {loading || !stats ? (
        <p className="text-gray-400 dark:text-gray-500">Loading…</p>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <StatCard label={t.admin.totalBeekeepers} value={stats.totalBeekeepers.toLocaleString()} />
            <StatCard label={t.admin.totalApiaries} value={stats.totalApiaries.toLocaleString()} />
            <StatCard label={t.admin.activeHives} value={stats.activeHives.toLocaleString()} />
            <StatCard label={t.admin.atRiskHives} value={stats.atRiskHives.toLocaleString()} accent="red" />
            <StatCard label={t.admin.honeyProducedKg} value={stats.honeyProducedKg.toLocaleString()} />
            <StatCard label={t.admin.verifiedBatches} value={stats.verifiedBatches.toLocaleString()} accent="green" />
            <StatCard label={t.admin.totalBatches} value={stats.totalBatches.toLocaleString()} />
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl border border-honey-100 dark:border-gray-700 p-5 mb-8">
            <h3 className="font-semibold text-honey-900 dark:text-honey-100 mb-4">{t.admin.apiaryMap}</h3>
            <ClusterMap apiaries={apiaryLocations} />
          </div>

          {flaggedHives.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-5 mb-8">
              <h3 className="font-semibold text-red-700 mb-4">🚨 {t.admin.flaggedHives} ({flaggedHives.length})</h3>
              <button
                onClick={() => downloadCsv(`honeychain-flagged-hives-${new Date().toISOString().slice(0, 10)}.csv`, flaggedHives)}
                className="text-xs font-medium border border-red-300 text-red-700 rounded-lg px-3 py-1.5 mb-3 print:hidden"
              >
                Export CSV
              </button>
              <div className="space-y-2">
                {flaggedHives.map((h) => (
                  <div key={h.id} className="bg-white dark:bg-gray-800 rounded-lg p-3 flex items-center justify-between text-sm">
                    <div>
                      <p className="font-semibold text-honey-900 dark:text-honey-100">{h.hive_number} — {h.apiary_name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{h.beekeeper_name} · {h.cluster}</p>
                    </div>
                    <span className="text-red-600 font-semibold">
                      {h.disease_risk != null ? `${Number(h.disease_risk).toFixed(0)}% risk` : 'High Risk'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-honey-100 dark:border-gray-700 p-5">
              <h3 className="font-semibold text-honey-900 dark:text-honey-100 mb-4">{t.admin.clusterProduction}</h3>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={clusters}>
                  <XAxis dataKey="cluster" fontSize={12} />
                  <YAxis fontSize={12} />
                  <Tooltip />
                  <Bar dataKey="honey_kg" fill="#e8a317" radius={[4, 4, 0, 0]} name="Honey (kg)" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl border border-honey-100 dark:border-gray-700 p-5">
              <h3 className="font-semibold text-honey-900 dark:text-honey-100 mb-4">{t.admin.hiveHealthNational}</h3>
              {hiveHealth.length === 0 ? (
                <p className="text-sm text-gray-400 dark:text-gray-500">No hive data.</p>
              ) : (
                <ResponsiveContainer width="100%" height={260}>
                  <PieChart>
                    <Pie data={hiveHealth} dataKey="value" nameKey="name" outerRadius={90} label>
                      {hiveHealth.map((entry) => (
                        <Cell key={entry.name} fill={STATUS_COLORS[entry.name] || '#ccc'} />
                      ))}
                    </Pie>
                    <Legend />
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl border border-honey-100 dark:border-gray-700 p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-honey-900 dark:text-honey-100">{t.admin.clusterBreakdown}</h3>
              <button onClick={handleExportCsv} className="text-xs font-medium border border-honey-300 rounded-lg px-3 py-1.5">
                {t.admin.exportCsv}
              </button>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-400 dark:text-gray-500 border-b border-honey-100 dark:border-gray-700">
                  <th className="py-2">Cluster</th>
                  <th className="py-2">Apiaries</th>
                  <th className="py-2">Hives</th>
                  <th className="py-2">At Risk</th>
                  <th className="py-2">Honey (kg)</th>
                </tr>
              </thead>
              <tbody>
                {clusters.map((c) => (
                  <tr key={c.cluster} className="border-b border-honey-50">
                    <td className="py-2 font-medium text-honey-900 dark:text-honey-100">{c.cluster}</td>
                    <td className="py-2">{c.apiary_count}</td>
                    <td className="py-2">{c.hive_count}</td>
                    <td className="py-2 text-red-600">{c.at_risk_count}</td>
                    <td className="py-2">{Number(c.honey_kg).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </DashboardLayout>
  );
}
