import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import { adminApi } from '../services/api';

export default function AuditLog({ user, onLogout }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    adminApi.auditLog().then((res) => setEvents(res.data)).finally(() => setLoading(false));
  }, []);

  const filtered = events.filter(
    (e) =>
      search.trim() === '' ||
      e.batch_id.toLowerCase().includes(search.toLowerCase()) ||
      e.beekeeper_name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DashboardLayout user={user} onLogout={onLogout}>
      <h1 className="text-2xl font-bold text-honey-900 dark:text-honey-100 mb-1">Blockchain Audit Log</h1>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
        Every traceability event recorded on-chain, most recent first. Each transaction hash is a
        tamper-evident proof that this event was recorded at this time — it does not certify
        chemical purity, only that the record has not been altered since.
      </p>

      <input
        placeholder="Search batch ID or beekeeper…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full max-w-sm border border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded-lg px-3 py-2 text-sm mb-4"
      />

      {loading ? (
        <p className="text-gray-400 dark:text-gray-500">Loading…</p>
      ) : filtered.length === 0 ? (
        <p className="text-gray-400 dark:text-gray-500">No on-chain events recorded yet.</p>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-honey-100 dark:border-gray-700 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-400 dark:text-gray-500 border-b border-honey-100 dark:border-gray-700 bg-honey-50">
                <th className="py-2 px-4">Batch</th>
                <th className="py-2 px-4">Event</th>
                <th className="py-2 px-4">Beekeeper</th>
                <th className="py-2 px-4">Location</th>
                <th className="py-2 px-4">Timestamp</th>
                <th className="py-2 px-4">Transaction</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((e, i) => (
                <tr key={i} className="border-b border-honey-50 last:border-0">
                  <td className="py-2 px-4 font-mono text-honey-900 dark:text-honey-100">
                    <Link to={`/batches/${e.batch_id}/traceability`} className="hover:underline">{e.batch_id}</Link>
                  </td>
                  <td className="py-2 px-4">{e.event_type}</td>
                  <td className="py-2 px-4">{e.beekeeper_name}</td>
                  <td className="py-2 px-4">{e.location}</td>
                  <td className="py-2 px-4">{new Date(e.timestamp).toLocaleString()}</td>
                  <td className="py-2 px-4 font-mono text-xs text-gray-500 dark:text-gray-400">
                    {e.blockchain_tx ? `${e.blockchain_tx.slice(0, 14)}…` : '— DB only'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </DashboardLayout>
  );
}
