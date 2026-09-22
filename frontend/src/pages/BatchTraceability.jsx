import { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import { batchApi, verifyApi } from '../services/api';
import { useLanguage } from '../hooks/useLanguage.jsx';

const EVENT_FLOW = ['HARVESTED', 'EXTRACTED', 'PROCESSED', 'PACKAGED', 'DISTRIBUTED'];

export default function BatchTraceability({ user, onLogout }) {
  const { t } = useLanguage();
  const { batchId } = useParams();
  const [data, setData] = useState(null);
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');
  const [adding, setAdding] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    verifyApi.verify(batchId).then((res) => setData(res.data)).finally(() => setLoading(false));
  }, [batchId]);

  useEffect(load, [load]);

  const completedEvents = data?.traceability.map((e) => e.event_type) || [];
  const nextEvent = EVENT_FLOW.find((e) => !completedEvents.includes(e));

  async function handleAddEvent(e) {
    e.preventDefault();
    if (!nextEvent) return;
    setAdding(true);
    try {
      await batchApi.addEvent(batchId, { event_type: nextEvent, location, notes });
      setLocation('');
      setNotes('');
      load();
    } finally {
      setAdding(false);
    }
  }

  if (loading || !data) {
    return (
      <DashboardLayout user={user} onLogout={onLogout}>
        <p className="text-gray-400 dark:text-gray-500">Loading traceability…</p>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout user={user} onLogout={onLogout}>
      <Link to="/batches" className="text-sm text-honey-600">{t.qrPage.backToBatches}</Link>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-honey-900 dark:text-honey-100 mt-1 mb-1 font-mono">{batchId}</h1>
        <button onClick={() => window.print()} className="text-xs font-medium border border-honey-300 rounded-lg px-3 py-1.5 print:hidden">
          🖨️ Export as PDF
        </button>
      </div>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">{data.batch.apiary} · {data.batch.hive} · {data.batch.quantity} kg</p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl border border-honey-100 dark:border-gray-700 p-6">
          <h3 className="font-semibold text-honey-900 dark:text-honey-100 mb-5">{t.traceabilityPage.timeline}</h3>
          <div className="space-y-0">
            {EVENT_FLOW.map((step, i) => {
              const event = data.traceability.find((e) => e.event_type === step);
              const done = !!event;
              return (
                <div key={step} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                      done ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-400 dark:text-gray-500'
                    }`}>
                      {done ? '✓' : i + 1}
                    </div>
                    {i < EVENT_FLOW.length - 1 && <div className={`w-0.5 h-12 ${done ? 'bg-green-300' : 'bg-gray-200'}`} />}
                  </div>
                  <div className="pb-8">
                    <p className={`font-semibold ${done ? 'text-honey-900 dark:text-honey-100' : 'text-gray-400 dark:text-gray-500'}`}>{step}</p>
                    {event ? (
                      <>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{new Date(event.timestamp).toLocaleDateString()} · {event.location}</p>
                        {event.blockchain_tx && (
                          <p className="text-xs text-honey-600 font-mono mt-0.5">tx: {event.blockchain_tx.slice(0, 18)}…</p>
                        )}
                      </>
                    ) : (
                      <p className="text-sm text-gray-400 dark:text-gray-500">{t.traceabilityPage.notRecorded}</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl border border-honey-100 dark:border-gray-700 p-6 h-fit">
          {nextEvent ? (
            <form onSubmit={handleAddEvent} className="space-y-4">
              <h3 className="font-semibold text-honey-900 dark:text-honey-100">{t.traceabilityPage.recordNextStep} {nextEvent}</h3>
              <div>
                <label className="text-sm font-medium text-gray-700">{t.traceabilityPage.location}</label>
                <input required value={location} onChange={(e) => setLocation(e.target.value)}
                  className="mt-1 w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded-lg px-3 py-2" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">{t.traceabilityPage.notes}</label>
                <textarea value={notes} onChange={(e) => setNotes(e.target.value)}
                  className="mt-1 w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded-lg px-3 py-2" rows={2} />
              </div>
              <button type="submit" disabled={adding}
                className="w-full bg-honey-500 text-white font-semibold py-2 rounded-lg">
                {adding ? t.traceabilityPage.recordingBtn : `${t.traceabilityPage.recordBtn} ${nextEvent} ${t.traceabilityPage.onBlockchain}`}
              </button>
            </form>
          ) : (
            <p className="text-sm text-green-600 font-medium">{t.traceabilityPage.fullHistory}</p>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
