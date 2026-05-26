'use client';

import { useState, useRef } from 'react';
import { X, MapPin, Image as ImageIcon, Loader2, AlertCircle, Navigation, Clock } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { getCategoryMeta, CATEGORIES } from '@/utils/categories';
import { CategoryType } from '@/types';
import { createReport, uploadReportImage } from '@/lib/firestore';
import { compressToWebP, isBlockedFileType, formatFileSize } from '@/lib/imageCompression';
import { getUserNetScore } from '@/lib/firestore';
import { isVerifiedReporter } from '@/lib/reliability';
import { isAdminUser } from '@/lib/admin';

const RATE_KEY = 'anamurpin_pin_times';
const RATE_LIMIT = 5;
const RATE_WINDOW_MS = 60 * 60 * 1000;

function getPinTimes(): number[] {
  try {
    const raw = localStorage.getItem(RATE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function canCreatePin(): boolean {
  const cutoff = Date.now() - RATE_WINDOW_MS;
  return getPinTimes().filter(t => t > cutoff).length < RATE_LIMIT;
}

function remainingPins(): number {
  const cutoff = Date.now() - RATE_WINDOW_MS;
  const used = getPinTimes().filter(t => t > cutoff).length;
  return Math.max(0, RATE_LIMIT - used);
}

function recordPin(): void {
  const cutoff = Date.now() - RATE_WINDOW_MS;
  const recent = getPinTimes().filter(t => t > cutoff);
  recent.push(Date.now());
  try { localStorage.setItem(RATE_KEY, JSON.stringify(recent)); } catch {}
}

export default function AddPinModal() {
  const {
    user,
    userProfile,
    siteConfig,
    addPinCoords,
    setIsAddingPin,
    setAddPinCoords,
  } = useAppStore();

  const isAdmin = isAdminUser(user);
  const visibleCategories = CATEGORIES.filter(c => c.id !== 'ad' || isAdmin);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<CategoryType>('general');
  const [days, setDays] = useState(2);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [locatingGPS, setLocatingGPS] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  function handleGPSLocation() {
    if (!navigator.geolocation) return;
    setLocatingGPS(true);
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setAddPinCoords({ lat: coords.latitude, lng: coords.longitude });
        setLocatingGPS(false);
      },
      () => setLocatingGPS(false),
      { timeout: 8000, maximumAge: 30000 },
    );
  }

  async function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (isBlockedFileType(file)) {
      setError('Video yüklemek yasaktır. Lütfen resim seçin.');
      return;
    }

    try {
      setError(null);
      const compressed = await compressToWebP(file);
      setImageFile(compressed);
      setImagePreview(URL.createObjectURL(compressed));
    } catch (err: any) {
      setError(err.message);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user || user.isAnonymous || !addPinCoords) return;

    if (!isAdmin && userProfile?.banned) {
      setError(`Hesabınız yasaklandı.${userProfile.bannedReason ? ` Sebep: ${userProfile.bannedReason}` : ''}`);
      return;
    }

    if (!isAdmin && siteConfig?.maintenanceMode) {
      setError(siteConfig.maintenanceMessage || 'Site şu anda bakım modunda. Lütfen daha sonra tekrar deneyin.');
      return;
    }

    if (!isAdmin && !canCreatePin()) {
      setError(`Saatlik pin limitine ulaştınız (${RATE_LIMIT} pin/saat). Biraz bekleyin.`);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const username = userProfile?.username || 'Kullanıcı';

      let imageUrl: string | null = null;
      if (imageFile) {
        imageUrl = await uploadReportImage(user.uid, imageFile);
      }

      const netScore = await getUserNetScore(user.uid);
      const authorVerified = isVerifiedReporter(netScore);

      const id = await createReport({
        userId: user.uid,
        username,
        category,
        title: title.trim(),
        description: description.trim(),
        latitude: addPinCoords.lat,
        longitude: addPinCoords.lng,
        imageUrl,
        status: 'active',
        isPremium: false,
        authorVerified,
        durationDays: days,
      });

      if (!isAdmin) recordPin();
      close();
    } catch (err: any) {
      setError(err.message ?? 'Bir hata oluştu. Tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  }

  function close() {
    setIsAddingPin(false);
    setAddPinCoords(null);
    if (imagePreview) URL.revokeObjectURL(imagePreview);
  }

  const catMeta = getCategoryMeta(category);

  return (
    <div className="fixed inset-0 z-[1000] flex items-end md:items-center justify-center p-0 md:p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={close} />
      <div className="relative w-full md:max-w-lg bg-white dark:bg-gray-900 rounded-t-2xl md:rounded-2xl shadow-2xl animate-slide-up md:animate-fade-in max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-gray-900 flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-800 z-10">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-blue-500" />
            <h2 className="font-semibold text-gray-900 dark:text-gray-100">Yeni Pin Ekle</h2>
          </div>
          <button onClick={close} className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Coordinates display */}
          <div className="flex items-center gap-2">
            <div className="flex-1 text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 rounded-lg px-3 py-2">
              📍 {addPinCoords?.lat.toFixed(5)}, {addPinCoords?.lng.toFixed(5)}
            </div>
            <button
              type="button"
              onClick={handleGPSLocation}
              disabled={locatingGPS}
              title="Mevcut konumumu kullan"
              className="flex items-center gap-1.5 text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg px-2.5 py-2 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors disabled:opacity-60 flex-shrink-0"
            >
              {locatingGPS ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Navigation className="w-3.5 h-3.5" />
              )}
              GPS
            </button>
          </div>

          {/* Category */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Kategori</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {visibleCategories.map(cat => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCategory(cat.id)}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm border-2 transition-all ${
                    category === cat.id
                      ? 'border-current text-white'
                      : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-gray-300'
                  }`}
                  style={category === cat.id ? { backgroundColor: cat.color, borderColor: cat.color } : {}}
                >
                  <span>{cat.emoji}</span>
                  <span className="truncate text-xs">{cat.label.split('/')[0].trim()}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Başlık <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              maxLength={120}
              placeholder="Kısa, açıklayıcı başlık…"
              required
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-400 text-right">{title.length}/120</p>
          </div>

          {/* Description */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Açıklama</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              maxLength={500}
              rows={3}
              placeholder="Detay ekle…"
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          {/* Duration */}
          <div className="space-y-2">
            <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">
              <Clock className="w-4 h-4" />
              Pin Süresi
            </label>
            <div className="flex gap-1.5 flex-wrap">
              {[1, 2, 3, 4, 5, 6, 7].map(d => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDays(d)}
                  className={`flex-1 min-w-[2.5rem] py-2 rounded-xl text-sm font-medium border-2 transition-all ${
                    days === d
                      ? 'border-blue-500 bg-blue-500 text-white'
                      : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-gray-300'
                  }`}
                >
                  {d}g
                </button>
              ))}
            </div>
          </div>

          {/* Image */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Fotoğraf <span className="text-xs text-gray-400">(opsiyonel, WebP ≤300 KB)</span>
            </label>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageChange}
            />
            {imagePreview ? (
              <div className="relative rounded-xl overflow-hidden bg-black">
                <img src={imagePreview} alt="önizleme" className="w-full max-h-56 object-contain" />
                <button
                  type="button"
                  onClick={() => { setImageFile(null); setImagePreview(null); }}
                  className="absolute top-2 right-2 bg-black/60 text-white rounded-full p-1"
                >
                  <X className="w-4 h-4" />
                </button>
                {imageFile && (
                  <span className="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-2 py-0.5 rounded-full">
                    {formatFileSize(imageFile.size)}
                  </span>
                )}
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="w-full border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl py-6 flex flex-col items-center gap-2 text-gray-400 hover:border-gray-300 hover:text-gray-500 transition-colors"
              >
                <ImageIcon className="w-8 h-8" />
                <span className="text-sm">Resim seç</span>
                <span className="text-xs">Video yasaktır</span>
              </button>
            )}
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 text-red-600 dark:text-red-400 text-sm bg-red-50 dark:bg-red-900/20 rounded-xl px-3 py-2.5">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          {/* Submit */}
          {!isAdmin && (
            <p className="text-xs text-gray-400 text-center">
              Bu saat: {remainingPins()} pin hakkın kaldı
            </p>
          )}
          <button
            type="submit"
            disabled={loading || !title.trim() || (!isAdmin && !canCreatePin())}
            className="w-full py-3 rounded-xl text-white font-semibold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            style={{ backgroundColor: catMeta.color }}
          >
            {loading ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Yükleniyor…</>
            ) : (
              <><MapPin className="w-4 h-4" /> Pin Bırak ({days} gün)</>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
