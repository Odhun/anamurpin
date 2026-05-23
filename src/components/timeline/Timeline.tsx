'use client';

import { RefreshCw, Inbox } from 'lucide-react';
import { Report } from '@/types';
import { useAppStore } from '@/store/useAppStore';
import ReportCard from './ReportCard';

interface Props {
  reports: Report[];
  isLoading: boolean;
  onRefresh: () => void;
}

export default function Timeline({ reports, isLoading, onRefresh }: Props) {
  const { setSelectedReport, mapBounds } = useAppStore();

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-800 flex-shrink-0">
        <div>
          <h2 className="text-sm font-bold text-gray-900 dark:text-gray-100">
            Canlı Akış
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">
            {mapBounds ? 'Harita görünümündeki pinler' : 'Tüm bölge'}
            {reports.length > 0 && ` · ${reports.length} pin`}
          </p>
        </div>
        <button
          onClick={onRefresh}
          disabled={isLoading}
          className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
          title="Yenile"
        >
          <RefreshCw className={`w-4 h-4 text-gray-500 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto timeline-scroll px-3 py-2 space-y-2">
        {isLoading && reports.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 gap-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
            <p className="text-xs text-gray-400">Yükleniyor…</p>
          </div>
        ) : reports.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 gap-3 text-gray-400">
            <Inbox className="w-10 h-10 opacity-40" />
            <div className="text-center">
              <p className="text-sm font-medium">Bu alanda pin yok</p>
              <p className="text-xs mt-1">Haritaya tıklayarak ilk pini ekle</p>
            </div>
          </div>
        ) : (
          reports.map(report => (
            <ReportCard
              key={report.id}
              report={report}
              onClick={() => setSelectedReport(report)}
            />
          ))
        )}
      </div>
    </div>
  );
}
