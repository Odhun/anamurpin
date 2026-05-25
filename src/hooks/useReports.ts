'use client';

import { useEffect, useMemo, useRef, useCallback } from 'react';
import { subscribeToReports } from '@/lib/firestore';
import { useAppStore } from '@/store/useAppStore';
import { Report, CategoryType } from '@/types';
import { isReportHidden } from '@/lib/reliability';

const TIME_LIMITS: Record<string, number> = {
  '1h': 3_600_000,
  '24h': 86_400_000,
  '7d': 604_800_000,
};

export function useReports() {
  const {
    reports,
    isFetchingReports,
    setReports,
    setIsFetchingReports,
    selectedCategories,
    mapBounds,
    setNewPinsCount,
    clearNewPins,
    timeFilter,
  } = useAppStore();

  const initialIds = useRef<Set<string> | null>(null);
  const reportsRef = useRef<Report[]>([]);
  reportsRef.current = reports;

  useEffect(() => {
    setIsFetchingReports(true);
    const unsub = subscribeToReports(
      (data) => {
        if (initialIds.current === null) {
          initialIds.current = new Set(data.map(r => r.id));
        } else {
          const newCount = data.filter(r => !initialIds.current!.has(r.id)).length;
          if (newCount > 0) setNewPinsCount(newCount);
        }
        // Auto-close modal if the selected pin was deleted or expired
        const { selectedReport, setSelectedReport } = useAppStore.getState();
        if (selectedReport && !data.find(r => r.id === selectedReport.id)) {
          setSelectedReport(null);
        }
        setReports(data);
        setIsFetchingReports(false);
      },
      () => setIsFetchingReports(false),
    );
    return unsub;
  }, [setReports, setIsFetchingReports, setNewPinsCount]);

  const refresh = useCallback(() => {
    initialIds.current = new Set(reportsRef.current.map(r => r.id));
    clearNewPins();
  }, [clearNewPins]);

  const categoryFiltered = useMemo((): Report[] => {
    const now = Date.now();
    const limit = TIME_LIMITS[timeFilter] ?? 0;
    return reports.filter(
      r =>
        r.status === 'active' &&
        !isReportHidden(r) &&
        selectedCategories.includes(r.category as CategoryType) &&
        (timeFilter === 'all' || now - r.createdAt.toMillis() < limit),
    );
  }, [reports, selectedCategories, timeFilter]);

  const viewportFiltered = useMemo((): Report[] => {
    if (!mapBounds) return categoryFiltered;
    return categoryFiltered.filter(
      r =>
        r.latitude >= mapBounds.south &&
        r.latitude <= mapBounds.north &&
        r.longitude >= mapBounds.west &&
        r.longitude <= mapBounds.east,
    );
  }, [categoryFiltered, mapBounds]);

  const sortedTimeline = useMemo(() => {
    const byTime = (a: Report, b: Report) => b.createdAt.toMillis() - a.createdAt.toMillis();
    // Last 2 ads pinned at top, rest sorted by time
    const ads = viewportFiltered.filter(r => r.category === 'ad').sort(byTime).slice(0, 2);
    const rest = viewportFiltered.filter(r => r.category !== 'ad').sort(byTime);
    return [...ads, ...rest];
  }, [viewportFiltered]);

  return {
    allReports: categoryFiltered,
    timelineReports: sortedTimeline,
    isLoading: isFetchingReports,
    refresh,
  };
}
