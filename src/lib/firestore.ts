import {
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDoc,
  setDoc,
  writeBatch,
  onSnapshot,
  Timestamp,
  increment,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from './firebase';
import { Report, UserProfile, CategoryType, SiteConfig } from '@/types';
import { isVerifiedReporter } from './reliability';

const CACHE_KEY = 'anamurpin_reports_v2';
const CACHE_TTL_MS = 5 * 60 * 1000;

function reviveReport(r: any): Report {
  return {
    ...r,
    createdAt: new Timestamp(r.createdAt.seconds, r.createdAt.nanoseconds),
    expiresAt: new Timestamp(r.expiresAt.seconds, r.expiresAt.nanoseconds),
  };
}

function getCache(): { data: Report[]; ts: number } | null {
  try {
    const raw = sessionStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    parsed.data = (parsed.data as any[]).map(reviveReport);
    return parsed;
  } catch {
    return null;
  }
}

function setCache(data: Report[]): void {
  try {
    sessionStorage.setItem(CACHE_KEY, JSON.stringify({ data, ts: Date.now() }));
  } catch {}
}

export function invalidateCache(): void {
  try {
    sessionStorage.removeItem(CACHE_KEY);
  } catch {}
}

export function subscribeToReports(
  onUpdate: (reports: Report[]) => void,
  onError?: (err: Error) => void,
): () => void {
  const now = Timestamp.now();
  const q = query(
    collection(db, 'reports'),
    where('expiresAt', '>', now),
    orderBy('expiresAt', 'asc'),
    limit(200),
  );
  return onSnapshot(
    q,
    (snapshot) => {
      const reports = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Report));
      setCache(reports);
      onUpdate(reports);
    },
    (err) => onError?.(err as Error),
  );
}

export async function fetchReports(forceRefresh = false): Promise<Report[]> {
  if (!forceRefresh) {
    const cached = getCache();
    if (cached && Date.now() - cached.ts < CACHE_TTL_MS) {
      return cached.data;
    }
  }

  const now = Timestamp.now();
  // Single range filter + matching orderBy — no composite index needed
  const q = query(
    collection(db, 'reports'),
    where('expiresAt', '>', now),
    orderBy('expiresAt', 'asc'),
    limit(200),
  );

  const snapshot = await getDocs(q);
  const reports = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Report));

  setCache(reports);
  return reports;
}

export async function fetchReportById(id: string): Promise<Report | null> {
  const snap = await getDoc(doc(db, 'reports', id));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as Report;
}

export async function createReport(
  data: Omit<Report, 'id' | 'createdAt' | 'expiresAt' | 'upvotes' | 'downvotes'> & { durationDays?: number },
): Promise<string> {
  const now = Timestamp.now();
  const days = data.durationDays ?? 2;
  const expiresAt = Timestamp.fromMillis(now.toMillis() + days * 24 * 60 * 60 * 1000);
  const { durationDays: _, ...reportData } = data;

  const docRef = await addDoc(collection(db, 'reports'), {
    ...reportData,
    createdAt: now,
    expiresAt,
    upvotes: 0,
    downvotes: 0,
  });

  invalidateCache();
  return docRef.id;
}

export async function voteOnReport(
  reportId: string,
  voteType: 'up' | 'down',
  authorId: string,
): Promise<void> {
  const batch = writeBatch(db);

  batch.update(doc(db, 'reports', reportId), {
    [voteType === 'up' ? 'upvotes' : 'downvotes']: increment(1),
  });

  batch.update(doc(db, 'users', authorId), {
    netScore: increment(voteType === 'up' ? 1 : -1),
  });

  await batch.commit();
  invalidateCache();
}

export async function uploadReportImage(userId: string, file: File): Promise<string> {
  const path = `reports/${userId}/${Date.now()}.webp`;
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, file, { contentType: 'image/webp' });
  return getDownloadURL(storageRef);
}

export async function fetchUserProfile(userId: string): Promise<UserProfile | null> {
  const snap = await getDoc(doc(db, 'users', userId));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as UserProfile;
}

export async function ensureUserProfile(userId: string): Promise<UserProfile> {
  const userRef = doc(db, 'users', userId);
  const snap = await getDoc(userRef);

  if (snap.exists()) {
    return { id: snap.id, ...snap.data() } as UserProfile;
  }

  const profile: Omit<UserProfile, 'id'> = {
    username: '',
    needsUsername: true,
    netScore: 0,
    createdAt: Timestamp.now(),
  };
  await setDoc(userRef, profile);
  return { id: userId, ...profile };
}

