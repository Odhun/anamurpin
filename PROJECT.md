# AnamurPin — Crowdsourced Local Map

> Gerçek zamanlı, topluluk destekli yerel harita ve haber platformu  
> Anamur · Bozyazı · Aydıncık — Mersin, Türkiye

---

## Durum / Status

| Alan | Durum |
|---|---|
| Proje kurulumu | ✅ Tamamlandı |
| Firebase entegrasyonu | ⏳ `.env.local` gerekli |
| Harita (Leaflet + CartoDB) | ✅ Tamamlandı |
| Kimlik doğrulama (Anonim + Google) | ✅ Tamamlandı |
| Rapor oluşturma + TTL | ✅ Tamamlandı |
| Oy sistemi (fieldValue.increment) | ✅ Tamamlandı |
| Don alarmı (Open-Meteo) | ✅ Tamamlandı |
| WhatsApp paylaşımı | ✅ Tamamlandı |
| Derin bağlantı `/pin/[id]` | ✅ Tamamlandı |
| Admin temizleme paneli | ✅ Tamamlandı |
| Mobil uyumlu (responsive) | ✅ Tamamlandı |
| Koyu/Açık tema (CartoDB tiles) | ✅ Tamamlandı |

---

## Kurulum / Setup

```bash
# 1. Bağımlılıkları yükle
npm install

# 2. Firebase projesini oluştur ve .env.local dosyasını yapılandır
cp .env.local.example .env.local
# → .env.local içine Firebase config değerlerini gir

# 3. Firestore güvenlik kurallarını uygula (bkz. aşağıda)

# 4. Geliştirme sunucusunu başlat
npm run dev
```

---

## Firebase Firestore Güvenlik Kuralları

Firebase konsoluna yapıştır:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    match /reports/{reportId} {
      allow read: if true;
      allow create: if request.auth != null
        && request.auth.token.firebase.sign_in_provider != 'anonymous'
        && request.resource.data.userId == request.auth.uid
        && request.resource.data.title.size() >= 3
        && request.resource.data.title.size() <= 120;
      allow update: if request.auth != null
        && (
          // Only upvotes/downvotes fields via increment
          request.resource.data.diff(resource.data).affectedKeys()
            .hasOnly(['upvotes', 'downvotes'])
        );
    }

    match /users/{userId} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

---

## Firebase Storage Kuralları

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /reports/{userId}/{fileName} {
      allow read: if true;
      allow write: if request.auth != null
        && request.auth.uid == userId
        && request.auth.token.firebase.sign_in_provider != 'anonymous'
        && request.resource.size < 500 * 1024
        && request.resource.contentType.matches('image/webp');
    }
  }
}
```

---

## Proje Mimarisi

```
src/
├── app/                    # Next.js 14 App Router
│   ├── layout.tsx          # Root layout, dark mode provider
│   ├── page.tsx            # Ana sayfa — split view (harita + timeline)
│   ├── globals.css         # Global stiller + Leaflet overrides
│   ├── pin/[reportId]/     # Derin bağlantı: haritada pinni aç
│   └── admin/              # Admin paneli: toplu silme
│
├── components/
│   ├── map/
│   │   ├── MapView.tsx         # Dynamic import wrapper (ssr: false)
│   │   ├── MapComponent.tsx    # Ana Leaflet harita bileşeni
│   │   ├── MapController.tsx   # Programatik pan/zoom (useMap)
│   │   └── AddPinModal.tsx     # Pin ekleme formu (resim + sıkıştırma)
│   ├── timeline/
│   │   ├── Timeline.tsx        # Sol panel: viewport filtrelenmiş liste
│   │   └── ReportCard.tsx      # Tekil rapor kartı
│   ├── modals/
│   │   └── ReportDetailModal.tsx  # Detay modal + oy + WhatsApp paylaş
│   ├── ui/
│   │   ├── Header.tsx          # Top bar: logo, tema, auth
│   │   ├── FrostBanner.tsx     # Kırmızı yanıp sönen don uyarısı
│   │   ├── CategoryFilter.tsx  # Kategori filtre butonları
│   │   ├── AuthModal.tsx       # Google OAuth / telefon yükseltme
│   │   └── ThemeToggle.tsx     # Koyu/açık mod butonu
│   └── admin/
│       └── AdminPanel.tsx      # Süresi dolmuş raporları toplu sil
│
├── hooks/
│   ├── useAuth.ts          # Firebase auth (anonim + upgrade)
│   ├── useReports.ts       # Raporlar: fetch, cache, filtre
│   └── useWeather.ts       # Open-Meteo: sıcaklık + don alarmı
│
├── lib/
│   ├── firebase.ts         # Firebase app init
│   ├── firestore.ts        # Firestore CRUD + quota optimizasyon
│   ├── imageCompression.ts # Client-side WebP sıkıştırma
│   └── reliability.ts      # Güvenilirlik formülü + rozet hesabı
│
├── store/
│   └── useAppStore.ts      # Zustand global state
│
├── types/
│   └── index.ts            # TypeScript tip tanımları
│
└── utils/
    └── categories.ts       # Kategori metadata (emoji, renk, etiket)
```

---

## Firebase Quota Optimizasyon Stratejisi

| Teknik | Açıklama |
|---|---|
| TTL Filtresi | `expiresAt > now` — süresi dolmuş belgeler okunmaz |
| Session Cache | 5 dk. sessionStorage cache — sayfa içi tekrar okuma yok |
| Client-side Filtre | Kategori/viewport filtreleri Firestore sorgusu tetiklemez |
| `fieldValue.increment` | Oy = tek belge update, sub-collection yok |
| Toplu silme (Admin) | Manuel tetiklemeli `writeBatch` — Cloud Function yok |
| Resim sıkıştırma | WebP + 300KB limit — Storage bandwidth minimize |
| Limit(200) | Tek sorguda max 200 rapor çekilir |

---

## Kategori Sistemi

| ID | Emoji | Türkçe Ad | Renk |
|---|---|---|---|
| emergency | 🚨 | Son Dakika / Asayiş | #ef4444 (kırmızı) |
| event | 🎉 | Etkinlik / Duyuru | #8b5cf6 (mor) |
| weather | 🌦️ | Hava & Tarım | #3b82f6 (mavi) |
| lost | 🐾 | Kayıp / Bulunan | #f97316 (turuncu) |
| general | 💬 | Genel / Serbest Kürsü | #22c55e (yeşil) |

---

## Güvenilirlik Sistemi

- **Gizleme**: `downvotes >= 15 + (upvotes × 3)` → rapor client-side gizlenir
- **Onaylı Yerel Muhabir**: `kullanıcı netScore >= +50` → rozet gösterilir
- **Oy takibi**: localStorage — aynı rapor için çift oy önlenir

---

## Geliştirme Yol Haritası

- [ ] Firebase Telefon Auth entegrasyonu
- [ ] Push notification (FCM) — don uyarısı
- [ ] Premium pin (isPremium: true) iş modeli
- [ ] Küme haritası (marker cluster) büyük pin sayısı için
- [ ] Çoklu dil desteği (TR / EN)
- [ ] PWA (offline cache)
