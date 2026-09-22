import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { verifyApi, feedbackApi } from '../services/api';
import { useLanguage } from '../hooks/useLanguage.jsx';
import LanguageSwitcher from '../components/LanguageSwitcher';

const EVENT_ICONS = {
  HARVESTED: '🌾', EXTRACTED: '🍯', PROCESSED: '⚙️', PACKAGED: '📦', DISTRIBUTED: '🚚',
};

export default function ConsumerVerify() {
  const { batchId } = useParams();
  const { t } = useLanguage();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [chainDetails, setChainDetails] = useState(null);
  const [chainLoading, setChainLoading] = useState(false);
  const [chainError, setChainError] = useState('');
  const [showChainDetails, setShowChainDetails] = useState(false);
  const [feedbackData, setFeedbackData] = useState(null);
  const [myRating, setMyRating] = useState(0);
  const [myComment, setMyComment] = useState('');
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  useEffect(() => {
    verifyApi.verify(batchId)
      .then((res) => setData(res.data))
      .catch((err) => setError(err.response?.data?.error || 'Unable to verify this batch.'))
      .finally(() => setLoading(false));
    feedbackApi.get(batchId).then((res) => setFeedbackData(res.data)).catch(() => {});
  }, [batchId]);

  async function handleSubmitFeedback(e) {
    e.preventDefault();
    if (myRating === 0) return;
    await feedbackApi.submit(batchId, { rating: myRating, comment: myComment });
    setFeedbackSubmitted(true);
    feedbackApi.get(batchId).then((res) => setFeedbackData(res.data));
  }

  async function handleVerifyBlockchain() {
    if (showChainDetails) {
      setShowChainDetails(false);
      return;
    }
    setShowChainDetails(true);
    if (chainDetails) return; // already fetched
    setChainLoading(true);
    setChainError('');
    try {
      const res = await verifyApi.blockchainDetails(batchId);
      setChainDetails(res.data);
    } catch (err) {
      setChainError(err.response?.data?.error || 'Could not fetch on-chain record.');
    } finally {
      setChainLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-honey-50 dark:bg-gray-900">
      <header className="max-w-3xl mx-auto px-6 py-6 flex items-center justify-between print:hidden">
        <Link to="/" className="font-bold text-xl text-honey-900 dark:text-honey-100">🐝 HoneyChain</Link>
        <div className="flex items-center gap-3">
          <LanguageSwitcher />
          <button onClick={() => window.print()} className="text-sm font-medium border border-honey-300 rounded-lg px-3 py-1.5">
            🖨️ Print / Save as PDF
          </button>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 pb-16">
        {loading ? (
          <p className="text-center text-gray-400 dark:text-gray-500 py-20">{t.verifying}</p>
        ) : error ? (
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-red-200 p-10 text-center">
            <div className="text-4xl mb-3">❌</div>
            <h1 className="text-xl font-bold text-red-600 mb-2">{t.verificationFailed}</h1>
            <p className="text-gray-500 dark:text-gray-400">{error}</p>
          </div>
        ) : (
          <>
            <div className="text-center mb-8">
              <div className="inline-block bg-green-100 text-green-700 font-semibold px-4 py-2 rounded-full text-sm mb-3">
                ✓ {t.verified}
              </div>
              <br />
              <div className="inline-block bg-honey-100 text-honey-800 font-semibold px-4 py-2 rounded-full text-sm mb-4">
                🛡️ Trust Score: {data.traceability.length}/5 steps · {data.blockchain.hashVerified ? 'Blockchain Verified' : 'Not on-chain'}
              </div>
              <p className="font-mono text-lg text-honey-900 dark:text-honey-100">{data.batch.batchId}</p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-honey-100 dark:border-gray-700 p-6 mb-6 grid grid-cols-2 gap-4 text-sm">
              <div><p className="text-gray-400 dark:text-gray-500">{t.beekeeper}</p><p className="font-semibold text-honey-900 dark:text-honey-100">{data.batch.beekeeper}</p></div>
              <div><p className="text-gray-400 dark:text-gray-500">{t.apiary}</p><p className="font-semibold text-honey-900 dark:text-honey-100">{data.batch.apiary}</p></div>
              <div><p className="text-gray-400 dark:text-gray-500">{t.harvestDate}</p><p className="font-semibold text-honey-900 dark:text-honey-100">{new Date(data.batch.harvestDate).toLocaleDateString()}</p></div>
              <div><p className="text-gray-400 dark:text-gray-500">{t.quantity}</p><p className="font-semibold text-honey-900 dark:text-honey-100">{data.batch.quantity} kg</p></div>
              <div><p className="text-gray-400 dark:text-gray-500">{t.honeyType}</p><p className="font-semibold text-honey-900 dark:text-honey-100">{data.batch.honeyType}</p></div>
              <div><p className="text-gray-400 dark:text-gray-500">{t.hive}</p><p className="font-semibold text-honey-900 dark:text-honey-100">{data.batch.hive}</p></div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-honey-100 dark:border-gray-700 p-6 mb-6">
              <h3 className="font-semibold text-honey-900 dark:text-honey-100 mb-4">{t.timeline}</h3>
              <div className="space-y-4">
                {data.traceability.map((e, i) => (
                  <div key={i} className="flex gap-3 items-start">
                    <span className="text-xl">{EVENT_ICONS[e.event_type] || '•'}</span>
                    <div>
                      <p className="font-medium text-honey-900 dark:text-honey-100">{e.event_type}</p>
                      <p className="text-xs text-gray-400 dark:text-gray-500">
                        {new Date(e.timestamp).toLocaleDateString()} · {e.location}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {data.hiveHealthSummary && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl border border-honey-100 dark:border-gray-700 p-6 mb-6">
                <h3 className="font-semibold text-honey-900 dark:text-honey-100 mb-2">{t.healthSummary}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 capitalize">Status: {data.hiveHealthSummary.status.replace('_', ' ')}</p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">{data.hiveHealthSummary.note}</p>
              </div>
            )}

            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-honey-100 dark:border-gray-700 p-6">
              <h3 className="font-semibold text-honey-900 dark:text-honey-100 mb-3">{t.blockchainStatus}</h3>
              <ul className="text-sm space-y-1 mb-3">
                <li>{data.blockchain.recordFound ? '✓' : '✗'} {t.recordFound}</li>
                <li>{data.blockchain.hashVerified ? '✓' : '✗'} {t.hashVerified}</li>
                <li>✓ {t.traceabilityIntact}</li>
              </ul>
              <p className="text-xs text-gray-400 dark:text-gray-500 mb-4">{data.blockchain.trustNote}</p>

              <button
                onClick={handleVerifyBlockchain}
                className="w-full text-sm font-medium border border-honey-300 text-honey-700 rounded-lg py-2"
              >
                {showChainDetails ? t.hideBlockchain : t.verifyBlockchain}
              </button>

              {showChainDetails && (
                <div className="mt-4 bg-honey-50 rounded-lg p-4 text-xs font-mono break-all space-y-2">
                  {chainLoading ? (
                    <p className="text-gray-400 dark:text-gray-500 font-sans">Fetching on-chain record…</p>
                  ) : chainError ? (
                    <p className="text-gray-400 dark:text-gray-500 font-sans">{chainError}</p>
                  ) : chainDetails ? (
                    <>
                      <p><span className="text-gray-400 dark:text-gray-500 font-sans">Recorded by:</span> {chainDetails.recordedBy}</p>
                      <p><span className="text-gray-400 dark:text-gray-500 font-sans">Recorded at:</span> {new Date(chainDetails.timestamp).toLocaleString()}</p>
                      <p><span className="text-gray-400 dark:text-gray-500 font-sans">Integrity hash:</span> {chainDetails.dataHash}</p>
                      <div className="pt-2">
                        <p className="text-gray-400 dark:text-gray-500 font-sans mb-1">On-chain events ({chainDetails.onChainEvents?.length || 0}):</p>
                        {chainDetails.onChainEvents?.map((e, i) => (
                          <p key={i} className="ml-2">
                            {e.eventType} — {new Date(e.timestamp).toLocaleDateString()} — hash {e.dataHash.slice(0, 18)}…
                          </p>
                        ))}
                      </div>
                    </>
                  ) : null}
                </div>
              )}
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-honey-100 dark:border-gray-700 p-6 mt-6 print:hidden">
              <h3 className="font-semibold text-honey-900 dark:text-honey-100 mb-3">Was this honey what you expected?</h3>
              {feedbackData?.averageRating && (
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                  ⭐ {feedbackData.averageRating} average ({feedbackData.count} review{feedbackData.count === 1 ? '' : 's'})
                </p>
              )}
              {feedbackSubmitted ? (
                <p className="text-sm text-green-600">Thanks for your feedback!</p>
              ) : (
                <form onSubmit={handleSubmitFeedback} className="space-y-3">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <button
                        key={n} type="button" onClick={() => setMyRating(n)}
                        className={`text-2xl ${n <= myRating ? 'opacity-100' : 'opacity-30'}`}
                      >
                        ⭐
                      </button>
                    ))}
                  </div>
                  <textarea
                    value={myComment} onChange={(e) => setMyComment(e.target.value)}
                    placeholder="Optional comment…"
                    className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded-lg px-3 py-2 text-sm" rows={2}
                  />
                  <button type="submit" disabled={myRating === 0}
                    className="text-sm font-medium bg-honey-500 text-white rounded-lg px-4 py-2 disabled:opacity-50">
                    Submit Feedback
                  </button>
                </form>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
