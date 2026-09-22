import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import { batchApi } from '../services/api';
import { useLanguage } from '../hooks/useLanguage.jsx';

export default function QRGenerator({ user, onLogout }) {
  const { t } = useLanguage();
  const { batchId } = useParams();
  const [batch, setBatch] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    batchApi.mine().then((res) => {
      setBatch(res.data.find((b) => b.batch_id === batchId) || null);
    }).finally(() => setLoading(false));
  }, [batchId]);

  const verifyUrl = `${window.location.origin}/verify/${batchId}`;

  function handleDownload() {
    if (!batch?.qr_code) return;
    const link = document.createElement('a');
    link.href = batch.qr_code;
    link.download = `${batchId}-qr.png`;
    link.click();
  }

  return (
    <DashboardLayout user={user} onLogout={onLogout}>
      <Link to="/batches" className="text-sm text-honey-600">{t.qrPage.backToBatches}</Link>
      <h1 className="text-2xl font-bold text-honey-900 dark:text-honey-100 mt-1 mb-6">{t.qrPage.title}</h1>

      {loading ? (
        <p className="text-gray-400 dark:text-gray-500">{t.common.loading}</p>
      ) : !batch ? (
        <p className="text-gray-400 dark:text-gray-500">Batch not found.</p>
      ) : (
        <div className="max-w-sm bg-white dark:bg-gray-800 rounded-xl border border-honey-100 dark:border-gray-700 p-8 text-center">
          <p className="font-mono font-semibold text-honey-900 dark:text-honey-100 mb-4">{batch.batch_id}</p>
          {batch.qr_code ? (
            <img src={batch.qr_code} alt={`QR code for ${batchId}`} className="mx-auto mb-4 w-56 h-56" />
          ) : (
            <p className="text-sm text-gray-400 dark:text-gray-500 mb-4">{t.qrPage.noQr}</p>
          )}
          <p className="text-xs text-gray-400 dark:text-gray-500 break-all mb-6">{verifyUrl}</p>
          <div className="flex gap-3 justify-center">
            <button onClick={handleDownload} className="px-4 py-2 bg-honey-500 text-white rounded-lg text-sm font-medium">
              {t.qrPage.download}
            </button>
            <button onClick={() => window.print()} className="px-4 py-2 border border-honey-300 rounded-lg text-sm font-medium">
              {t.qrPage.print}
            </button>
          </div>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-6">
            {t.qrPage.attachNote}
          </p>
        </div>
      )}
    </DashboardLayout>
  );
}
