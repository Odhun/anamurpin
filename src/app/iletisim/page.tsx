import type { Metadata } from 'next';
import Link from 'next/link';
import Header from '@/components/ui/Header';
import Footer from '@/components/ui/Footer';

export const metadata: Metadata = {
  title: 'İletişim — AnamurPin',
  description: 'AnamurPin ile iletişime geçin.',
};

export default function IletisimPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-gray-950">
      <Header />

      <main className="flex-1 max-w-2xl mx-auto w-full px-6 py-12 space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">İletişim</h1>
          <p className="text-gray-500 dark:text-gray-400">
            Soru, öneri veya şikayetleriniz için aşağıdaki kanalları kullanabilirsiniz.
          </p>
        </div>

        <hr className="border-gray-100 dark:border-gray-800" />

        <div className="space-y-4">
          {/* Geliştirici */}
          <div className="p-5 rounded-2xl border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-xl">⚡</span>
              <h2 className="font-semibold text-gray-900 dark:text-gray-100">OdhunSoft</h2>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              AnamurPin geliştiricisi. Genel sorular, iş birlikleri ve sponsorluk teklifleri için.
            </p>
            <a
              href="https://www.odhun.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 text-white text-sm font-semibold transition-colors"
            >
              www.odhun.com →
            </a>
          </div>

          {/* Hata Bildirimi */}
          <div className="p-5 rounded-2xl border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-xl">🐛</span>
              <h2 className="font-semibold text-gray-900 dark:text-gray-100">Hata Bildirimi</h2>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Bir hata bulduysanız veya öneriniz varsa GitHub üzerinden bildirebilirsiniz.
            </p>
            <a
              href="https://github.com/Odhun/anamurpin/issues"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm font-semibold transition-colors"
            >
              GitHub Issues →
            </a>
          </div>

          {/* Kötüye kullanım */}
          <div className="p-5 rounded-2xl border border-orange-100 dark:border-orange-900/50 bg-orange-50 dark:bg-orange-900/10 space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xl">🚨</span>
              <h2 className="font-semibold text-gray-900 dark:text-gray-100">Kötüye Kullanım Bildirimi</h2>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Uygunsuz içerik veya kötüye kullanım durumunu pin detayında <strong>aşağı oy</strong> vererek
              ya da GitHub Issues üzerinden bildirebilirsiniz. İçerikler topluluk oyu ile otomatik gizlenir.
            </p>
          </div>

          {/* Acil */}
          <div className="p-5 rounded-2xl border border-red-100 dark:border-red-900/50 bg-red-50 dark:bg-red-900/10 space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xl">🆘</span>
              <h2 className="font-semibold text-red-700 dark:text-red-400">Acil Durum</h2>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              AnamurPin bir acil durum hizmeti değildir. Acil bir durumda{' '}
              <strong className="text-red-600">112</strong>'yi arayın.
            </p>
          </div>
        </div>

        <div>
          <Link href="/" className="text-sm text-blue-500 hover:underline">← Haritaya Dön</Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
