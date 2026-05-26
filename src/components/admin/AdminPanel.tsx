'use client';

import { useState, useMemo, useCallback } from 'react';
import {
  Trash2, RefreshCw, AlertTriangle, CheckCircle, Database,
  Search, Users, Megaphone, BarChart3, Ban, UserCheck,
  Save, Loader2, Wrench, Pencil,
} from 'lucide-react';
import {
  batchDeleteExpiredReports, fetchReports, deleteReport, updateReport,
  updateSiteConfig, fetchAllUsers, banUser, unbanUser,
  batchDeleteByCategory, batchDeleteByUser,
} from '@/lib/firestore';
import { useAppStore } from '@/store/useAppStore';
import { getCategoryMeta, CATEGORIES } from '@/utils/categories';
import { UserProfile, SiteConfig, CategoryType } from '@/types';

type Tab = 'dashboard' | 'announcement' | 'pins' | 'users';

function timeAgo(ts: { toMillis: () => number }): string {
  const diff = Date.now() - ts.toMillis();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'Az önce';
  if (m < 60) return `${m}dk`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}s`;
  return `${Math.floor(h / 24)}g`;
}

const ANNOUNCE_TYPES: { value: SiteConfig['announcementType']; label: string; color: string }[] = [
  { value: 'info', label: 'Bilgi', color: 'bg-blue-500' },
  { value: 'warning', label: 'Uyarı', color: 'bg-amber-500' },
  { value: 'error', label: 'Acil', color: 'bg-red-500' },
  { value: 'success', label: 'Başarı', color: 'bg-green-500' },
];

// ── Dashboard Tab ────────────────────────────────────────────────────────────

function DashboardTab() {
  const { reports, setReports } = useAppStore();
  const [loading, setLoading] = useState(false);
  const [cleanStatus, setCleanStatus] = useState<'idle' | 'running' | 'done' | 'error'>('idle');
  const [cleanedCount, setCleanedCount] = useState(0);

  const catCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    reports.forEach(r => { counts[r.category] = (counts[r.category] ?? 0) + 1; });
    return counts;
  }, [reports]);

  async function refresh() {
    setLoading(true);
    try {
      const data = await fetchReports(true);
      setReports(data);
    } finally { setLoading(false); }
  }

  async function handleClean() {
    setCleanStatus('running');
    try {
      const n = await batchDeleteExpiredReports();
      setCleanedCount(n);
      setCleanStatus('done');
      const data = await fetchReports(true);
      setReports(data);
    } catch { setCleanStatus('error'); }
  }

  return (
    <div className="space-y-5">
      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-3">
        <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-900/20 text-center">
          <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">{reports.length}</div>
          <div className="text-xs text-gray-500 mt-1">Aktif Pin</div>
        </div>
        <div className="p-4 rounded-2xl bg-purple-50 dark:bg-purple-900/20 text-center">
          <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
            {Object.keys(catCounts).length}
          </div>
          <div className="text-xs text-gray-500 mt-1">Aktif Kategori</div>
        </div>
      </div>

      {/* Category breakdown */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-sm text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-blue-500" />
            Kategoriye Göre
          </h3>
          <button
            onClick={refresh}
            disabled={loading}
            className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <RefreshCw className={`w-4 h-4 text-gray-400 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
        {CATEGORIES.map(cat => {
          const count = catCounts[cat.id] ?? 0;
          const pct = reports.length > 0 ? (count / reports.length) * 100 : 0;
          return (
            <div key={cat.id} className="flex items-center gap-2 py-1.5">
              <span className="text-base w-6 text-center flex-shrink-0">{cat.emoji}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-0.5">
                  <span className="text-xs text-gray-700 dark:text-gray-300 truncate">{cat.label}</span>
                  <span className="text-xs font-bold text-gray-600 dark:text-gray-400 ml-2">{count}</span>
                </div>
                <div className="h-1.5 rounded-full bg-gray-100 dark:bg-gray-800">
                  <div
                    className="h-1.5 rounded-full transition-all duration-500"
                    style={{ width: `${pct}%`, backgroundColor: cat.color }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Cleanup expired */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-red-200 dark:border-red-900/50 p-4">
        <h3 className="font-semibold text-sm text-gray-900 dark:text-gray-100 flex items-center gap-2 mb-2">
          <Trash2 className="w-4 h-4 text-red-500" />
          Süresi Dolmuş Pinleri Temizle
        </h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
          <code className="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded">expiresAt ≤ şimdi</code> koşulunu karşılayan en fazla 500 belge silinir.
        </p>
        {cleanStatus === 'done' && (
          <div className="flex items-center gap-2 text-green-600 dark:text-green-400 text-xs mb-2 bg-green-50 dark:bg-green-900/20 rounded-xl px-3 py-2">
            <CheckCircle className="w-3.5 h-3.5" />
            {cleanedCount} pin silindi.
          </div>
        )}
        {cleanStatus === 'error' && (
          <div className="flex items-center gap-2 text-red-600 text-xs mb-2 bg-red-50 dark:bg-red-900/20 rounded-xl px-3 py-2">
            <AlertTriangle className="w-3.5 h-3.5" />
            Bir hata oluştu.
          </div>
        )}
        <button
          onClick={handleClean}
          disabled={cleanStatus === 'running'}
          className="w-full flex items-center justify-center gap-2 py-2.5 bg-red-500 hover:bg-red-600 text-white font-semibold text-sm rounded-xl transition-colors disabled:opacity-50"
        >
          {cleanStatus === 'running'
            ? <><RefreshCw className="w-4 h-4 animate-spin" />Temizleniyor…</>
            : <><Trash2 className="w-4 h-4" />Toplu Temizlik Başlat</>}
        </button>
      </div>
    </div>
  );
}

// ── Announcement Tab ─────────────────────────────────────────────────────────

function AnnouncementTab() {
  const siteConfig = useAppStore(s => s.siteConfig);
  const setSiteConfig = useAppStore(s => s.setSiteConfig);

  const defaults: SiteConfig = {
    announcementEnabled: false,
    announcementText: '',
    announcementType: 'info',
    maintenanceMode: false,
    maintenanceMessage: '',
  };

  const cfg = siteConfig ?? defaults;
  const [form, setForm] = useState<SiteConfig>({ ...defaults, ...cfg });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleSave() {
    setSaving(true);
    setSaved(false);
    try {
      await updateSiteConfig(form);
      setSiteConfig(form);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } finally { setSaving(false); }
  }

  const ANNOUNCE_PREVIEW_STYLES: Record<SiteConfig['announcementType'], string> = {
    info: 'bg-blue-50 dark:bg-blue-950/60 text-blue-800 dark:text-blue-200 border-blue-200',
    warning: 'bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-200 border-amber-200',
    error: 'bg-red-50 dark:bg-red-950/60 text-red-800 dark:text-red-200 border-red-200',
    success: 'bg-green-50 dark:bg-green-950/60 text-green-800 dark:text-green-200 border-green-200',
  };
  const ICONS: Record<SiteConfig['announcementType'], string> = { info: 'ℹ️', warning: '⚠️', error: '🚨', success: '✅' };

  return (
    <div className="space-y-5">
      {/* Announcement section */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-4 space-y-4">
        <h3 className="font-semibold text-sm text-gray-900 dark:text-gray-100 flex items-center gap-2">
          <Megaphone className="w-4 h-4 text-blue-500" />
          Duyuru Bandı
        </h3>

        {/* Enable toggle */}
        <label className="flex items-center justify-between cursor-pointer">
          <span className="text-sm text-gray-700 dark:text-gray-300">Duyuruyu Etkinleştir</span>
          <div
            onClick={() => setForm(f => ({ ...f, announcementEnabled: !f.announcementEnabled }))}
            className={`relative w-11 h-6 rounded-full transition-colors ${form.announcementEnabled ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'}`}
          >
            <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${form.announcementEnabled ? 'translate-x-5' : 'translate-x-0'}`} />
          </div>
        </label>

        {/* Type selector */}
        <div>
          <p className="text-xs text-gray-500 mb-2">Tür</p>
          <div className="flex gap-2 flex-wrap">
            {ANNOUNCE_TYPES.map(t => (
              <button
                key={t.value}
                onClick={() => setForm(f => ({ ...f, announcementType: t.value }))}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold text-white transition-all ${t.color} ${form.announcementType === t.value ? 'ring-2 ring-offset-1 ring-gray-400' : 'opacity-60 hover:opacity-100'}`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Text */}
        <div>
          <p className="text-xs text-gray-500 mb-1">Mesaj</p>
          <textarea
            value={form.announcementText}
            onChange={e => setForm(f => ({ ...f, announcementText: e.target.value }))}
            rows={3}
            maxLength={300}
            placeholder="Kullanıcılara gösterilecek duyuru metni…"
            className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
          />
          <p className="text-xs text-gray-400 text-right">{form.announcementText.length}/300</p>
        </div>

        {/* Preview */}
        {form.announcementText && (
          <div className={`flex items-center gap-3 px-3 py-2 rounded-xl border text-xs ${ANNOUNCE_PREVIEW_STYLES[form.announcementType]}`}>
            <span>{ICONS[form.announcementType]}</span>
            <span className="flex-1">{form.announcementText}</span>
          </div>
        )}
      </div>

      {/* Maintenance mode */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-orange-200 dark:border-orange-900/50 p-4 space-y-4">
        <h3 className="font-semibold text-sm text-gray-900 dark:text-gray-100 flex items-center gap-2">
          <Wrench className="w-4 h-4 text-orange-500" />
          Bakım Modu
        </h3>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Aktif olduğunda admin dışındaki kullanıcılar pin ekleyemez.
        </p>
        <label className="flex items-center justify-between cursor-pointer">
          <span className="text-sm text-gray-700 dark:text-gray-300">Bakım Modunu Etkinleştir</span>
          <div
            onClick={() => setForm(f => ({ ...f, maintenanceMode: !f.maintenanceMode }))}
            className={`relative w-11 h-6 rounded-full transition-colors ${form.maintenanceMode ? 'bg-orange-500' : 'bg-gray-300 dark:bg-gray-600'}`}
          >
            <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${form.maintenanceMode ? 'translate-x-5' : 'translate-x-0'}`} />
          </div>
        </label>
        {form.maintenanceMode && (
          <input
            type="text"
            value={form.maintenanceMessage ?? ''}
            onChange={e => setForm(f => ({ ...f, maintenanceMessage: e.target.value }))}
            placeholder="Bakım mesajı (opsiyonel)…"
            className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-400"
          />
        )}
      </div>

      {/* Save */}
      <button
        onClick={handleSave}
        disabled={saving}
        className="w-full flex items-center justify-center gap-2 py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold text-sm rounded-xl transition-colors disabled:opacity-50"
      >
        {saving
          ? <><Loader2 className="w-4 h-4 animate-spin" />Kaydediliyor…</>
          : saved
            ? <><CheckCircle className="w-4 h-4" />Kaydedildi!</>
            : <><Save className="w-4 h-4" />Kaydet</>}
      </button>
    </div>
  );
}

// ── Pins Tab ──────────────────────────────────────────────────────────────────

function PinsTab() {
  const { reports, setReports, removeReportFromCache, updateReportInCache } = useAppStore();
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState<CategoryType | 'all'>('all');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [savingEdit, setSavingEdit] = useState(false);
  const [bulkCat, setBulkCat] = useState<CategoryType>('emergency');
  const [bulkStatus, setBulkStatus] = useState<'idle' | 'running' | 'done' | 'error'>('idle');
  const [bulkCount, setBulkCount] = useState(0);
  const [loading, setLoading] = useState(false);

  async function refresh() {
    setLoading(true);
    try { const d = await fetchReports(true); setReports(d); }
    finally { setLoading(false); }
  }

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return reports.filter(r => {
      if (catFilter !== 'all' && r.category !== catFilter) return false;
      if (q && !r.username.toLowerCase().includes(q) && !r.title.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [reports, search, catFilter]);

  function startEdit(r: { id: string; title: string; description: string }) {
    setEditingId(r.id);
    setEditTitle(r.title);
    setEditDesc(r.description);
  }

  async function handleSaveEdit(id: string) {
    setSavingEdit(true);
    try {
      await updateReport(id, { title: editTitle.trim(), description: editDesc.trim() });
      updateReportInCache(id, { title: editTitle.trim(), description: editDesc.trim() });
      setEditingId(null);
    } finally { setSavingEdit(false); }
  }

  async function handleDelete(id: string) {
    if (!window.confirm('Bu pini silmek istediğinizden emin misiniz?')) return;
    setDeletingId(id);
    try { await deleteReport(id); removeReportFromCache(id); }
    catch (err) { console.error(err); }
    finally { setDeletingId(null); }
  }

  async function handleBulkDelete() {
    const meta = getCategoryMeta(bulkCat);
    if (!window.confirm(`"${meta.label}" kategorisindeki tüm pinler silinecek. Emin misiniz?`)) return;
    setBulkStatus('running');
    try {
      const n = await batchDeleteByCategory(bulkCat);
      setBulkCount(n);
      setBulkStatus('done');
      const d = await fetchReports(true);
      setReports(d);
    } catch { setBulkStatus('error'); }
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Kullanıcı / başlık ara…"
            className="w-full pl-8 pr-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>
        <button
          onClick={refresh}
          disabled={loading}
          className="p-2 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          <RefreshCw className={`w-4 h-4 text-gray-400 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Category filter */}
      <div className="flex gap-1.5 flex-wrap">
        <button
          onClick={() => setCatFilter('all')}
          className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${catFilter === 'all' ? 'bg-blue-500 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'}`}
        >
          Tümü ({reports.length})
        </button>
        {CATEGORIES.map(cat => {
          const count = reports.filter(r => r.category === cat.id).length;
          if (count === 0) return null;
          return (
            <button
              key={cat.id}
              onClick={() => setCatFilter(cat.id)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${catFilter === cat.id ? 'text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'}`}
              style={catFilter === cat.id ? { backgroundColor: cat.color } : {}}
            >
              {cat.emoji} {count}
            </button>
          );
        })}
      </div>

      {/* Pin list */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
        {filtered.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-8">Sonuç yok.</p>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-gray-800 max-h-80 overflow-y-auto">
            {filtered.slice(0, 150).map(r => {
              const meta = getCategoryMeta(r.category);
              if (editingId === r.id) {
                return (
                  <div key={r.id} className="px-3 py-3 bg-blue-50 dark:bg-blue-900/10 space-y-2">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {meta.emoji} @{r.username}
                    </p>
                    <input
                      value={editTitle}
                      onChange={e => setEditTitle(e.target.value)}
                      maxLength={120}
                      placeholder="Başlık"
                      className="w-full px-3 py-1.5 text-sm rounded-xl border border-blue-300 dark:border-blue-700 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                    <textarea
                      value={editDesc}
                      onChange={e => setEditDesc(e.target.value)}
                      maxLength={500}
                      rows={2}
                      placeholder="Açıklama"
                      className="w-full px-3 py-1.5 text-sm rounded-xl border border-blue-300 dark:border-blue-700 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleSaveEdit(r.id)}
                        disabled={savingEdit || !editTitle.trim()}
                        className="flex-1 py-1.5 bg-blue-500 hover:bg-blue-600 text-white text-xs font-semibold rounded-lg disabled:opacity-50 flex items-center justify-center gap-1"
                      >
                        {savingEdit
                          ? <><RefreshCw className="w-3 h-3 animate-spin" />Kaydediliyor…</>
                          : <><Save className="w-3 h-3" />Kaydet</>}
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="flex-1 py-1.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs font-semibold rounded-lg"
                      >
                        İptal
                      </button>
                    </div>
                  </div>
                );
              }
              return (
                <div key={r.id} className="flex items-center gap-3 px-3 py-2.5 group hover:bg-gray-50 dark:hover:bg-gray-800/50">
                  <span className="text-base flex-shrink-0">{meta.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-gray-900 dark:text-gray-100 truncate">{r.title}</p>
                    <p className="text-xs text-gray-400">@{r.username} · {timeAgo(r.createdAt)} · 👍{r.upvotes}</p>
                  </div>
                  <button
                    onClick={() => startEdit(r)}
                    className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 text-gray-400 hover:text-blue-500 transition-all"
                    title="Düzenle"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(r.id)}
                    disabled={deletingId === r.id}
                    className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 text-gray-400 hover:text-red-500 transition-all disabled:opacity-50"
                    title="Sil"
                  >
                    {deletingId === r.id
                      ? <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      : <Trash2 className="w-3.5 h-3.5" />}
                  </button>
                </div>
              );
            })}
          </div>
        )}
        {filtered.length > 150 && (
          <p className="text-xs text-gray-400 text-center py-2 border-t border-gray-100 dark:border-gray-800">
            İlk 150 gösteriliyor ({filtered.length} toplam)
          </p>
        )}
      </div>

      {/* Bulk delete by category */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-red-200 dark:border-red-900/50 p-4 space-y-3">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
          <Trash2 className="w-4 h-4 text-red-500" />
          Kategoriye Göre Toplu Sil
        </h3>
        <select
          value={bulkCat}
          onChange={e => setBulkCat(e.target.value as CategoryType)}
          className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-red-400"
        >
          {CATEGORIES.map(c => (
            <option key={c.id} value={c.id}>{c.emoji} {c.label}</option>
          ))}
        </select>
        {bulkStatus === 'done' && (
          <p className="text-xs text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 rounded-xl px-3 py-2">
            ✅ {bulkCount} pin silindi.
          </p>
        )}
        {bulkStatus === 'error' && (
          <p className="text-xs text-red-600 bg-red-50 dark:bg-red-900/20 rounded-xl px-3 py-2">
            ❌ Hata oluştu.
          </p>
        )}
        <button
          onClick={handleBulkDelete}
          disabled={bulkStatus === 'running'}
          className="w-full py-2.5 bg-red-500 hover:bg-red-600 text-white text-sm font-semibold rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {bulkStatus === 'running'
            ? <><RefreshCw className="w-4 h-4 animate-spin" />Siliniyor…</>
            : <><Trash2 className="w-4 h-4" />Bu Kategorideki Tüm Pinleri Sil</>}
        </button>
      </div>
    </div>
  );
}

