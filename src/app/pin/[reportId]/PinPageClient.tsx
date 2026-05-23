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
import ReportDetailModal from '@/components/modals/ReportDetailModal';
import AddPinModal from '@/components/map/AddPinModal';
import AuthModal from '@/components/ui/AuthModal';

const MapView = dynamic(() => import('@/components/map/MapView'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-900">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500" />
    </div>
  ),
});

export default function PinPageClient({ reportId }: { reportId: string }) {
  useAuth();
  const { allReports, isLoading } = useReports();
  const { isFrost, temperature } = useWeather();
  const {
    selectedReport,
    isAddingPin,
    showAuthModal,
    setSelectedReport,
    setDarkMode,
    reports,
  } = useAppStore();

  useEffect(() => {
    const saved = localStorage.getItem('anamurpin_theme');
    setDarkMode(saved === 'dark');
  }, [setDarkMode]);

  // Auto-open modal when reports are loaded
  useEffect(() => {
    if (reports.length === 0) return;
    const report = reports.find(r => r.id === reportId);
    if (report) setSelectedReport(report);
  }, [reports, reportId, setSelectedReport]);

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <Header />
      {isFrost && temperature !== null && <FrostBanner temperature={temperature} />}
      <CategoryFilter />

      <div className="flex-1 relative min-h-0">
        <MapView reports={allReports} focusReportId={reportId} />
      </div>

      {selectedReport && <ReportDetailModal />}
      {isAddingPin && <AddPinModal />}
      {showAuthModal && <AuthModal />}
    </div>
  );
}
