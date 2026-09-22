import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import { hiveApi } from '../services/api';
import { useLanguage } from '../hooks/useLanguage.jsx';

const SEVERITY_STYLES = {
  high: 'bg-red-50 border-red-200 text-red-700',
  medium: 'bg-yellow-50 border-yellow-200 text-yellow-700',
  low: 'bg-green-50 border-green-200 text-green-700',
};

export default function Alerts({ user, onLogout }) {
  const { t } = useLanguage();
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('unresolved'); // 'unresolved' | 'all'

  function load() {
    hiveApi.myAlerts().then((res) => setAlerts(res.data)).finally(() => setLoading(false));
  }
  useEffect(load, []);

  async function handleResolve(alertId) {
    await hiveApi.resolveAlert(alertId);
    load();
  }

  const visible = filter === 'unresolved' ? alerts.filter((a) => !a.is_resolved) : alerts;

  return (
    <DashboardLayout user={user} onLogout={onLogout}>
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-2xl font-bold text-honey-900 dark:text-honey-100">{t.alertsPage.title}</h1>
        <div className="flex gap-2 text-sm">
          <button
            onClick={() => setFilter('unresolved')}
            className={`px-3 py-1.5 rounded-lg ${filter === 'unresolved' ? 'bg-honey-500 text-white' : 'border border-honey-300'}`}
          >
            {t.alertsPage.unresolved}
          </button>
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-lg ${filter === 'all' ? 'bg-honey-500 text-white' : 'border border-honey-300'}`}
          >
            {t.alertsPage.all}
          </button>
        </div>
      </div>
      <p className="text-xs text-gray-400 dark:text-gray-500 mb-6">{t.alertsPage.simulatedNote}</p>

      {loading ? (
        <p className="text-gray-400 dark:text-gray-500">{t.common.loading}</p>
      ) : visible.length === 0 ? (
        <p className="text-gray-400 dark:text-gray-500">
          {filter === 'unresolved' ? t.alertsPage.noUnresolved : t.alertsPage.noAlerts}
        </p>
      ) : (
        <div className="space-y-3">
          {visible.map((a) => (
            <div key={a.id} className={`border rounded-xl p-4 ${SEVERITY_STYLES[a.severity] || 'bg-gray-50 border-gray-200'}`}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-semibold">
                    🚨 {a.severity.toUpperCase()} — Hive <Link to={`/hives/${a.hive_id}`} className="underline">{a.hive_number}</Link>
                  </p>
                  <p className="text-sm mt-1">{a.message}</p>
                  {a.recommendation && <p className="text-xs mt-1 opacity-80">Recommended: {a.recommendation}</p>}
                  {a.notified_channels && a.notified_channels.length > 0 && (
                    <div className="flex gap-2 mt-2">
                      {a.notified_channels.includes('email') && (
                        <span className="text-xs bg-white border border-current rounded-full px-2 py-0.5">📧 Email sent</span>
                      )}
                      {a.notified_channels.includes('whatsapp') && (
                        <span className="text-xs bg-white border border-current rounded-full px-2 py-0.5">💬 WhatsApp sent</span>
                      )}
                    </div>
                  )}
                  <p className="text-xs mt-2 opacity-60">
                    {a.apiary_name} · {a.cluster} · {new Date(a.created_at).toLocaleString()}
                  </p>
                </div>
                {!a.is_resolved && (
                  <button
                    onClick={() => handleResolve(a.id)}
                    className="text-xs font-medium bg-white border border-current rounded-lg px-3 py-1.5 whitespace-nowrap"
                  >
                    {t.alertsPage.markResolved}
                  </button>
                )}
                {a.is_resolved && <span className="text-xs font-medium opacity-60 whitespace-nowrap">✓ {t.alertsPage.resolved}</span>}
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
