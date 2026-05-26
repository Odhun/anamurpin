import { Timestamp } from 'firebase/firestore';

export type CategoryType = 'emergency' | 'traffic' | 'fight' | 'event' | 'radar' | 'weather' | 'lost' | 'general' | 'other' | 'ad';

export interface Report {
  id: string;
  userId: string;
  username: string;
  category: CategoryType;
  title: string;
  description: string;
  latitude: number;
  longitude: number;
  imageUrl: string | null;
  createdAt: Timestamp;
  expiresAt: Timestamp;
  upvotes: number;
  downvotes: number;
  status: 'active' | 'removed';
  isPremium: boolean;
  authorVerified: boolean;
}

export interface UserProfile {
  id: string;
  username: string;
  needsUsername?: boolean;
  netScore: number;
  createdAt: Timestamp;
  banned?: boolean;
  bannedReason?: string;
}

export interface SiteConfig {
  announcementEnabled: boolean;
  announcementText: string;
  announcementType: 'info' | 'warning' | 'error' | 'success';
  maintenanceMode: boolean;
  maintenanceMessage?: string;
}

export interface WeatherData {
  temperature: number;
  time: string;
}

export interface MapBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

export interface ReportFormData {
  title: string;
  description: string;
  category: CategoryType;
  imageFile: File | null;
}
