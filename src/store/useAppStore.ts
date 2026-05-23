import { create } from 'zustand';
import { User } from 'firebase/auth';
import { Report, CategoryType, MapBounds } from '@/types';

interface AppState {
  // Auth
  user: User | null;
  userNetScore: number;
  setUser: (user: User | null) => void;
  setUserNetScore: (score: number) => void;

  // Reports cache
  reports: Report[];
  isFetchingReports: boolean;
  lastFetchTime: number | null;
  setReports: (reports: Report[]) => void;
  setIsFetchingReports: (v: boolean) => void;
  addReportToCache: (report: Report) => void;
  updateReportInCache: (id: string, updates: Partial<Report>) => void;

  // Selection / modals
  selectedReport: Report | null;
  setSelectedReport: (report: Report | null) => void;
  showAuthModal: boolean;
  setShowAuthModal: (v: boolean) => void;

  // Add-pin mode
  isAddingPin: boolean;
  addPinCoords: { lat: number; lng: number } | null;
  setIsAddingPin: (v: boolean) => void;
  setAddPinCoords: (coords: { lat: number; lng: number } | null) => void;

  // Filters (client-side only — no Firestore query triggered)
  selectedCategories: CategoryType[];
  toggleCategory: (cat: CategoryType) => void;
  resetCategories: () => void;

  // Map viewport (for timeline filtering)
  mapBounds: MapBounds | null;
  setMapBounds: (bounds: MapBounds) => void;

  // Theme
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  setDarkMode: (v: boolean) => void;

  // Weather / frost
  temperature: number | null;
  setTemperature: (t: number | null) => void;
}

const ALL_CATEGORIES: CategoryType[] = ['emergency', 'event', 'weather', 'lost', 'general'];

export const useAppStore = create<AppState>((set) => ({
  user: null,
  userNetScore: 0,
  setUser: (user) => set({ user }),
  setUserNetScore: (score) => set({ userNetScore: score }),

  reports: [],
  isFetchingReports: false,
  lastFetchTime: null,
  setReports: (reports) => set({ reports, lastFetchTime: Date.now() }),
  setIsFetchingReports: (v) => set({ isFetchingReports: v }),
  addReportToCache: (report) =>
    set((s) => ({ reports: [report, ...s.reports] })),
  updateReportInCache: (id, updates) =>
    set((s) => ({
      reports: s.reports.map(r => r.id === id ? { ...r, ...updates } : r),
    })),

  selectedReport: null,
  setSelectedReport: (report) => set({ selectedReport: report }),
  showAuthModal: false,
  setShowAuthModal: (v) => set({ showAuthModal: v }),

  isAddingPin: false,
  addPinCoords: null,
  setIsAddingPin: (v) => set({ isAddingPin: v }),
  setAddPinCoords: (coords) => set({ addPinCoords: coords }),

  selectedCategories: ALL_CATEGORIES,
  toggleCategory: (cat) =>
    set((s) => {
      const active = s.selectedCategories;
      const next = active.includes(cat)
        ? active.filter(c => c !== cat)
        : [...active, cat];
      return { selectedCategories: next.length === 0 ? ALL_CATEGORIES : next };
    }),
  resetCategories: () => set({ selectedCategories: ALL_CATEGORIES }),

  mapBounds: null,
  setMapBounds: (bounds) => set({ mapBounds: bounds }),

  isDarkMode: false,
  toggleDarkMode: () =>
    set((s) => {
      const next = !s.isDarkMode;
      if (typeof document !== 'undefined') {
        document.documentElement.classList.toggle('dark', next);
        localStorage.setItem('anamurpin_theme', next ? 'dark' : 'light');
      }
      return { isDarkMode: next };
    }),
  setDarkMode: (v) => set({ isDarkMode: v }),

  temperature: null,
  setTemperature: (t) => set({ temperature: t }),
}));
