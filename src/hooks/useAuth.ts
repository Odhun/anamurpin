'use client';

import { useEffect } from 'react';
import {
  onAuthStateChanged,
  signInAnonymously,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  GoogleAuthProvider,
} from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { ensureUserProfile, getUserNetScore } from '@/lib/firestore';
import { useAppStore } from '@/store/useAppStore';

export function useAuth() {
  const { user, setUser, setUserNetScore, setUserProfile, setShowUsernameModal } = useAppStore();

  useEffect(() => {
    // Process any pending redirect result; onAuthStateChanged fires after this resolves
    getRedirectResult(auth).catch((e) => {
      if (e.code !== 'auth/cancelled-popup-request') {
        console.error('getRedirectResult error:', e.code);
      }
    });

    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);

      if (firebaseUser === null) {
        // Firebase fully initialized, no user found — sign in anonymously for browsing
        signInAnonymously(auth).catch(() => {});
        return;
      }

      if (!firebaseUser.isAnonymous) {
        const profile = await ensureUserProfile(firebaseUser.uid);
        setUserProfile(profile);
        if (profile.needsUsername) {
          setShowUsernameModal(true);
        }
        const score = await getUserNetScore(firebaseUser.uid);
        setUserNetScore(score);
      }
    });

    return unsub;
  }, [setUser, setUserNetScore]);

  async function upgradeWithGoogle(): Promise<void> {
    const provider = new GoogleAuthProvider();
    try {
      // Popup: works in Chrome/Safari directly
      await signInWithPopup(auth, provider);
    } catch (err: any) {
      if (err.code === 'auth/popup-blocked' || err.code === 'auth/popup-cancelled') {
        // Firefox blocks popups — fall back to redirect (works with proxy + registered redirect URI)
        await signInWithRedirect(auth, provider);
      } else {
        throw err;
      }
    }
  }

  async function signOut(): Promise<void> {
    await auth.signOut();
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
