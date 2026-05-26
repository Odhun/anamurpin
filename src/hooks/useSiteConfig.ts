'use client';

import { useEffect } from 'react';
import { subscribeSiteConfig } from '@/lib/firestore';
import { useAppStore } from '@/store/useAppStore';

export function useSiteConfig() {
  const setSiteConfig = useAppStore(s => s.setSiteConfig);

  useEffect(() => {
    const unsub = subscribeSiteConfig((config) => setSiteConfig(config));
    return unsub;
  }, [setSiteConfig]);
}
