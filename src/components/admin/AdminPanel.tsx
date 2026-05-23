'use client';

import { useState } from 'react';
import { Trash2, RefreshCw, AlertTriangle, CheckCircle, Database } from 'lucide-react';
import { batchDeleteExpiredReports, fetchReports } from '@/lib/firestore';
import { useAppStore } from '@/store/useAppStore';

export default function AdminPanel() {
  const { setReports } = useAppStore();
  const [status, setStatus] = useState<'idle' | 'deleting' | 'done' | 'error'>('idle');
  const [deletedCount, setDeletedCount] = useState(0);
  const [totalCount, setTotalCount] = useState<number | null>(null);
  const [loadingStats, setLoadingStats] = useState(false);

  async function loadStats() {
    setLoadingStats(true);
    try {
      const reports = await fetchReports(true);
      setTotalCount(reports.length);
      setReports(reports);
    } finally {
      setLoadingStats(false);
    }
  }

  async function handleBatchDelete() {
    setStatus('deleting');
    try {
      const count = await batchDeleteExpiredReports();
      setDeletedCount(count);
      setStatus('done');
      // Refresh stats
      await loadStats();
    } catch (err) {
      console.error(err);
      setStatus('error');
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Admin Paneli</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Firebase Spark kotasını yönet. Süresi dolmuş pinleri toplu sil.
        </p>
      </div>

      {/* Stats card */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <Database className="w-4 h-4 text-blue-500" />
            Veritabanı İstatistikleri
          </h2>
          <button
            onClick={loadStats}
            disabled={loadingStats}
            className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 text-gray-500 ${loadingStats ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {totalCount !== null ? (
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">{totalCount}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">Aktif Pin (≤7 gün)</div>
            </div>
            <div className="text-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-xl">
              <div className="text-3xl font-bold text-orange-600 dark:text-orange-400">
                {deletedCount > 0 ? deletedCount : '—'}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">Son Silinen</div>
            </div>
          </div>
        ) : (
          <button
            onClick={loadStats}
            className="w-full py-3 text-sm text-blue-500 hover:underline"
          >
            İstatistikleri yükle
          </button>
        )}
      </div>

      {/* Batch delete card */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-red-200 dark:border-red-900/50 p-5">
        <h2 className="font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2 mb-2">
          <Trash2 className="w-4 h-4 text-red-500" />
          Süresi Dolmuş Pinleri Temizle
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          <code className="bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded text-xs">expiresAt &lt;= now</code>{' '}
          koşulunu karşılayan en fazla 500 belgeyi tek batch write ile siler. Cloud Function kullanılmaz.
        </p>

        {status === 'done' && (
          <div className="flex items-center gap-2 text-green-600 dark:text-green-400 text-sm mb-3 bg-green-50 dark:bg-green-900/20 rounded-xl px-3 py-2">
            <CheckCircle className="w-4 h-4" />
            {deletedCount} pin silindi.
          </div>
        )}

        {status === 'error' && (
          <div className="flex items-center gap-2 text-red-600 dark:text-red-400 text-sm mb-3 bg-red-50 dark:bg-red-900/20 rounded-xl px-3 py-2">
            <AlertTriangle className="w-4 h-4" />
            Bir hata oluştu. Konsolu kontrol edin.
          </div>
        )}

        <button
          onClick={handleBatchDelete}
          disabled={status === 'deleting'}
          className="w-full flex items-center justify-center gap-2 py-3 bg-red-500 hover:bg-red-600 text-white font-semibold text-sm rounded-xl transition-colors disabled:opacity-50"
        >
          {status === 'deleting' ? (
            <><RefreshCw className="w-4 h-4 animate-spin" /> Siliniyor…</>
          ) : (
            <><Trash2 className="w-4 h-4" /> Toplu Temizlik Başlat</>
          )}
        </button>
      </div>

      {/* Info */}
      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-2xl p-4">
        <h3 className="text-sm font-semibold text-yellow-800 dark:text-yellow-400 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4" />
          Firebase Spark Kota Notları
        </h3>
        <ul className="mt-2 space-y-1 text-xs text-yellow-700 dark:text-yellow-500 list-disc list-inside">
          <li>Pinler 7 gün sonra otomatik gizlenir (client-side TTL filtresi)</li>
          <li>Gerçek Firestore silme işlemi bu butonla manuel tetiklenir</li>
          <li>Session cache 5 dk. — her filtre değişiminde okuma yapılmaz</li>
          <li>Oy işlemleri tek batch write (2 belge): rapor + kullanıcı</li>
          <li>Resimler WebP ≤300 KB olarak sıkıştırılır yüklenmeden önce</li>
        </ul>
      </div>
    </div>
  );
}
