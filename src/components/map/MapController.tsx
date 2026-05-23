'use client';

import { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import { Report } from '@/types';
import { useAppStore } from '@/store/useAppStore';

interface MapControllerProps {
  focusReportId?: string;
  reports: Report[];
}

export default function MapController({ focusReportId, reports }: MapControllerProps) {
  const map = useMap();
  const { setMapBounds, setSelectedReport } = useAppStore();

  // Initialize bounds
  useEffect(() => {
    const b = map.getBounds();
    setMapBounds({
      north: b.getNorth(),
      south: b.getSouth(),
      east: b.getEast(),
      west: b.getWest(),
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Pan + zoom to focused report (deep link)
  useEffect(() => {
    if (!focusReportId || reports.length === 0) return;
    const report = reports.find(r => r.id === focusReportId);
    if (report) {
      map.setView([report.latitude, report.longitude], 15, { animate: true });
      setSelectedReport(report);
    }
  }, [focusReportId, reports, map, setSelectedReport]);

  return null;
}
