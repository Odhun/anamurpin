'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { useReports } from '@/hooks/useReports';
import { useWeather } from '@/hooks/useWeather';
import { useSiteConfig } from '@/hooks/useSiteConfig';
import { useAppStore } from '@/store/useAppStore';
import Header from '@/components/ui/Header';
import FrostBanner from '@/components/ui/FrostBanner';
import AnnouncementBanner from '@/components/ui/AnnouncementBanner';
import CategoryFilter from '@/components/ui/CategoryFilter';
import Timeline from '@/components/timeline/Timeline';
import ReportDetailModal from '@/components/modals/ReportDetailModal';
import AddPinModal from '@/components/map/AddPinModal';
import AuthModal from '@/components/ui/AuthModal';
import UsernameModal from '@/components/ui/UsernameModal';
import Leaderboard from '@/components/ui/Leaderboard';

const MapView = dynamic(() => import('@/components/map/MapView'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-900">
      <div className="text-center space-y-3">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500 mx-auto" />
        <p className="text-sm text-gray-500 dark:text-gray-400">Harita yükleniyor…</p>
      </div>
    </div>
  ),
});

export default function HomePage() {
  useAuth();
  useSiteConfig();
  const { allReports, timelineReports, isLoading, refresh } = useReports();
  const { isFrost, temperature } = useWeather();
  const { selectedReport, isAddingPin, showAuthModal, showUsernameModal, showLeaderboard, isDarkMode, setDarkMode } = useAppStore();
  const visibleReports = allReports;
  const visibleTimeline = timelineReports;

  // Sync theme on mount
  useEffect(() => {
    const saved = localStorage.getItem('anamurpin_theme');
    setDarkMode(saved === 'dark');
  }, [setDarkMode]);

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <Header />

      {isFrost && temperature !== null && <FrostBanner temperature={temperature} />}
      <AnnouncementBanner />

      <CategoryFilter />

      {/* Desktop: side-by-side | Mobile: stacked */}
      <div className="flex flex-1 overflow-hidden flex-col md:flex-row">
        {/* Timeline — left on desktop, bottom-sheet on mobile */}
        <aside className="
          hidden md:flex
          w-[420px] flex-shrink-0
          flex-col border-r border-gray-200 dark:border-gray-800
          bg-white dark:bg-gray-950
        ">
          <div className="flex-1 min-h-0 overflow-hidden">
            <Timeline reports={visibleTimeline} isLoading={isLoading} onRefresh={refresh} />
          </div>
          {/* Sidebar footer */}
          <div className="flex-shrink-0 border-t border-gray-100 dark:border-gray-800 px-4 py-2.5 flex items-center justify-between">
            <nav className="flex items-center gap-3 text-xs text-gray-400">
              <Link href="/hakkinda" className="hover:text-gray-700 dark:hover:text-gray-200 transition-colors">Hakkında</Link>
              <Link href="/gizlilik" className="hover:text-gray-700 dark:hover:text-gray-200 transition-colors">Gizlilik</Link>
              <Link href="/iletisim" className="hover:text-gray-700 dark:hover:text-gray-200 transition-colors">İletişim</Link>
            </nav>
            <a
              href="https://www.odhun.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
            >
              <span className="text-yellow-500">⚡</span>
              <span>OdhunSoft</span>
            </a>
          </div>
        </aside>

        {/* Right column: map + mobile bottom sheet stacked */}
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
          {/* Map — framed on mobile (mx/rounded), full-bleed on desktop */}
          <main className="flex-1 relative min-h-0 mx-2 mt-1.5 mb-0 md:mx-0 md:mt-0 rounded-2xl md:rounded-none overflow-hidden">
            <MapView reports={visibleReports} />

            {/* Click-to-add hint overlay */}
            {!isAddingPin && !selectedReport && (
              <div className="absolute bottom-5 md:bottom-6 left-1/2 -translate-x-1/2 pointer-events-none z-[400]">
                <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm text-xs text-gray-600 dark:text-gray-300 px-3 py-1.5 rounded-full shadow-sm border border-gray-200 dark:border-gray-700 whitespace-nowrap">
                  Haritaya tıkla → Pin ekle
                </div>
              </div>
            )}
          </main>

          {/* Mobile bottom sheet — in flex flow, always visible, no z-index fights */}
          <MobileBottomSheet reports={visibleTimeline} isLoading={isLoading} onRefresh={refresh} />
        </div>
      </div>

      {selectedReport && <ReportDetailModal />}
      {isAddingPin && <AddPinModal />}
      {showAuthModal && <AuthModal />}
      {showUsernameModal && <UsernameModal />}
      {showLeaderboard && <Leaderboard />}
    </div>
  );
}

function MobileBottomSheet({
  reports,
  isLoading,
  onRefresh,
}: {
  reports: ReturnType<typeof useReports>['timelineReports'];
  isLoading: boolean;
  onRefresh: () => void;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      className={`md:hidden flex-shrink-0 bg-white dark:bg-gray-950 rounded-t-2xl shadow-[0_-4px_20px_-2px_rgba(0,0,0,0.12)] border-t-2 border-blue-200 dark:border-blue-900 flex flex-col overflow-hidden transition-[height] duration-300 ease-in-out ${
        expanded ? 'h-[55vh]' : 'h-[60px]'
      }`}
    >
      {/* Tap bar */}
      <div
        role="button"
        aria-label={expanded ? 'Kapat' : 'Canlı akışı aç'}
        onClick={() => setExpanded(e => !e)}
        className="flex items-center justify-between px-4 flex-shrink-0 select-none h-[60px] active:bg-gray-50 dark:active:bg-gray-900/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-1.5 bg-gray-300 dark:bg-gray-600 rounded-full" />
          <span className="text-sm font-bold text-gray-800 dark:text-gray-200">
            Canlı Akış
          </span>
          {reports.length > 0 && (
            <span className="text-xs bg-blue-500 text-white px-2 py-0.5 rounded-full font-bold">
              {reports.length}
            </span>
          )}
        </div>
        <svg
          className={`w-5 h-5 text-gray-400 transition-transform duration-300 ${expanded ? 'rotate-180' : ''}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
        </svg>
      </div>

      {/* Timeline list */}
      <div className="flex-1 overflow-hidden min-h-0">
        <Timeline reports={reports} isLoading={isLoading} onRefresh={onRefresh} />
      </div>

      {/* Mobile footer */}
      <div className="flex-shrink-0 border-t border-gray-100 dark:border-gray-800 px-4 py-2.5 flex items-center justify-between bg-white dark:bg-gray-950">
        <nav className="flex items-center gap-3 text-xs text-gray-400">
          <Link href="/hakkinda" className="hover:text-gray-600 dark:hover:text-gray-200 transition-colors">Hakkında</Link>
          <Link href="/gizlilik" className="hover:text-gray-600 dark:hover:text-gray-200 transition-colors">Gizlilik</Link>
          <Link href="/iletisim" className="hover:text-gray-600 dark:hover:text-gray-200 transition-colors">İletişim</Link>
        </nav>
        <a
          href="https://www.odhun.com"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
        >
          <span className="text-yellow-500">⚡</span>
          <span>OdhunSoft</span>
        </a>
      </div>
    </div>
  );
}
