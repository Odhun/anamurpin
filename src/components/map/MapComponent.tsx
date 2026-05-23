'use client';

import { useCallback, useState } from 'react';
import { MapContainer, TileLayer, useMapEvents, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Navigation, Loader2 } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { Report } from '@/types';
import { getCategoryMeta } from '@/utils/categories';
import MapController from './MapController';

// CartoDB tile layers
const TILES = {
  light: {
    url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
  },
  dark: {
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
  },
};

const MAP_CENTER: [number, number] = [36.0741, 32.8355];
const MAP_BOUNDS: [[number, number], [number, number]] = [
  [35.9, 32.6],
  [36.3, 33.3],
];

function createPinIcon(category: string, isPremium: boolean, isNew: boolean): L.DivIcon {
  const meta = getCategoryMeta(category as any);
  const pulse = isNew
    ? `<span style="
        position:absolute;inset:-5px;border-radius:50%;
        border:2px solid ${meta.color};
        animation:ping-ring 1.8s cubic-bezier(0,0,0.2,1) infinite;
      "></span>`
    : '';

  return L.divIcon({
    className: '',
    html: `
      <div style="position:relative;width:36px;height:44px;" class="pin-marker${isPremium ? ' pin-marker-premium' : ''}">
        ${pulse}
        <div style="
          position:absolute;
          bottom:0;left:50%;
          transform:translateX(-50%);
          background:${meta.color};
          width:36px;height:36px;
          border-radius:50% 50% 50% 0;
          transform:translateX(-50%) rotate(-45deg);
          border:2.5px solid white;
          box-shadow:0 3px 10px rgba(0,0,0,0.35);
          ${isPremium ? 'border-color:#fbbf24;box-shadow:0 3px 12px rgba(251,191,36,0.5);' : ''}
          display:flex;align-items:center;justify-content:center;
        ">
          <span style="transform:rotate(45deg);font-size:15px;line-height:1;">${meta.emoji}</span>
        </div>
      </div>
    `,
    iconSize: [36, 44],
    iconAnchor: [18, 44],
    popupAnchor: [0, -44],
  });
}

function isNewReport(createdAt: { toMillis: () => number }): boolean {
  return Date.now() - createdAt.toMillis() < 60 * 60 * 1000;
}

function LocateMe() {
  const map = useMap();
  const [locating, setLocating] = useState(false);

  function handleLocate() {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        map.flyTo([coords.latitude, coords.longitude], 15, { duration: 1 });
        setLocating(false);
      },
      () => setLocating(false),
      { timeout: 8000, maximumAge: 60000 },
    );
  }

  return (
    <div className="leaflet-bottom leaflet-right" style={{ marginBottom: '28px' }}>
      <div className="leaflet-control">
        <button
          onClick={handleLocate}
          title="Konumumu Bul"
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 40, height: 40 }}
          className="rounded-full bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          {locating ? (
            <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
          ) : (
            <Navigation className="w-5 h-5 text-blue-500" />
          )}
        </button>
      </div>
    </div>
  );
}

function MapEvents() {
  const { setMapBounds, setAddPinCoords, setIsAddingPin, user, setShowAuthModal } =
    useAppStore();

  useMapEvents({
    moveend: (e) => {
      const b = e.target.getBounds();
      setMapBounds({
        north: b.getNorth(),
        south: b.getSouth(),
        east: b.getEast(),
        west: b.getWest(),
      });
    },
    click: (e) => {
      if (!user || user.isAnonymous) {
        setShowAuthModal(true);
        return;
      }
      setAddPinCoords({ lat: e.latlng.lat, lng: e.latlng.lng });
      setIsAddingPin(true);
    },
  });

  return null;
}

interface MapComponentProps {
  reports: Report[];
  focusReportId?: string;
}

export default function MapComponent({ reports, focusReportId }: MapComponentProps) {
  const { isDarkMode, setSelectedReport } = useAppStore();
  const tiles = isDarkMode ? TILES.dark : TILES.light;

  const handleMarkerClick = useCallback(
    (report: Report) => () => setSelectedReport(report),
    [setSelectedReport],
  );

  return (
    <MapContainer
      center={MAP_CENTER}
      zoom={13}
      minZoom={9}
      maxZoom={18}
      maxBounds={MAP_BOUNDS}
      maxBoundsViscosity={0.8}
      className="w-full h-full z-0"
      style={{ background: isDarkMode ? '#1a1a2e' : '#e8e4d9' }}
    >
      <TileLayer
        key={isDarkMode ? 'dark' : 'light'}
        url={tiles.url}
        attribution={tiles.attribution}
        subdomains="abcd"
        maxZoom={19}
      />

      <MapEvents />
      <LocateMe />
      <MapController focusReportId={focusReportId} reports={reports} />

      {reports.map((report) => (
        <Marker
          key={report.id}
          position={[report.latitude, report.longitude]}
          icon={createPinIcon(
            report.category,
            report.isPremium,
            isNewReport(report.createdAt),
          )}
          eventHandlers={{ click: handleMarkerClick(report) }}
        />
      ))}
    </MapContainer>
  );
}
