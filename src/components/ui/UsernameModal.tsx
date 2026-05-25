'use client';

import { useState, useEffect, useRef } from 'react';
import { Loader2, Check, X, AtSign, Pencil } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { updateUsername, isUsernameAvailable } from '@/lib/firestore';

const USERNAME_REGEX = /^[a-zA-Z0-9_]{3,20}$/;

export default function UsernameModal() {
  const {
    user,
    setShowUsernameModal,
    setUserProfile,
    userProfile,
    usernameModalMode,
  } = useAppStore();

  const isChanging = usernameModalMode === 'change';

  const [nick, setNick] = useState('');
  const [checking, setChecking] = useState(false);
  const [available, setAvailable] = useState<boolean | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isValidFormat = USERNAME_REGEX.test(nick);

  useEffect(() => {
    if (!isValidFormat) {
      setAvailable(null);
      return;
    }
    // If same as current username, mark unavailable
    if (isChanging && nick === userProfile?.username) {
      setAvailable(false);
      return;
    }
    setChecking(true);
    setAvailable(null);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      const ok = await isUsernameAvailable(nick);
      setAvailable(ok);
      setChecking(false);
    }, 500);
  }, [nick, isValidFormat, isChanging, userProfile?.username]);

  async function handleSave() {
    if (!user || !isValidFormat || available !== true) return;
    setSaving(true);
    setError(null);
    try {
      await updateUsername(user.uid, nick);
      setUserProfile({ ...(userProfile as any), username: nick, needsUsername: false });
      setShowUsernameModal(false);
    } catch {
      setError('Kaydedilemedi, tekrar dene.');
    } finally {
      setSaving(false);
    }
  }

  const statusIcon = checking ? (
    <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />
  ) : available === true ? (
    <Check className="w-4 h-4 text-green-500" />
  ) : available === false ? (
    <X className="w-4 h-4 text-red-500" />
  ) : null;

  const canSave = isValidFormat && available === true && !saving;

  return (
    <div className="fixed inset-0 z-[1200] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={isChanging ? () => setShowUsernameModal(false) : undefined}
      />
      <div className="relative w-full max-w-sm bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-6 animate-fade-in">
        {isChanging && (
          <button
            onClick={() => setShowUsernameModal(false)}
            className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>
        )}

        <div className="text-center space-y-4">
          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto ${
            isChanging
              ? 'bg-purple-100 dark:bg-purple-900/30'
              : 'bg-blue-100 dark:bg-blue-900/30'
          }`}>
            {isChanging
              ? <Pencil className="w-8 h-8 text-purple-500" />
              : <AtSign className="w-8 h-8 text-blue-500" />
            }
          </div>

          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
              {isChanging ? 'Kullanıcı Adını Değiştir' : 'Kullanıcı Adı Seç'}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              {isChanging
                ? `Mevcut: @${userProfile?.username}`
                : 'Bu ad pinlerde görünecek. Gerçek adın gizli kalır.'
              }
            </p>
          </div>

          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">@</div>
            <input
              type="text"
              value={nick}
              onChange={(e) => setNick(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
              placeholder="kullanici_adi"
              maxLength={20}
              autoFocus
              className="w-full pl-7 pr-10 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-transparent text-sm font-medium focus:outline-none focus:border-blue-400 dark:focus:border-blue-500"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2">{statusIcon}</div>
          </div>

          <div className="text-left space-y-1">
            {nick.length > 0 && !isValidFormat && (
              <p className="text-xs text-red-500">
                3-20 karakter, sadece harf/rakam/alt çizgi (_)
              </p>
            )}
            {available === false && isValidFormat && (
              <p className="text-xs text-red-500">
                {isChanging && nick === userProfile?.username
                  ? 'Bu zaten mevcut kullanıcı adın.'
                  : 'Bu kullanıcı adı alınmış.'}
              </p>
            )}
            {available === true && (
              <p className="text-xs text-green-500">Kullanılabilir!</p>
            )}
          </div>

          <button
            onClick={handleSave}
            disabled={!canSave}
            className="w-full py-3 px-4 rounded-xl bg-blue-500 hover:bg-blue-600 disabled:opacity-40 text-white text-sm font-semibold transition-colors flex items-center justify-center gap-2"
          >
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
            {isChanging ? 'Değiştir' : 'Devam Et'}
          </button>

          {error && <p className="text-sm text-red-500">{error}</p>}

          {!isChanging && (
            <p className="text-xs text-gray-400">
              Daha sonra değiştirebilirsin — profil menüsünden.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
