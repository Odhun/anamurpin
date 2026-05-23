import {
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  addDoc,
  updateDoc,
  doc,
  getDoc,
  setDoc,
  writeBatch,
  Timestamp,
  increment,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from './firebase';
import { Report, UserProfile, CategoryType } from '@/types';
import { isVerifiedReporter } from './reliability';

const CACHE_KEY = 'anamurpin_reports_v2';
const CACHE_TTL_MS = 5 * 60 * 1000;

function getCache(): { data: Report[]; ts: number } | null {
  try {
    const raw = sessionStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
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
  data: Omit<Report, 'id' | 'createdAt' | 'expiresAt' | 'upvotes' | 'downvotes'>,
): Promise<string> {
  const now = Timestamp.now();
  const expiresAt = Timestamp.fromMillis(now.toMillis() + 7 * 24 * 60 * 60 * 1000);

  const docRef = await addDoc(collection(db, 'reports'), {
    ...data,
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

export async function ensureUserProfile(
  userId: string,
  username: string,
): Promise<UserProfile> {
  const userRef = doc(db, 'users', userId);
  const snap = await getDoc(userRef);

  if (snap.exists()) {
    return { id: snap.id, ...snap.data() } as UserProfile;
  }

  const profile: Omit<UserProfile, 'id'> = {
    username,
    netScore: 0,
    createdAt: Timestamp.now(),
  };
  await setDoc(userRef, profile);
  return { id: userId, ...profile };
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