export async function updateUsername(userId: string, username: string): Promise<void> {
  await updateDoc(doc(db, 'users', userId), { username, needsUsername: false });
}

export async function isUsernameAvailable(username: string): Promise<boolean> {
  const q = query(collection(db, 'users'), where('username', '==', username), limit(1));
  const snap = await getDocs(q);
  return snap.empty;
}

export async function deleteReport(reportId: string): Promise<void> {
  await deleteDoc(doc(db, 'reports', reportId));
  invalidateCache();
}

export async function updateReport(
  reportId: string,
  data: { title: string; description: string },
): Promise<void> {
  await updateDoc(doc(db, 'reports', reportId), data);
  invalidateCache();
}

export async function fetchWeeklyLeaderboard(): Promise<{ username: string; count: number }[]> {
  const now = new Date();
  const lastSunday = new Date(now);
  lastSunday.setDate(now.getDate() - now.getDay());
  lastSunday.setHours(0, 0, 0, 0);

  const q = query(
    collection(db, 'reports'),
    where('createdAt', '>=', Timestamp.fromDate(lastSunday)),
    orderBy('createdAt', 'asc'),
    limit(500),
  );

  const snap = await getDocs(q);
  const counts: Record<string, number> = {};
  snap.docs.forEach(d => {
    const { username, status } = d.data();
    if (username && status !== 'removed') {
      counts[username] = (counts[username] || 0) + 1;
    }
  });

  return Object.entries(counts)
    .map(([username, count]) => ({ username, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);
}

export async function getUserNetScore(userId: string): Promise<number> {
  const profile = await fetchUserProfile(userId);
  return profile?.netScore ?? 0;
}

export async function batchDeleteExpiredReports(): Promise<number> {
  const now = Timestamp.now();
  const q = query(
    collection(db, 'reports'),
    where('expiresAt', '<=', now),
    limit(500),
  );

  const snapshot = await getDocs(q);
  if (snapshot.empty) return 0;

  const batch = writeBatch(db);
  snapshot.docs.forEach(d => batch.delete(d.ref));
  await batch.commit();

  invalidateCache();
  return snapshot.size;
}

const DEFAULT_SITE_CONFIG: SiteConfig = {
  announcementEnabled: false,
  announcementText: '',
  announcementType: 'info',
  maintenanceMode: false,
  maintenanceMessage: '',
};

export async function getSiteConfig(): Promise<SiteConfig> {
  const snap = await getDoc(doc(db, 'site_config', 'settings'));
  if (!snap.exists()) return { ...DEFAULT_SITE_CONFIG };
  return { ...DEFAULT_SITE_CONFIG, ...snap.data() } as SiteConfig;
}

export async function updateSiteConfig(config: Partial<SiteConfig>): Promise<void> {
  await setDoc(doc(db, 'site_config', 'settings'), config, { merge: true });
}

export function subscribeSiteConfig(onUpdate: (config: SiteConfig) => void): () => void {
  return onSnapshot(doc(db, 'site_config', 'settings'), (snap) => {
    if (!snap.exists()) { onUpdate({ ...DEFAULT_SITE_CONFIG }); return; }
    onUpdate({ ...DEFAULT_SITE_CONFIG, ...snap.data() } as SiteConfig);
  });
}

export async function fetchAllUsers(limitCount = 200): Promise<UserProfile[]> {
  const q = query(collection(db, 'users'), orderBy('createdAt', 'desc'), limit(limitCount));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as UserProfile));
}

export async function banUser(userId: string, reason: string): Promise<void> {
  await updateDoc(doc(db, 'users', userId), { banned: true, bannedReason: reason });
}

export async function unbanUser(userId: string): Promise<void> {
  await updateDoc(doc(db, 'users', userId), { banned: false, bannedReason: '' });
}

export async function batchDeleteByCategory(category: CategoryType): Promise<number> {
  const q = query(collection(db, 'reports'), where('category', '==', category), limit(500));
  const snap = await getDocs(q);
  if (snap.empty) return 0;
  const batch = writeBatch(db);
  snap.docs.forEach(d => batch.delete(d.ref));
  await batch.commit();
  invalidateCache();
  return snap.size;
}

export async function batchDeleteByUser(userId: string): Promise<number> {
  const q = query(collection(db, 'reports'), where('userId', '==', userId), limit(500));
  const snap = await getDocs(q);
  if (snap.empty) return 0;
  const batch = writeBatch(db);
  snap.docs.forEach(d => batch.delete(d.ref));
  await batch.commit();
  invalidateCache();
  return snap.size;
}
