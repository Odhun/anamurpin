'use client';

import { useState } from 'react';
import {
  X,
  ThumbsUp,
  ThumbsDown,
  Share2,
  MapPin,
  BadgeCheck,
  Clock,
  ExternalLink,
  Trash2,
  Pencil,
  Check,
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { getCategoryMeta } from '@/utils/categories';
import { voteOnReport, deleteReport, updateReport } from '@/lib/firestore';
import { hasVoted, recordVote } from '@/lib/reliability';
import { isAdminUser } from '@/lib/admin';

function timeAgo(ts: { toMillis: () => number }): string {
  const diff = Date.now() - ts.toMillis();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'Az önce';
  if (m < 60) return `${m} dakika önce`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} saat önce`;
  return `${Math.floor(h / 24)} gün önce`;
}

function expiresIn(ts: { toMillis: () => number }): string {
  const diff = ts.toMillis() - Date.now();
  if (diff <= 0) return 'Süresi doldu';
  const h = Math.floor(diff / 3600000);
  if (h < 24) return `${h}s sonra silinir`;
  return `${Math.floor(h / 24)}g sonra silinir`;
}

export default function ReportDetailModal() {
  const {
    selectedReport,
    setSelectedReport,
    user,
    updateReportInCache,
    removeReportFromCache,
    setShowAuthModal,
  } = useAppStore();

  const [isVoting, setIsVoting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [saving, setSaving] = useState(false);

  if (!selectedReport) return null;

  const meta = getCategoryMeta(selectedReport.category);
  const voted = hasVoted(selectedReport.id);
  const isAdmin = isAdminUser(user);
  const isOwner = !!user && user.uid === selectedReport.userId;
  const canModify = isOwner || isAdmin;

  const pinUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/pin/${selectedReport.id}`
      : `/pin/${selectedReport.id}`;

  async function handleVote(voteType: 'up' | 'down') {
    if (!selectedReport) return;
    if (voted) return;
    if (!user) { setShowAuthModal(true); return; }

    setIsVoting(true);
    try {
      await voteOnReport(selectedReport.id, voteType, selectedReport.userId);
      recordVote(selectedReport.id, voteType);
      updateReportInCache(selectedReport.id, {
        upvotes: selectedReport.upvotes + (voteType === 'up' ? 1 : 0),
        downvotes: selectedReport.downvotes + (voteType === 'down' ? 1 : 0),
      });
    } catch (err) {
      console.error('Vote failed:', err);
    } finally {
      setIsVoting(false);
    }
  }

  async function handleDelete() {
    if (!selectedReport || !canModify) return;
    if (!window.confirm('Bu pini silmek istediğinizden emin misiniz?')) return;
    setIsDeleting(true);
    try {
      await deleteReport(selectedReport.id);
      removeReportFromCache(selectedReport.id);
      setSelectedReport(null);
    } catch (err) {
      console.error('Delete failed:', err);
    } finally {
      setIsDeleting(false);
    }
  }

  function startEdit() {
    setEditTitle(selectedReport!.title);
    setEditDesc(selectedReport!.description);
    setEditMode(true);
  }

  async function handleSaveEdit() {
    if (!selectedReport) return;
    setSaving(true);
    try {
      await updateReport(selectedReport.id, { title: editTitle.trim(), description: editDesc.trim() });
      updateReportInCache(selectedReport.id, { title: editTitle.trim(), description: editDesc.trim() });
      setEditMode(false);
    } catch (err) {
      console.error('Update failed:', err);
    } finally {
      setSaving(false);
    }
  }

  function handleWhatsAppShare() {
    const text =
      `🔔 *${selectedReport!.title}*\n\n` +
      `${selectedReport!.description ? selectedReport!.description + '\n\n' : ''}` +
      `📍 ${meta.emoji} ${meta.label}\n` +
      `🗺️ AnamurPin: ${pinUrl}`;
    window.open(
      `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`,
      '_blank',
      'noopener,noreferrer',
    );
  }

  function handleCopyLink() {
    navigator.clipboard.writeText(pinUrl).catch(() => {});
  }

  return (
    <div className="fixed inset-0 z-[1000] flex items-end md:items-center justify-center p-0 md:p-4">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={() => setSelectedReport(null)}
      />
      <div className="relative w-full md:max-w-lg bg-white dark:bg-gray-900 rounded-t-2xl md:rounded-2xl shadow-2xl animate-slide-up md:animate-fade-in max-h-[90vh] overflow-y-auto">
        {/* Close */}
        <button
          onClick={() => setSelectedReport(null)}
          className="absolute top-3 right-3 z-10 p-1.5 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Image — full, auto height */}
        {selectedReport.imageUrl && (
          <div className="w-full bg-black rounded-t-2xl overflow-hidden">
            <img
              src={selectedReport.imageUrl}
              alt={selectedReport.title}
              className="w-full object-contain max-h-80"
              onError={(e) => { (e.currentTarget.parentElement as HTMLElement).style.display = 'none'; }}
            />
          </div>
        )}

        <div className="p-4 sm:p-5 space-y-4">
          {/* Category badge + expiry */}
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <span
              className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full"
              style={{ backgroundColor: `${meta.color}20`, color: meta.color }}
            >
              {meta.emoji} {meta.label}
            </span>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400">{expiresIn(selectedReport.expiresAt)}</span>
              {canModify && !editMode && (
                <>
                  <button
                    onClick={startEdit}
                    className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-blue-500 transition-colors"
                    title="Düzenle"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-400 hover:text-red-500 transition-colors disabled:opacity-50"
                    title="Sil"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Title */}
          {editMode ? (
            <input
              value={editTitle}
              onChange={e => setEditTitle(e.target.value)}
              maxLength={120}
              className="w-full px-3 py-2 rounded-xl border-2 border-blue-400 bg-white dark:bg-gray-800 text-base font-bold focus:outline-none"
            />
          ) : (
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 leading-snug">
              {selectedReport.title}
            </h2>
          )}

          {/* Description */}
          {editMode ? (
            <textarea
              value={editDesc}
              onChange={e => setEditDesc(e.target.value)}
              maxLength={500}
              rows={3}
              className="w-full px-3 py-2 rounded-xl border-2 border-blue-400 bg-white dark:bg-gray-800 text-sm resize-none focus:outline-none"
            />
          ) : (
            selectedReport.description && (
              <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                {selectedReport.description}
              </p>
            )
          )}

          {/* Edit save/cancel */}
          {editMode && (
            <div className="flex gap-2">
              <button
                onClick={handleSaveEdit}
                disabled={saving || !editTitle.trim()}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-500 hover:bg-blue-600 text-white text-sm font-semibold disabled:opacity-50"
              >
                <Check className="w-4 h-4" /> Kaydet
              </button>
              <button
                onClick={() => setEditMode(false)}
                className="px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 text-sm"
              >
                İptal
              </button>
            </div>
          )}

          {/* Author + time */}
          <div className="flex items-center justify-between text-xs text-gray-400">
            <div className="flex items-center gap-1.5">
              <div className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-xs font-bold text-gray-500 dark:text-gray-300">
                {selectedReport.username[0]?.toUpperCase()}
              </div>
              <span>{selectedReport.username}</span>
              {selectedReport.authorVerified && (
                <BadgeCheck className="w-3.5 h-3.5 text-blue-500" />
              )}
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {timeAgo(selectedReport.createdAt)}
            </div>
          </div>

          {/* Coordinates */}
          <div className="flex items-center gap-1.5 text-xs text-gray-400 bg-gray-50 dark:bg-gray-800 rounded-lg px-3 py-2">
            <MapPin className="w-3.5 h-3.5" />
            {selectedReport.latitude.toFixed(5)}, {selectedReport.longitude.toFixed(5)}
          </div>

          {/* Votes */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => handleVote('up')}
              disabled={isVoting || !!voted}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 text-sm font-medium transition-all ${
                voted === 'up'
                  ? 'bg-green-500 border-green-500 text-white'
                  : voted
                  ? 'border-gray-200 dark:border-gray-700 text-gray-400 cursor-not-allowed'
                  : 'border-green-200 dark:border-green-900 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20'
              }`}
            >
              <ThumbsUp className="w-4 h-4" />
              <span>{selectedReport.upvotes}</span>
            </button>
            <button
              onClick={() => handleVote('down')}
              disabled={isVoting || !!voted}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 text-sm font-medium transition-all ${
                voted === 'down'
                  ? 'bg-red-500 border-red-500 text-white'
                  : voted
                  ? 'border-gray-200 dark:border-gray-700 text-gray-400 cursor-not-allowed'
                  : 'border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20'
              }`}
            >
              <ThumbsDown className="w-4 h-4" />
              <span>{selectedReport.downvotes}</span>
            </button>
          </div>

          {voted && (
            <p className="text-xs text-center text-gray-400">Oy kullandınız</p>
          )}

          {/* Share */}
          <div className="flex gap-2 pt-1">
            <button
              onClick={handleWhatsAppShare}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#25D366] hover:bg-[#1ebe5d] text-white text-sm font-semibold transition-colors"
            >
              <Share2 className="w-4 h-4" />
              WhatsApp ile Paylaş
            </button>
            <button
              onClick={handleCopyLink}
              className="px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              title="Bağlantıyı kopyala"
            >
              <ExternalLink className="w-4 h-4 text-gray-500" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
