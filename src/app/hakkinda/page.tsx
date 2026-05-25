import type { Metadata } from 'next';
import Link from 'next/link';
import Header from '@/components/ui/Header';
import Footer from '@/components/ui/Footer';

export const metadata: Metadata = {
  title: 'Hakkında — AnamurPin',
  description: 'AnamurPin nedir, nasıl çalışır, kimler için yapıldı.',
};

export default function HakkindaPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-gray-950">
      <Header />

      <main className="flex-1 max-w-3xl mx-auto w-full px-6 py-12 space-y-10">
        {/* Hero */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <span className="text-4xl">📍</span>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">AnamurPin</h1>
          </div>
          <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
            Anamur, Bozyazı ve Aydıncık bölgesi için geliştirilmiş, gerçek zamanlı crowdsourced yerel
            haber haritasıdır. Topluluk tarafından, topluluk için.
          </p>
        </div>

        <hr className="border-gray-100 dark:border-gray-800" />

        {/* Nasıl çalışır */}
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Nasıl Çalışır?</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              { icon: '🔐', title: 'Google ile Giriş', desc: 'Hesap açmaya gerek yok. Google hesabınla bir tıkla giriş.' },
              { icon: '📌', title: 'Pin Bırak', desc: 'Haritada istediğin yere tıkla, başlık ve kategori seç, anında paylaş.' },
              { icon: '👍', title: 'Oyla', desc: 'Paylaşımları oylarla. Topluluk oylaması içerik güvenilirliğini belirler.' },
              { icon: '⏱️', title: 'Otomatik Sil', desc: 'Pinler 1-7 gün sonra otomatik silinir. Güncel içerik, sıfır birikme.' },
            ].map(item => (
              <div key={item.title} className="p-4 rounded-2xl border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 space-y-2">
                <div className="text-2xl">{item.icon}</div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-sm">{item.title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Kategoriler */}
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Kategoriler</h2>
          <div className="space-y-2">
            {[
              { emoji: '🚨', name: 'Son Dakika / Asayiş', desc: 'Kaza, yol kapanması, elektrik/su kesintisi' },
              { emoji: '🎉', name: 'Etkinlik / Duyuru', desc: 'Festival, ilan, düğün, cenaze' },
              { emoji: '🌦️', name: 'Hava & Tarım', desc: 'Fırtına uyarısı, don alarmı, tarım haberleri' },
              { emoji: '🐾', name: 'Kayıp / Bulunan', desc: 'Kayıp hayvan, bulunan eşya' },
              { emoji: '💬', name: 'Genel / Serbest Kürsü', desc: 'Genel paylaşımlar ve yerel haberler' },
            ].map(cat => (
              <div key={cat.name} className="flex items-start gap-3 px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800">
                <span className="text-xl flex-shrink-0 mt-0.5">{cat.emoji}</span>
                <div>
                  <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">{cat.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{cat.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Teknoloji */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Teknoloji</h2>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            AnamurPin; <strong>Next.js 14</strong>, <strong>Firebase</strong>, <strong>react-leaflet</strong> ve{' '}
            <strong>Tailwind CSS</strong> ile geliştirilmiştir. Harita verileri{' '}
            <a href="https://www.openstreetmap.org" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">OpenStreetMap</a> ve{' '}
            <a href="https://carto.com" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">CARTO</a> tarafından sağlanmaktadır.
          </p>
        </section>

        {/* Geliştirici */}
        <section className="p-6 rounded-2xl bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-yellow-500 text-xl">⚡</span>
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">Geliştirici</h2>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            AnamurPin, <strong>OdhunSoft</strong> tarafından tasarlanmış ve geliştirilmiştir.
            Anamur bölgesine özel dijital çözümler üretmeyi hedefliyoruz.
          </p>
          <a
            href="https://www.odhun.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-500 hover:bg-blue-600 text-white text-sm font-semibold transition-colors"
          >
            www.odhun.com →
          </a>
        </section>

        {/* Back */}
        <div>
          <Link href="/" className="text-sm text-blue-500 hover:underline">← Haritaya Dön</Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
