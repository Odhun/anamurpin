'use client';

import dynamic from 'next/dynamic';
import { Report } from '@/types';

const MapComponent = dynamic(() => import('./MapComponent'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-900">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500" />
    </div>
  ),
});

interface MapViewProps {
  reports: Report[];
  focusReportId?: string;
}

export default function MapView(props: MapViewProps) {
  return <MapComponent {...props} />;
}
