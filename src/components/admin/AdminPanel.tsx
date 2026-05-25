'use client';

import { useState, useMemo } from 'react';
import {
  Trash2, RefreshCw, AlertTriangle, CheckCircle, Database, Search, List,
} from 'lucide-react';
import { batchDeleteExpiredReports, fetchReports, deleteReport } from '@/lib/firestore';
import { useAppStore } from '@/store/useAppStore';
import { getCategoryMeta } from '@/utils/categories';

function timeAgo(ts: { toMillis: () => number }): string {
  const diff = Date.now() - ts.toMillis();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'Az önce';
  if (m < 60) return `${m}d`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}s`;
  return `${Math.floor(h / 24)}g`;
}

export default function AdminPanel() {
  const { setReports, reports, removeReportFromCache } = useAppStore();
  const [status, setStatus] = useState<'idle' | 'deleting' | 'done' | 'error'>('idle');
  const [deletedCount, setDeletedCount] = useState(0);
  const [loadingStats, setLoadingStats] = useState(false);
  const [search, setSearch] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function loadStats() {
    setLoadingStats(true);
    try {
      const data = await fetchReports(true);
      setReports(data);
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
      await loadStats();
    } catch (err) {
      console.error(err);
      setStatus('error');
    }
  }

  async function handleDeletePin(id: string) {
    if (!window.confirm('Bu pini silmek istediğinizden emin misiniz?')) return;
    setDeletingId(id);
    try {
      await deleteReport(id);
      removeReportFromCache(id);
    } catch (err) {
      console.error('Delete failed:', err);
    } finally {
      setDeletingId(null);
    }
  }

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return reports;
    return reports.filter(r =>
      r.username.toLowerCase().includes(q) ||
      r.title.toLowerCase().includes(q),
    );
  }, [reports, search]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Admin Paneli</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Firebase Spark kotasını yönet.
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

        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">{reports.length}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">Aktif Pin</div>
          </div>
          <div className="text-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-xl">
            <div className="text-3xl font-bold text-orange-600 dark:text-orange-400">
              {deletedCount > 0 ? deletedCount : '—'}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">Son Silinen</div>
          </div>
        </div>
      </div>

      {/* All pins list */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5">
        <h2 className="font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2 mb-4">
          <List className="w-4 h-4 text-blue-500" />
          Tüm Pinler
        </h2>

        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Kullanıcı adı veya başlık ara…"
            className="w-full pl-8 pr-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        {filtered.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-6">Sonuç yok.</p>
        ) : (
          <div className="space-y-1.5 max-h-96 overflow-y-auto">
            {filtered.slice(0, 100).map(r => {
              const meta = getCategoryMeta(r.category);
              return (
                <div
                  key={r.id}
                  className="flex items-center gap-3 px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-800/50 group"
                >
                  <span className="text-base flex-shrink-0">{meta.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-gray-900 dark:text-gray-100 truncate">
                      {r.title}
                    </p>
                    <p className="text-xs text-gray-400">
                      @{r.username} · {timeAgo(r.createdAt)}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDeletePin(r.id)}
                    disabled={deletingId === r.id}
                    className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 text-gray-400 hover:text-red-500 transition-all disabled:opacity-50 flex-shrink-0"
                    title="Sil"
                  >
                    {deletingId === r.id
                      ? <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      : <Trash2 className="w-3.5 h-3.5" />
                    }
                  </button>
                </div>
              );
            })}
            {filtered.length > 100 && (
              <p className="text-xs text-gray-400 text-center pt-1">
                İlk 100 gösteriliyor ({filtered.length} toplam)
              </p>
            )}
          </div>
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
          koşulunu karşılayan en fazla 500 belgeyi siler.
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
            Bir hata oluştu.
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
          <li>Pinler expiresAt sonrası client-side filtrelenir (onSnapshot sorgu filtresi)</li>
          <li>Gerçek Firestore silme işlemi toplu temizlik ile manuel tetiklenir</li>
          <li>Oy işlemleri tek batch write (2 belge): rapor + kullanıcı</li>
          <li>Resimler WebP ≤300 KB olarak sıkıştırılır</li>
          <li>Kullanıcılar saatlik 5 pin ile sınırlıdır (admin muaf)</li>
        </ul>
      </div>
    </div>
  );
}
