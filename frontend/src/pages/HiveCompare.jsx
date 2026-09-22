import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import { hiveApi } from '../services/api';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const COLORS = ['#e8a317', '#3b82f6', '#22c55e'];
const STATUS_STYLES = { healthy: 'bg-green-100 text-green-700', medium_risk: 'bg-yellow-100 text-yellow-700', high_risk: 'bg-red-100 text-red-700' };

export default function HiveCompare({ user, onLogout }) {
  const [hives, setHives] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [details, setDetails] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    hiveApi.mine().then((res) => setHives(res.data)).finally(() => setLoading(false));
  }, []);

  function toggleHive(id) {
    setSelectedIds((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= 3) return prev; // max 3
      return [...prev, id];
    });
  }

  useEffect(() => {
    selectedIds.forEach((id) => {
      if (!details[id]) {
        hiveApi.details(id).then((res) => setDetails((d) => ({ ...d, [id]: res.data })));
      }
    });
  }, [selectedIds]); // eslint-disable-line react-hooks/exhaustive-deps

  // Merge sensor histories into one chart dataset keyed by reading index (not real time-aligned, just sequence)
  const maxLength = Math.max(0, ...selectedIds.map((id) => details[id]?.sensorHistory?.length || 0));
  const chartData = Array.from({ length: maxLength }, (_, i) => {
    const point = { index: i + 1 };
    selectedIds.forEach((id) => {
      const reading = details[id]?.sensorHistory?.[i];
      if (reading) point[`hive_${id}`] = Number(reading.weight);
    });
    return point;
  });

  return (
    <DashboardLayout user={user} onLogout={onLogout}>
      <h1 className="text-2xl font-bold text-honey-900 dark:text-honey-100 mb-1">Compare Hives</h1>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Select up to 3 hives to compare their health, yield, and weight trends.</p>

      {loading ? (
        <p className="text-gray-400 dark:text-gray-500">Loading…</p>
      ) : (
        <>
          <div className="flex flex-wrap gap-2 mb-6">
            {hives.map((h) => (
              <button
                key={h.id}
                onClick={() => toggleHive(h.id)}
                className={`text-sm px-3 py-1.5 rounded-lg border ${
                  selectedIds.includes(h.id) ? 'bg-honey-500 text-white border-honey-500' : 'border-honey-300 text-honey-900 dark:text-honey-100'
                }`}
              >
                {h.hive_number}
              </button>
            ))}
          </div>

          {selectedIds.length === 0 ? (
            <p className="text-gray-400 dark:text-gray-500">Select at least one hive above to begin comparing.</p>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                {selectedIds.map((id, i) => {
                  const d = details[id];
                  if (!d) return <p key={id} className="text-gray-400 dark:text-gray-500">Loading…</p>;
                  const latestPrediction = d.predictions[0];
                  return (
                    <div key={id} className="bg-white dark:bg-gray-800 rounded-xl border-2 p-4" style={{ borderColor: COLORS[i] }}>
                      <div className="flex justify-between items-center mb-2">
                        <Link to={`/hives/${id}`} className="font-semibold text-honey-900 dark:text-honey-100 hover:underline">{d.hive.hive_number}</Link>
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_STYLES[d.hive.status]}`}>
                          {d.hive.status.replace('_', ' ')}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">{d.hive.apiary_name}</p>
                      {latestPrediction && (
                        <div className="text-sm space-y-1">
                          <p>Disease Risk: <span className="font-semibold">{Number(latestPrediction.disease_risk).toFixed(0)}%</span></p>
                          <p>Predicted Yield: <span className="font-semibold">{Number(latestPrediction.predicted_yield).toFixed(1)} kg</span></p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl border border-honey-100 dark:border-gray-700 p-5">
                <h3 className="font-semibold text-honey-900 dark:text-honey-100 mb-4">Weight Trend Comparison</h3>
                {chartData.length === 0 ? (
                  <p className="text-sm text-gray-400 dark:text-gray-500">No sensor data yet for the selected hives.</p>
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={chartData}>
                      <XAxis dataKey="index" fontSize={11} label={{ value: 'Reading #', position: 'insideBottom', offset: -2 }} />
                      <YAxis fontSize={11} label={{ value: 'Weight (kg)', angle: -90, position: 'insideLeft' }} />
                      <Tooltip />
                      <Legend />
                      {selectedIds.map((id, i) => (
                        <Line key={id} type="monotone" dataKey={`hive_${id}`} stroke={COLORS[i]} dot={false}
                          name={details[id]?.hive?.hive_number || id} />
                      ))}
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </div>
            </>
          )}
        </>
      )}
    </DashboardLayout>
  );
}
