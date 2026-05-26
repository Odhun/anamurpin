import { create } from 'zustand';
import { User } from 'firebase/auth';
import { Report, CategoryType, MapBounds, UserProfile, SiteConfig } from '@/types';

type UsernameModalMode = 'select' | 'change';
type TimeFilter = 'all' | '1h' | '24h' | '7d';

interface AppState {
  // Auth
  user: User | null;
  userProfile: UserProfile | null;
  userNetScore: number;
  setUser: (user: User | null) => void;
  setUserProfile: (profile: UserProfile | null) => void;
  setUserNetScore: (score: number) => void;

  // Username modal
  showUsernameModal: boolean;
  usernameModalMode: UsernameModalMode;
  setShowUsernameModal: (v: boolean) => void;
  openUsernameSelect: () => void;
  openUsernameChange: () => void;

  // Reports cache
  reports: Report[];
  isFetchingReports: boolean;
  lastFetchTime: number | null;
  setReports: (reports: Report[]) => void;
  setIsFetchingReports: (v: boolean) => void;
  addReportToCache: (report: Report) => void;
  updateReportInCache: (id: string, updates: Partial<Report>) => void;
  removeReportFromCache: (id: string) => void;

  // New pins notification
  newPinsCount: number;
  setNewPinsCount: (n: number) => void;
  clearNewPins: () => void;

  // Selection / modals
  selectedReport: Report | null;
  setSelectedReport: (report: Report | null) => void;
  showAuthModal: boolean;
  setShowAuthModal: (v: boolean) => void;
  showLeaderboard: boolean;
  setShowLeaderboard: (v: boolean) => void;

  // Add-pin mode
  isAddingPin: boolean;
  addPinCoords: { lat: number; lng: number } | null;
  setIsAddingPin: (v: boolean) => void;
  setAddPinCoords: (coords: { lat: number; lng: number } | null) => void;

  // Filters
  selectedCategories: CategoryType[];
  toggleCategory: (cat: CategoryType) => void;
  resetCategories: () => void;
  timeFilter: TimeFilter;
  setTimeFilter: (f: TimeFilter) => void;

  // Map viewport
  mapBounds: MapBounds | null;
  setMapBounds: (bounds: MapBounds) => void;

  // Theme
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  setDarkMode: (v: boolean) => void;

  // Weather / frost
  temperature: number | null;
  setTemperature: (t: number | null) => void;

  // Site config
  siteConfig: SiteConfig | null;
  setSiteConfig: (config: SiteConfig | null) => void;
}

const ALL_CATEGORIES: CategoryType[] = ['emergency', 'traffic', 'fight', 'event', 'radar', 'weather', 'lost', 'general', 'other', 'ad'];

export const useAppStore = create<AppState>((set) => ({
  user: null,
  userProfile: null,
  userNetScore: 0,
  setUser: (user) => set({ user }),
  setUserProfile: (profile) => set({ userProfile: profile }),
  setUserNetScore: (score) => set({ userNetScore: score }),

  showUsernameModal: false,
  usernameModalMode: 'select',
  setShowUsernameModal: (v) => set({ showUsernameModal: v }),
  openUsernameSelect: () => set({ showUsernameModal: true, usernameModalMode: 'select' }),
  openUsernameChange: () => set({ showUsernameModal: true, usernameModalMode: 'change' }),

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
  removeReportFromCache: (id) =>
    set((s) => ({ reports: s.reports.filter(r => r.id !== id) })),

  newPinsCount: 0,
  setNewPinsCount: (n) => set({ newPinsCount: n }),
  clearNewPins: () => set({ newPinsCount: 0 }),

  selectedReport: null,
  setSelectedReport: (report) => set({ selectedReport: report }),
  showAuthModal: false,
  setShowAuthModal: (v) => set({ showAuthModal: v }),
  showLeaderboard: false,
  setShowLeaderboard: (v) => set({ showLeaderboard: v }),

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
  timeFilter: 'all',
  setTimeFilter: (f) => set({ timeFilter: f }),

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

  siteConfig: null,
  setSiteConfig: (config) => set({ siteConfig: config }),
}));
