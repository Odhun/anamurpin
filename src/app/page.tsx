'use client';

import { useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useAuth } from '@/hooks/useAuth';
import { useReports } from '@/hooks/useReports';
import { useWeather } from '@/hooks/useWeather';
import { useAppStore } from '@/store/useAppStore';
import Header from '@/components/ui/Header';
import FrostBanner from '@/components/ui/FrostBanner';
import CategoryFilter from '@/components/ui/CategoryFilter';
import Timeline from '@/components/timeline/Timeline';
import ReportDetailModal from '@/components/modals/ReportDetailModal';
import AddPinModal from '@/components/map/AddPinModal';
import AuthModal from '@/components/ui/AuthModal';

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
  const { allReports, timelineReports, isLoading, refresh } = useReports();
  const { isFrost, temperature } = useWeather();
  const { selectedReport, isAddingPin, showAuthModal, isDarkMode, setDarkMode } = useAppStore();

  // Sync theme on mount
  useEffect(() => {
    const saved = localStorage.getItem('anamurpin_theme');
    setDarkMode(saved === 'dark');
  }, [setDarkMode]);

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <Header />

      {isFrost && temperature !== null && <FrostBanner temperature={temperature} />}

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
          <Timeline reports={timelineReports} isLoading={isLoading} onRefresh={refresh} />
        </aside>

        {/* Map */}
        <main className="flex-1 relative min-h-0">
          <MapView reports={allReports} />

          {/* Mobile timeline bottom-sheet */}
          <MobileBottomSheet reports={timelineReports} isLoading={isLoading} onRefresh={refresh} />

          {/* Click-to-add hint overlay */}
          {!isAddingPin && (
            <div className="absolute bottom-20 left-1/2 -translate-x-1/2 md:bottom-6 pointer-events-none z-[400]">
              <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm text-xs text-gray-600 dark:text-gray-300 px-3 py-1.5 rounded-full shadow-sm border border-gray-200 dark:border-gray-700">
                Haritaya tıkla → Pin ekle
              </div>
            </div>
          )}
        </main>
      </div>

      {selectedReport && <ReportDetailModal />}
      {isAddingPin && <AddPinModal />}
      {showAuthModal && <AuthModal />}
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
  return (
    <div className="md:hidden absolute bottom-0 left-0 right-0 z-[500] bg-white dark:bg-gray-950 rounded-t-2xl shadow-2xl border-t border-gray-200 dark:border-gray-800 max-h-[55vh] flex flex-col">
      {/* Drag handle */}
      <div className="flex justify-center py-2 flex-shrink-0">
        <div className="w-10 h-1 bg-gray-300 dark:bg-gray-600 rounded-full" />
      </div>
      <div className="flex-1 overflow-hidden">
        <Timeline reports={reports} isLoading={isLoading} onRefresh={onRefresh} />
      </div>
    </div>
  );
}
