'use client';

import Link from 'next/link';
import { LogOut, Shield, User, Trophy, Pencil } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { useAuth } from '@/hooks/useAuth';
import { isAdminUser } from '@/lib/admin';
import ThemeToggle from './ThemeToggle';

export default function Header() {
  const {
    user,
    userProfile,
    userNetScore,
    setShowAuthModal,
    setShowLeaderboard,
    openUsernameChange,
  } = useAppStore();
  const { isAuthenticated, signOut } = useAuth();
  const isAdmin = isAdminUser(user);

  const displayName = userProfile?.username || null;

  return (
    <header className="flex items-center justify-between px-3 sm:px-4 py-2.5 bg-white dark:bg-gray-950 border-b border-gray-100 dark:border-gray-800 z-50 flex-shrink-0">
      {/* Logo */}
      <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity min-w-0">
        <span className="text-xl flex-shrink-0">📍</span>
        <div className="min-w-0">
          <span className="font-bold text-gray-900 dark:text-gray-100 text-base">AnamurPin</span>
          <span className="hidden sm:inline text-xs text-gray-400 ml-2">Anamur · Bozyazı · Aydıncık</span>
        </div>
      </Link>

      {/* Right side */}
      <div className="flex items-center gap-1 flex-shrink-0">
        <ThemeToggle />

        {/* Leaderboard */}
        <button
          onClick={() => setShowLeaderboard(true)}
          className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          title="Haftalık Skor"
        >
          <Trophy className="w-4 h-4 text-amber-500" />
        </button>

        {isAdmin && (
          <Link
            href="/admin"
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            title="Admin Paneli"
          >
            <Shield className="w-5 h-5 text-orange-500" />
          </Link>
        )}

        {isAuthenticated ? (
          <div className="flex items-center gap-1">
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-gray-100 dark:bg-gray-800 rounded-full">
              <User className="w-3.5 h-3.5 text-gray-500 flex-shrink-0" />
              <span className="text-xs font-medium text-gray-700 dark:text-gray-300 max-w-[80px] sm:max-w-[120px] truncate">
                {displayName}
              </span>
              {userNetScore >= 50 && (
                <span className="text-xs text-blue-500 font-bold flex-shrink-0" title="Onaylı Yerel Muhabir">✓</span>
              )}
            </div>
            <button
              onClick={openUsernameChange}
              className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              title="Kullanıcı adını değiştir"
            >
              <Pencil className="w-3.5 h-3.5 text-gray-400" />
            </button>
            <button
              onClick={signOut}
              className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              title="Çıkış yap"
            >
              <LogOut className="w-4 h-4 text-gray-500" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowAuthModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white text-xs font-semibold rounded-full transition-colors"
          >
            Giriş Yap
          </button>
        )}
      </div>
    </header>
  );
}
