'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';

const STYLES = {
  info: 'bg-blue-50 dark:bg-blue-950/60 text-blue-800 dark:text-blue-200 border-blue-200 dark:border-blue-800',
  warning: 'bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-200 border-amber-200 dark:border-amber-800',
  error: 'bg-red-50 dark:bg-red-950/60 text-red-800 dark:text-red-200 border-red-200 dark:border-red-800',
  success: 'bg-green-50 dark:bg-green-950/60 text-green-800 dark:text-green-200 border-green-200 dark:border-green-800',
};

const ICONS = { info: 'ℹ️', warning: '⚠️', error: '🚨', success: '✅' };

export default function AnnouncementBanner() {
  const siteConfig = useAppStore(s => s.siteConfig);
  const [dismissed, setDismissed] = useState(false);

  if (!siteConfig?.announcementEnabled || !siteConfig.announcementText || dismissed) return null;

  const type = siteConfig.announcementType ?? 'info';

  return (
    <div className={`flex items-center gap-3 px-4 py-2 border-b text-sm ${STYLES[type]}`}>
      <span className="flex-shrink-0 text-base">{ICONS[type]}</span>
      <p className="flex-1 leading-snug">{siteConfig.announcementText}</p>
      <button
        onClick={() => setDismissed(true)}
        className="flex-shrink-0 p-1 rounded hover:opacity-60 transition-opacity"
        aria-label="Kapat"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
