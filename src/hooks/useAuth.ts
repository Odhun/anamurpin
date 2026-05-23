'use client';

import { useEffect } from 'react';
import {
  onAuthStateChanged,
  signInAnonymously,
  signInWithPopup,
  GoogleAuthProvider,
  linkWithPopup,
  User,
} from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { ensureUserProfile, getUserNetScore } from '@/lib/firestore';
import { useAppStore } from '@/store/useAppStore';

export function useAuth() {
  const { user, setUser, setUserNetScore } = useAppStore();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);

      if (firebaseUser && !firebaseUser.isAnonymous) {
        const displayName = firebaseUser.displayName ?? firebaseUser.email ?? 'Kullanıcı';
        await ensureUserProfile(firebaseUser.uid, displayName);
        const score = await getUserNetScore(firebaseUser.uid);
        setUserNetScore(score);
      }
    });

    // Auto sign-in anonymously so new visitors can browse immediately
    if (!auth.currentUser) {
      signInAnonymously(auth).catch(() => {});
    }

    return unsub;
  }, [setUser, setUserNetScore]);

  async function upgradeWithGoogle(): Promise<void> {
    const provider = new GoogleAuthProvider();
    if (user?.isAnonymous) {
      await linkWithPopup(user, provider);
    } else {
      await signInWithPopup(auth, provider);
    }
  }

  async function signOut(): Promise<void> {
    await auth.signOut();
    // Re-sign in anonymously for browsing
    await signInAnonymously(auth);
  }

  return {
    user,
    isAnonymous: user?.isAnonymous ?? true,
    isAuthenticated: !!user && !user.isAnonymous,
    upgradeWithGoogle,
    signOut,
  };
}