// ── Users Tab ──────────────────────────────────────────────────────────────────

function UsersTab() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [search, setSearch] = useState('');
  const [actionUser, setActionUser] = useState<string | null>(null);

  async function loadUsers() {
    setLoading(true);
    try {
      const data = await fetchAllUsers(200);
      setUsers(data);
      setLoaded(true);
    } finally { setLoading(false); }
  }

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return users;
    return users.filter(u => u.username.toLowerCase().includes(q) || u.id.includes(q));
  }, [users, search]);

  async function handleBan(user: UserProfile) {
    const reason = window.prompt(`@${user.username} kullanıcısını yasaklama sebebi:`);
    if (reason === null) return;
    setActionUser(user.id);
    try {
      await banUser(user.id, reason);
      setUsers(us => us.map(u => u.id === user.id ? { ...u, banned: true, bannedReason: reason } : u));
    } finally { setActionUser(null); }
  }

  async function handleUnban(user: UserProfile) {
    setActionUser(user.id);
    try {
      await unbanUser(user.id);
      setUsers(us => us.map(u => u.id === user.id ? { ...u, banned: false, bannedReason: '' } : u));
    } finally { setActionUser(null); }
  }

  async function handleDeletePins(user: UserProfile) {
    if (!window.confirm(`@${user.username} kullanıcısının tüm pinleri silinecek. Emin misiniz?`)) return;
    setActionUser(user.id);
    try {
      const n = await batchDeleteByUser(user.id);
      alert(`${n} pin silindi.`);
    } finally { setActionUser(null); }
  }

  return (
    <div className="space-y-4">
      {!loaded ? (
        <button
          onClick={loadUsers}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold text-sm rounded-xl transition-colors disabled:opacity-50"
        >
          {loading
            ? <><Loader2 className="w-4 h-4 animate-spin" />Yükleniyor…</>
            : <><Users className="w-4 h-4" />Kullanıcıları Yükle</>}
        </button>
      ) : (
        <>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Kullanıcı ara…"
                className="w-full pl-8 pr-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
            <button
              onClick={loadUsers}
              disabled={loading}
              className="p-2 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <RefreshCw className={`w-4 h-4 text-gray-400 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>

          <p className="text-xs text-gray-400">{filtered.length} kullanıcı</p>

          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden divide-y divide-gray-100 dark:divide-gray-800 max-h-[460px] overflow-y-auto">
            {filtered.map(u => (
              <div key={u.id} className={`px-3 py-3 ${u.banned ? 'bg-red-50 dark:bg-red-900/10' : ''}`}>
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                        @{u.username || '(isimsiz)'}
                      </span>
                      {u.banned && (
                        <span className="text-xs bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 px-1.5 py-0.5 rounded-full font-medium">
                          YASAK
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Skor: {u.netScore ?? 0}
                      {u.banned && u.bannedReason && <> · Sebep: {u.bannedReason}</>}
                    </p>
                    <p className="text-xs text-gray-300 dark:text-gray-600 font-mono truncate max-w-[180px]">{u.id}</p>
                  </div>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    {actionUser === u.id ? (
                      <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                    ) : (
                      <>
                        {u.banned ? (
                          <button
                            onClick={() => handleUnban(u)}
                            title="Yasağı Kaldır"
                            className="p-1.5 rounded-lg bg-green-100 dark:bg-green-900/30 text-green-600 hover:bg-green-200 transition-colors"
                          >
                            <UserCheck className="w-3.5 h-3.5" />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleBan(u)}
                            title="Yasakla"
                            className="p-1.5 rounded-lg bg-orange-100 dark:bg-orange-900/30 text-orange-600 hover:bg-orange-200 transition-colors"
                          >
                            <Ban className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDeletePins(u)}
                          title="Tüm pinleri sil"
                          className="p-1.5 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-600 hover:bg-red-200 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ── Main AdminPanel ───────────────────────────────────────────────────────────

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: 'dashboard', label: 'Özet', icon: <Database className="w-4 h-4" /> },
  { id: 'announcement', label: 'Duyuru', icon: <Megaphone className="w-4 h-4" /> },
  { id: 'pins', label: 'Pinler', icon: <BarChart3 className="w-4 h-4" /> },
  { id: 'users', label: 'Kullanıcılar', icon: <Users className="w-4 h-4" /> },
];

export default function AdminPanel() {
  const [tab, setTab] = useState<Tab>('dashboard');

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Admin Paneli</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">AnamurPin site yönetimi</p>
      </div>

      {/* Tab bar */}
      <div className="flex rounded-2xl bg-gray-100 dark:bg-gray-800 p-1 gap-1">
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-1 rounded-xl text-xs font-semibold transition-all ${
              tab === t.id
                ? 'bg-white dark:bg-gray-900 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
            }`}
          >
            {t.icon}
            <span className="hidden sm:inline">{t.label}</span>
          </button>
        ))}
      </div>

      {/* Tab content */}
      {tab === 'dashboard' && <DashboardTab />}
      {tab === 'announcement' && <AnnouncementTab />}
      {tab === 'pins' && <PinsTab />}
      {tab === 'users' && <UsersTab />}
    </div>
  );
}
