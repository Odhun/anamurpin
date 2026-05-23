import { Timestamp } from 'firebase/firestore';

export type CategoryType = 'emergency' | 'event' | 'weather' | 'lost' | 'general';

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
  netScore: number;
  createdAt: Timestamp;
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
