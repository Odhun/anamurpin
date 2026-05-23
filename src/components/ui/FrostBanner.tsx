'use client';

import { Snowflake, X } from 'lucide-react';
import { useState } from 'react';

interface Props {
  temperature: number;
}

export default function FrostBanner({ temperature }: Props) {
  const [dismissed, setDismissed] = useState(false);
  if (dismissed) return null;

  return (
    <div className="animate-frost-pulse relative z-50 flex items-center gap-3 px-4 py-2.5 bg-red-600 text-white shadow-lg">
      <Snowflake className="w-5 h-5 flex-shrink-0 animate-spin" style={{ animationDuration: '3s' }} />
      <div className="flex-1 min-w-0">
        <span className="font-bold text-sm">⚠️ DON RİSKİ UYARISI</span>
        <span className="text-sm ml-2 opacity-90">
          Mevcut sıcaklık: <strong>{temperature.toFixed(1)}°C</strong> — Seralar ve bahçeler için don önlemi alın!
        </span>
      </div>
      <button
        onClick={() => setDismissed(true)}
        className="flex-shrink-0 p-1 rounded-full hover:bg-red-500 transition-colors"
        aria-label="Kapat"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
