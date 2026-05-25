'use client';

import { memo } from 'react';
import { ThumbsUp, ThumbsDown, BadgeCheck, Clock } from 'lucide-react';
import { Report } from '@/types';
import { getCategoryMeta } from '@/utils/categories';
import { isVerifiedReporter, hasVoted } from '@/lib/reliability';
import { useAppStore } from '@/store/useAppStore';

interface Props {
  report: Report;
  onClick: () => void;
}

function timeAgo(ts: { toMillis: () => number }): string {
  const diff = Date.now() - ts.toMillis();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'Az önce';
  if (m < 60) return `${m}dk önce`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}s önce`;
  return `${Math.floor(h / 24)}g önce`;
}

function ReportCard({ report, onClick }: Props) {
  const meta = getCategoryMeta(report.category);
  const voted = hasVoted(report.id);

  return (
    <button
      onClick={onClick}
      className="w-full text-left p-3 rounded-xl border border-gray-100 dark:border-gray-800 hover:border-gray-200 dark:hover:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-all group"
    >
      {/* Category + time */}
      <div className="flex items-center justify-between mb-1.5">
        <span
          className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full"
          style={{ backgroundColor: `${meta.color}20`, color: meta.color }}
        >
          {meta.emoji} {meta.label.split('/')[0].trim()}
        </span>
        <span className="flex items-center gap-1 text-xs text-gray-400">
          <Clock className="w-3 h-3" />
          {timeAgo(report.createdAt)}
        </span>
      </div>

      {/* Title */}
      <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
        {report.title}
      </p>

      {/* Description */}
      {report.description && (
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2">
          {report.description}
        </p>
      )}

      {/* Image thumbnail */}
      {report.imageUrl && (
        <div className="mt-2 rounded-lg overflow-hidden bg-black">
          <img
            src={report.imageUrl}
            alt={report.title}
            className="w-full max-h-36 object-contain"
            onError={(e) => { (e.currentTarget.parentElement as HTMLElement).style.display = 'none'; }}
          />
        </div>
      )}

      {/* Footer: author + votes */}
      <div className="flex items-center justify-between mt-2">
        <div className="flex items-center gap-1 min-w-0">
          <span className="text-xs text-gray-500 dark:text-gray-400 truncate">
            @{report.username}
          </span>
          {report.authorVerified && (
            <BadgeCheck className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" aria-label="Onaylı Yerel Muhabir" />
          )}
          {report.isPremium && (
            <span className="text-xs text-yellow-500 flex-shrink-0">⭐</span>
          )}
        </div>
        <div className="flex items-center gap-2 text-xs flex-shrink-0">
          <span className={`flex items-center gap-0.5 ${voted === 'up' ? 'text-green-500' : 'text-gray-400'}`}>
            <ThumbsUp className="w-3 h-3" /> {report.upvotes}
          </span>
          <span className={`flex items-center gap-0.5 ${voted === 'down' ? 'text-red-500' : 'text-gray-400'}`}>
            <ThumbsDown className="w-3 h-3" /> {report.downvotes}
          </span>
        </div>
      </div>
    </button>
  );
}

export default memo(ReportCard);
