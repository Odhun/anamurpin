'use client';

import { Sun, Moon } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';

export default function ThemeToggle() {
  const { isDarkMode, toggleDarkMode } = useAppStore();

  return (
    <button
      onClick={toggleDarkMode}
      className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
      aria-label={isDarkMode ? 'Açık mod' : 'Koyu mod'}
      title={isDarkMode ? 'Açık moda geç' : 'Koyu moda geç (Gece nöbeti)'}
    >
      {isDarkMode ? (
        <Sun className="w-5 h-5 text-yellow-400" />
      ) : (
        <Moon className="w-5 h-5 text-gray-500" />
      )}
    </button>
  );
}
