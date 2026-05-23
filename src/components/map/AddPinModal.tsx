'use client';

import { useState, useRef } from 'react';
import { X, MapPin, Image as ImageIcon, Loader2, AlertCircle } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { getCategoryMeta, CATEGORIES } from '@/utils/categories';
import { CategoryType } from '@/types';
import { createReport, uploadReportImage, ensureUserProfile } from '@/lib/firestore';
import { compressToWebP, isBlockedFileType, formatFileSize } from '@/lib/imageCompression';
import { getUserNetScore } from '@/lib/firestore';
import { isVerifiedReporter } from '@/lib/reliability';

export default function AddPinModal() {
  const {
    user,
    addPinCoords,
    setIsAddingPin,
    setAddPinCoords,
    addReportToCache,
  } = useAppStore();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<CategoryType>('general');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

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

    setLoading(true);
    setError(null);

    try {
      const displayName = user.displayName ?? user.email ?? 'Kullanıcı';
      await ensureUserProfile(user.uid, displayName);

      let imageUrl: string | null = null;
      if (imageFile) {
        imageUrl = await uploadReportImage(user.uid, imageFile);
      }

      const netScore = await getUserNetScore(user.uid);
      const authorVerified = isVerifiedReporter(netScore);

      const id = await createReport({
        userId: user.uid,
        username: displayName,
        category,
        title: title.trim(),
        description: description.trim(),
        latitude: addPinCoords.lat,
        longitude: addPinCoords.lng,
        imageUrl,
        status: 'active',
        isPremium: false,
        authorVerified,
      });

      // Optimistically add to local cache
      const { Timestamp } = await import('firebase/firestore');
      const now = Timestamp.now();
      addReportToCache({
        id,
        userId: user.uid,
        username: displayName,
        category,
        title: title.trim(),
        description: description.trim(),
        latitude: addPinCoords.lat,
        longitude: addPinCoords.lng,
        imageUrl,
        createdAt: now,
        expiresAt: Timestamp.fromMillis(now.toMillis() + 7 * 24 * 60 * 60 * 1000),
        upvotes: 0,
        downvotes: 0,
        status: 'active',
        isPremium: false,
        authorVerified,
      });

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
          <div className="text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 rounded-lg px-3 py-2">
            📍 {addPinCoords?.lat.toFixed(5)}, {addPinCoords?.lng.toFixed(5)}
          </div>

          {/* Category */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Kategori</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {CATEGORIES.map(cat => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCategory(cat.id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm border-2 transition-all ${
                    category === cat.id
                      ? `border-current text-white`
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
              <div className="relative rounded-xl overflow-hidden">
                <img src={imagePreview} alt="önizleme" className="w-full h-40 object-cover" />
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
          <button
            type="submit"
            disabled={loading || !title.trim()}
            className="w-full py-3 rounded-xl text-white font-semibold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            style={{ backgroundColor: catMeta.color }}
          >
            {loading ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Yükleniyor…</>
            ) : (
              <><MapPin className="w-4 h-4" /> Pin Bırak</>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
