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
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { getCategoryMeta } from '@/utils/categories';
import { voteOnReport } from '@/lib/firestore';
import { hasVoted, recordVote, isVerifiedReporter } from '@/lib/reliability';

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
  const { selectedReport, setSelectedReport, user, updateReportInCache, setShowAuthModal } =
    useAppStore();

  const [isVoting, setIsVoting] = useState(false);

  if (!selectedReport) return null;

  const meta = getCategoryMeta(selectedReport.category);
  const voted = hasVoted(selectedReport.id);
  const pinUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/pin/${selectedReport.id}`
      : `/pin/${selectedReport.id}`;

  async function handleVote(voteType: 'up' | 'down') {
    if (!selectedReport) return;
    if (voted) return;
    if (!user) {
      setShowAuthModal(true);
      return;
    }

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
      <div className="relative w-full md:max-w-lg bg-white dark:bg-gray-900 rounded-t-2xl md:rounded-2xl shadow-2xl animate-slide-up md:animate-fade-in max-h-[85vh] overflow-y-auto">
        {/* Close */}
        <button
          onClick={() => setSelectedReport(null)}
          className="absolute top-3 right-3 z-10 p-1.5 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Image */}
        {selectedReport.imageUrl && (
          <div className="h-48 bg-gray-100 dark:bg-gray-800 overflow-hidden rounded-t-2xl md:rounded-t-2xl">
            <img
              src={selectedReport.imageUrl}
              alt={selectedReport.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <div className="p-5 space-y-4">
          {/* Category badge + expiry */}
          <div className="flex items-center justify-between">
            <span
              className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full"
              style={{ backgroundColor: `${meta.color}20`, color: meta.color }}
            >
              {meta.emoji} {meta.label}
            </span>
            <span className="text-xs text-gray-400">{expiresIn(selectedReport.expiresAt)}</span>
          </div>

          {/* Title */}
          <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 leading-snug">
            {selectedReport.title}
          </h2>

          {/* Description */}
          {selectedReport.description && (
            <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
              {selectedReport.description}
            </p>
          )}

          {/* Author + time */}
          <div className="flex items-center justify-between text-xs text-gray-400">
            <div className="flex items-center gap-1.5">
              <div className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-xs font-bold text-gray-500 dark:text-gray-300">
                {selectedReport.username[0]?.toUpperCase()}
              </div>
              <span>{selectedReport.username}</span>
              {selectedReport.authorVerified && (
                <BadgeCheck className="w-3.5 h-3.5 text-blue-500" aria-label="Onaylı Yerel Muhabir" />
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

          {/* Share buttons */}
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
