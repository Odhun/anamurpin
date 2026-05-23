'use client';

import { useEffect, useMemo, useCallback } from 'react';
import { fetchReports } from '@/lib/firestore';
import { useAppStore } from '@/store/useAppStore';
import { Report, CategoryType } from '@/types';
import { isReportHidden } from '@/lib/reliability';

export function useReports() {
  const {
    reports,
    isFetchingReports,
    setReports,
    setIsFetchingReports,
    selectedCategories,
    mapBounds,
  } = useAppStore();

  const loadReports = useCallback(async (force = false) => {
    setIsFetchingReports(true);
    try {
      const data = await fetchReports(force);
      setReports(data);
    } catch (err) {
      console.error('Report fetch failed:', err);
    } finally {
      setIsFetchingReports(false);
    }
  }, [setReports, setIsFetchingReports]);

  useEffect(() => {
    loadReports();
  }, [loadReports]);

  // Client-side filter: categories, hidden (reliability), status
  const categoryFiltered = useMemo((): Report[] => {
    return reports.filter(
      r =>
        r.status === 'active' &&
        !isReportHidden(r) &&
        selectedCategories.includes(r.category as CategoryType),
    );
  }, [reports, selectedCategories]);

  // Further filter by current map viewport
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

  // Sort by createdAt descending (newest first)
  const sortedTimeline = useMemo(
    () =>
      [...viewportFiltered].sort(
        (a, b) => b.createdAt.toMillis() - a.createdAt.toMillis(),
      ),
    [viewportFiltered],
  );

  return {
    allReports: categoryFiltered,
    timelineReports: sortedTimeline,
    isLoading: isFetchingReports,
    refresh: () => loadReports(true),
  };
}
