import { Metadata } from 'next';
import PinPageClient from './PinPageClient';

interface Props {
  params: { reportId: string };
}

async function fetchPinMeta(reportId: string): Promise<{
  title: string;
  description: string;
  imageUrl: string | null;
  category: string;
} | null> {
  try {
    const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
    if (!projectId) return null;
    const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/reports/${reportId}`;
    const res = await fetch(url, { next: { revalidate: 300 } });
    if (!res.ok) return null;
    const data = await res.json();
    const f = data.fields ?? {};
    return {
      title: f.title?.stringValue ?? '',
      description: f.description?.stringValue ?? '',
      imageUrl: f.imageUrl?.stringValue ?? null,
      category: f.category?.stringValue ?? 'general',
    };
  } catch {
    return null;
  }
}

const CATEGORY_LABELS: Record<string, string> = {
  emergency: '🚨 Son Dakika',
  event: '🎉 Etkinlik',
  weather: '🌦️ Hava & Tarım',
  lost: '🐾 Kayıp',
  general: '💬 Genel',
  ad: '📢 Duyuru',
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const pin = await fetchPinMeta(params.reportId);
  if (!pin || !pin.title) {
    return {
      title: 'AnamurPin — Yerel Haber',
      description: 'AnamurPin üzerinde paylaşılan yerel haber',
    };
  }

  const categoryLabel = CATEGORY_LABELS[pin.category] ?? '📍 Pin';
  const desc = pin.description
    ? pin.description.slice(0, 160)
    : `${categoryLabel} — AnamurPin`;

  return {
    title: `${pin.title} — AnamurPin`,
    description: desc,
    openGraph: {
      title: pin.title,
      description: desc,
      type: 'article',
      siteName: 'AnamurPin',
      ...(pin.imageUrl && { images: [{ url: pin.imageUrl, alt: pin.title }] }),
    },
    twitter: {
      card: pin.imageUrl ? 'summary_large_image' : 'summary',
      title: pin.title,
      description: desc,
      ...(pin.imageUrl && { images: [pin.imageUrl] }),
    },
  };
}

export default function PinPage({ params }: Props) {
  return <PinPageClient reportId={params.reportId} />;
}
