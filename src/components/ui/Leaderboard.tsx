'use client';

import { useEffect, useState } from 'react';
import { X, Trophy, Loader2 } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { fetchWeeklyLeaderboard } from '@/lib/firestore';

const MEDALS = ['🥇', '🥈', '🥉'];

function getNextSunday(): string {
  const now = new Date();
  const next = new Date(now);
  next.setDate(now.getDate() + (7 - now.getDay()));
  next.setHours(0, 0, 0, 0);
  const diff = next.getTime() - now.getTime();
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  if (days > 0) return `${days} gün ${hours} saat`;
  return `${hours} saat`;
}

export default function Leaderboard() {
  const { setShowLeaderboard } = useAppStore();
  const [data, setData] = useState<{ username: string; count: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWeeklyLeaderboard()
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="fixed inset-0 z-[1000] flex items-end md:items-center justify-center p-0 md:p-4">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={() => setShowLeaderboard(false)}
      />
      <div className="relative w-full md:max-w-sm bg-white dark:bg-gray-900 rounded-t-2xl md:rounded-2xl shadow-2xl animate-slide-up md:animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-500" />
            <h2 className="font-bold text-gray-900 dark:text-gray-100">Haftalık Skor</h2>
          </div>
          <button
            onClick={() => setShowLeaderboard(false)}
            className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 space-y-3">
          <p className="text-xs text-gray-400 text-center">
            Sıfırlanmaya kalan: <span className="font-medium text-gray-600 dark:text-gray-300">{getNextSunday()}</span>
          </p>

          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
            </div>
          ) : data.length === 0 ? (
            <p className="text-center text-sm text-gray-400 py-8">Bu hafta henüz paylaşım yok.</p>
          ) : (
            <ol className="space-y-2">
              {data.map((entry, i) => (
                <li
                  key={entry.username}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl ${
                    i === 0
                      ? 'bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800'
                      : 'bg-gray-50 dark:bg-gray-800/50'
                  }`}
                >
                  <span className="text-lg w-7 text-center flex-shrink-0">
                    {MEDALS[i] ?? `${i + 1}.`}
                  </span>
                  <span className="flex-1 text-sm font-medium text-gray-800 dark:text-gray-200 truncate">
                    @{entry.username}
                  </span>
                  <span className="text-sm font-bold text-blue-600 dark:text-blue-400 flex-shrink-0">
                    {entry.count} pin
                  </span>
                </li>
              ))}
            </ol>
          )}
        </div>
      </div>
    </div>
  );
}
