'use client';

import { CATEGORIES } from '@/utils/categories';
import { useAppStore } from '@/store/useAppStore';

export default function CategoryFilter() {
  const { selectedCategories, toggleCategory } = useAppStore();

  return (
    <div className="flex items-center gap-1.5 px-3 py-2 overflow-x-auto scrollbar-hide border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-950 flex-shrink-0">
      {CATEGORIES.map(cat => {
        const active = selectedCategories.includes(cat.id);
        return (
          <button
            key={cat.id}
            onClick={() => toggleCategory(cat.id)}
            className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border transition-all ${
              active
                ? 'text-white border-transparent'
                : 'border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-900'
            }`}
            style={active ? { backgroundColor: cat.color, borderColor: cat.color } : {}}
          >
            <span>{cat.emoji}</span>
            <span className="hidden sm:inline">{cat.label.split('/')[0].trim()}</span>
          </button>
        );
      })}
    </div>
  );
}
