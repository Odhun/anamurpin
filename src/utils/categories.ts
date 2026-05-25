import { CategoryType } from '@/types';

export interface CategoryMeta {
  id: CategoryType;
  emoji: string;
  label: string;
  color: string;
  bgColor: string;
  borderColor: string;
  description: string;
}

export const CATEGORIES: CategoryMeta[] = [
  {
    id: 'emergency',
    emoji: '🚨',
    label: 'Son Dakika / Asayiş',
    color: '#ef4444',
    bgColor: 'bg-red-100 dark:bg-red-900/30',
    borderColor: 'border-red-400',
    description: 'Kaza, yol kapanması, kesinti',
  },
  {
    id: 'traffic',
    emoji: '🚗',
    label: 'Trafik Kazası',
    color: '#dc2626',
    bgColor: 'bg-red-100 dark:bg-red-900/30',
    borderColor: 'border-red-500',
    description: 'Trafik kazası, yol kapanması',
  },
  {
    id: 'fight',
    emoji: '⚠️',
    label: 'Kavga / Olay',
    color: '#b45309',
    bgColor: 'bg-amber-100 dark:bg-amber-900/30',
    borderColor: 'border-amber-600',
    description: 'Kavga, asayiş olayı',
  },
  {
    id: 'event',
    emoji: '🎉',
    label: 'Etkinlik / Duyuru',
    color: '#8b5cf6',
    bgColor: 'bg-purple-100 dark:bg-purple-900/30',
    borderColor: 'border-purple-400',
    description: 'Festival, ilan, düğün/cenaze',
  },
  {
    id: 'radar',
    emoji: '📷',
    label: 'Radar / Denetim',
    color: '#0891b2',
    bgColor: 'bg-cyan-100 dark:bg-cyan-900/30',
    borderColor: 'border-cyan-400',
    description: 'Radar noktası, trafik denetimi',
  },
  {
    id: 'weather',
    emoji: '🌦️',
    label: 'Hava & Tarım',
    color: '#3b82f6',
    bgColor: 'bg-blue-100 dark:bg-blue-900/30',
    borderColor: 'border-blue-400',
    description: 'Fırtına uyarısı, don alarmı',
  },
  {
    id: 'lost',
    emoji: '🐾',
    label: 'Kayıp / Bulunan',
    color: '#f97316',
    bgColor: 'bg-orange-100 dark:bg-orange-900/30',
    borderColor: 'border-orange-400',
    description: 'Kayıp hayvan, bulunan eşya',
  },
  {
    id: 'general',
    emoji: '💬',
    label: 'Genel / Serbest Kürsü',
    color: '#22c55e',
    bgColor: 'bg-green-100 dark:bg-green-900/30',
    borderColor: 'border-green-400',
    description: 'Genel haberleşme, durum',
  },
  {
    id: 'other',
    emoji: '🔖',
    label: 'Diğer',
    color: '#6b7280',
    bgColor: 'bg-gray-100 dark:bg-gray-800',
    borderColor: 'border-gray-400',
    description: 'Diğer konular',
  },
  {
    id: 'ad',
    emoji: '📢',
    label: 'Reklam / Duyuru',
    color: '#f59e0b',
    bgColor: 'bg-amber-100 dark:bg-amber-900/30',
    borderColor: 'border-amber-400',
    description: 'Sponsor içerik (sadece admin)',
  },
];

export function getCategoryMeta(id: CategoryType): CategoryMeta {
  return CATEGORIES.find(c => c.id === id) ?? CATEGORIES[4];
}
