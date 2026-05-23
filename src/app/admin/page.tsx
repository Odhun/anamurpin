'use client';

import { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useAppStore } from '@/store/useAppStore';
import AdminPanel from '@/components/admin/AdminPanel';
import Header from '@/components/ui/Header';
import { ShieldOff } from 'lucide-react';

const ADMIN_UID = process.env.NEXT_PUBLIC_ADMIN_UID;

export default function AdminPage() {
  useAuth();
  const { user, setDarkMode } = useAppStore();

  useEffect(() => {
    const saved = localStorage.getItem('anamurpin_theme');
    setDarkMode(saved === 'dark');
  }, [setDarkMode]);

  const isAdmin = !!user && !user.isAnonymous && user.uid === ADMIN_UID;

  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-950">
      <Header />
      <div className="flex-1 overflow-auto p-6 max-w-3xl mx-auto w-full">
        {isAdmin ? (
          <AdminPanel />
        ) : (
          <div className="flex flex-col items-center justify-center h-full gap-4 text-gray-500">
            <ShieldOff className="w-16 h-16 opacity-30" />
            <p className="text-lg font-medium">Yetkisiz Erişim</p>
            <p className="text-sm text-center">
              Bu sayfaya erişmek için admin yetkisi gerekiyor.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
