import { useEffect, useState, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import { hiveApi } from '../services/api';
import { useLanguage } from '../hooks/useLanguage.jsx';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const STATUS_STYLES = {
  healthy: 'bg-green-100 text-green-700',
  medium_risk: 'bg-yellow-100 text-yellow-700',
  high_risk: 'bg-red-100 text-red-700',
};

export default function HiveDetail({ user, onLogout }) {
  const { t } = useLanguage();
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [batchHistory, setBatchHistory] = useState([]);
  const [weather, setWeather] = useState(null);
  const [weatherError, setWeatherError] = useState('');
  const [simulating, setSimulating] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({ hive_number: '', installation_date: '' });
  const [saving, setSaving] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const navigate = useNavigate();

  const load = useCallback(() => {
    hiveApi.details(id).then((res) => setData(res.data)).finally(() => setLoading(false));
    hiveApi.batchHistory(id).then((res) => setBatchHistory(res.data));
    hiveApi.weather(id)
      .then((res) => setWeather(res.data))
      .catch((err) => setWeatherError(err.response?.data?.error || 'Weather unavailable'));
  }, [id]);

  useEffect(load, [load]);

  function startEdit() {
    setEditForm({
      hive_number: data.hive.hive_number,
      installation_date: data.hive.installation_date?.slice(0, 10) || '',
    });
    setEditing(true);
  }

  async function saveEdit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      await hiveApi.update(id, editForm);
      setEditing(false);
      load();
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    setDeleteError('');
    try {
      await hiveApi.remove(id);
      navigate('/hives');
    } catch (err) {
      setDeleteError(err.response?.data?.error || 'Failed to delete hive');
    }
  }

  async function simulate(abnormal) {
    setSimulating(true);
    try {
      await hiveApi.simulate(id, abnormal);
      load();
    } finally {
      setSimulating(false);
    }
  }

  if (loading || !data) {
    return (
      <DashboardLayout user={user} onLogout={onLogout}>
        <p className="text-gray-400 dark:text-gray-500">Loading hive…</p>
      </DashboardLayout>
    );
  }

  const { hive, sensorHistory, predictions, alerts } = data;
  const latestPrediction = predictions[0];

  const chartData = sensorHistory.map((s) => ({
    time: new Date(s.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    temperature: Number(s.temperature),
    weight: Number(s.weight),
    acoustic: Number(s.acoustic_level),
  }));

  return (
    <DashboardLayout user={user} onLogout={onLogout}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <Link to="/hives" className="text-sm text-honey-600">{t.hiveDetailPage.backToHives}</Link>
          <h1 className="text-2xl font-bold text-honey-900 dark:text-honey-100 mt-1">Hive {hive.hive_number}</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">{hive.apiary_name} · {hive.cluster}</p>
        </div>
        <div className="flex items-center gap-3">
          <span className={`text-sm font-semibold px-3 py-1.5 rounded-full ${STATUS_STYLES[hive.status]}`}>
            {hive.status.replace('_', ' ').toUpperCase()}
          </span>
          {user?.role === 'beekeeper' && (
            <>
              <button onClick={startEdit} className="text-sm px-3 py-1.5 rounded-lg border border-honey-300">
                {t.common.edit}
              </button>
              <button onClick={handleDelete} className="text-sm px-3 py-1.5 rounded-lg border border-red-300 text-red-600">
                {t.common.delete}
              </button>
            </>
          )}
        </div>
      </div>

      {deleteError && (
        <div className="bg-red-50 text-red-600 text-sm rounded-lg px-3 py-2 mb-4">{deleteError}</div>
      )}

      {editing && (
        <form onSubmit={saveEdit} className="bg-white dark:bg-gray-800 rounded-xl border border-honey-100 dark:border-gray-700 p-4 mb-6 flex gap-3 items-end">
          <div>
            <label className="text-xs font-medium text-gray-700">Hive Number</label>
            <input required value={editForm.hive_number}
              onChange={(e) => setEditForm({ ...editForm, hive_number: e.target.value })}
              className="mt-1 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded-lg px-3 py-1.5 text-sm" />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-700">Installation Date</label>
            <input required type="date" value={editForm.installation_date}
              onChange={(e) => setEditForm({ ...editForm, installation_date: e.target.value })}
              className="mt-1 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded-lg px-3 py-1.5 text-sm" />
          </div>
          <button type="submit" disabled={saving} className="bg-honey-500 text-white text-sm font-medium px-4 py-1.5 rounded-lg">
            {saving ? '…' : t.common.save}
          </button>
          <button type="button" onClick={() => setEditing(false)} className="text-sm px-4 py-1.5 rounded-lg border border-gray-300">
            {t.common.cancel}
          </button>
        </form>
      )}

      {user?.role === 'beekeeper' && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-honey-100 dark:border-gray-700 p-4 mb-6 flex items-center justify-between">
          <div>
            <p className="font-medium text-honey-900 dark:text-honey-100">{t.hiveDetailPage.simulatedSensors}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{t.hiveDetailPage.simulateDesc}</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => simulate(false)} disabled={simulating}
              className="px-4 py-2 rounded-lg border border-honey-300 text-sm font-medium disabled:opacity-50">
              {t.hiveDetailPage.simulateNormal}
            </button>
            <button onClick={() => simulate(true)} disabled={simulating}
              className="px-4 py-2 rounded-lg bg-red-500 text-white text-sm font-medium disabled:opacity-50">
              {t.hiveDetailPage.simulateAnomaly}
            </button>
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-honey-100 dark:border-gray-700 p-4 mb-6 flex items-center gap-6">
        <span className="text-3xl">🌤️</span>
        {weather ? (
          <div className="flex gap-6 text-sm">
            <div><p className="text-gray-400 dark:text-gray-500">Temperature</p><p className="font-semibold text-honey-900 dark:text-honey-100">{weather.temperature}°C</p></div>
            <div><p className="text-gray-400 dark:text-gray-500">Humidity</p><p className="font-semibold text-honey-900 dark:text-honey-100">{weather.humidity}%</p></div>
            <div><p className="text-gray-400 dark:text-gray-500">Wind</p><p className="font-semibold text-honey-900 dark:text-honey-100">{weather.windSpeed} km/h</p></div>
            <div><p className="text-gray-400 dark:text-gray-500">Source</p><p className="font-semibold text-honey-900 dark:text-honey-100">{weather.source}</p></div>
          </div>
        ) : (
          <p className="text-sm text-gray-400 dark:text-gray-500">{weatherError || 'Loading live weather for this apiary…'}</p>
        )}
      </div>

      {latestPrediction && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-honey-100 dark:border-gray-700 p-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">{t.hiveDetailPage.aiRisk}</p>
            <p className="text-2xl font-bold text-honey-900 dark:text-honey-100">{Number(latestPrediction.disease_risk).toFixed(0)}%</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-honey-100 dark:border-gray-700 p-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">{t.hiveDetailPage.predictedYield}</p>
            <p className="text-2xl font-bold text-honey-900 dark:text-honey-100">{Number(latestPrediction.predicted_yield).toFixed(1)} kg</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-honey-100 dark:border-gray-700 p-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">{t.hiveDetailPage.latestWeight}</p>
            <p className="text-2xl font-bold text-honey-900 dark:text-honey-100">
              {sensorHistory.length ? Number(sensorHistory[sensorHistory.length - 1].weight).toFixed(1) : '—'} kg
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-honey-100 dark:border-gray-700 p-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">{t.hiveDetailPage.healthStatus}</p>
            <p className="text-2xl font-bold text-honey-900 dark:text-honey-100 capitalize">{latestPrediction.health_status.replace('_', ' ')}</p>
          </div>
        </div>
      )}

      {latestPrediction?.recommendation && (
        <div className="bg-honey-100 border border-honey-300 rounded-xl p-4 mb-6 text-sm text-honey-900 dark:text-honey-100">
          <strong>{t.hiveDetailPage.recommendation}:</strong> {latestPrediction.recommendation}
          <p className="text-xs text-honey-700 mt-1">
            {t.hiveDetailPage.aiNote}
          </p>
        </div>
      )}

      {alerts.length > 0 && (
        <div className="mb-6 space-y-2">
          {alerts.map((a) => (
            <div key={a.id} className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm">
              <p className="font-semibold text-red-700">🚨 {a.severity.toUpperCase()} RISK ALERT</p>
              <p className="text-red-600 mt-1">{a.message}</p>
              {a.recommendation && <p className="text-red-500 mt-1 text-xs">Recommended Action: {a.recommendation}</p>}
              {a.notified_channels?.length > 0 && (
                <div className="flex gap-2 mt-2">
                  {a.notified_channels.includes('email') && (
                    <span className="text-xs bg-white border border-red-300 text-red-600 rounded-full px-2 py-0.5">📧 Email sent (simulated)</span>
                  )}
                  {a.notified_channels.includes('whatsapp') && (
                    <span className="text-xs bg-white border border-red-300 text-red-600 rounded-full px-2 py-0.5">💬 WhatsApp sent (simulated)</span>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-honey-100 dark:border-gray-700 p-5">
        <h3 className="font-semibold text-honey-900 dark:text-honey-100 mb-4">{t.hiveDetailPage.sensorTrends}</h3>
        {chartData.length === 0 ? (
          <p className="text-sm text-gray-400 dark:text-gray-500">{t.hiveDetailPage.noReadings}</p>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={chartData}>
              <XAxis dataKey="time" fontSize={11} />
              <YAxis fontSize={11} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="temperature" stroke="#ef4444" dot={false} name="Temp (°C)" />
              <Line type="monotone" dataKey="weight" stroke="#e8a317" dot={false} name="Weight (kg)" />
              <Line type="monotone" dataKey="acoustic" stroke="#3b82f6" dot={false} name="Acoustic" />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-honey-100 dark:border-gray-700 p-5 mt-6">
        <h3 className="font-semibold text-honey-900 dark:text-honey-100 mb-4">{t.hiveDetailPage.batchHistoryTitle}</h3>
        {batchHistory.length === 0 ? (
          <p className="text-sm text-gray-400 dark:text-gray-500">{t.hiveDetailPage.noBatchHistory}</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-400 dark:text-gray-500 border-b border-honey-100 dark:border-gray-700">
                <th className="py-2">{t.hiveDetailPage.batchId}</th>
                <th className="py-2">{t.hiveDetailPage.harvestDate}</th>
                <th className="py-2">{t.hiveDetailPage.quantity}</th>
                <th className="py-2">{t.hiveDetailPage.status}</th>
                <th className="py-2">{t.hiveDetailPage.blockchain}</th>
              </tr>
            </thead>
            <tbody>
              {batchHistory.map((b) => (
                <tr key={b.batch_id} className="border-b border-honey-50">
                  <td className="py-2 font-mono text-honey-900 dark:text-honey-100">
                    <Link to={`/batches/${b.batch_id}/traceability`} className="hover:underline">{b.batch_id}</Link>
                  </td>
                  <td className="py-2">{new Date(b.harvest_date).toLocaleDateString()}</td>
                  <td className="py-2">{Number(b.quantity)} kg</td>
                  <td className="py-2 capitalize">{b.status}</td>
                  <td className="py-2">{b.blockchain_hash ? t.hiveDetailPage.onChain : t.hiveDetailPage.dbOnly}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </DashboardLayout>
  );
}
