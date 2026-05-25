import type { Metadata } from 'next';
import Link from 'next/link';
import Header from '@/components/ui/Header';
import Footer from '@/components/ui/Footer';

export const metadata: Metadata = {
  title: 'Çerez Politikası — AnamurPin',
  description: 'AnamurPin çerez ve yerel depolama kullanımı hakkında bilgi.',
};

export default function CerezlerPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-gray-950">
      <Header />

      <main className="flex-1 max-w-3xl mx-auto w-full px-6 py-12 space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">Çerez Politikası</h1>
          <p className="text-xs text-gray-400">Son güncelleme: Mayıs 2026</p>
        </div>

        <hr className="border-gray-100 dark:border-gray-800" />

        <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 text-sm text-blue-700 dark:text-blue-300">
          AnamurPin, tarayıcınıza üçüncü taraf çerez <strong>göndermez</strong>. Bunun yerine yalnızca
          cihazınızın yerel depolama alanını (localStorage / sessionStorage) kullanır.
        </div>

        <section className="space-y-4">
          <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">Kullanılan Yerel Depolama</h2>

          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-3 pr-4 text-gray-700 dark:text-gray-300 font-semibold">Anahtar</th>
                  <th className="text-left py-3 pr-4 text-gray-700 dark:text-gray-300 font-semibold">Tür</th>
                  <th className="text-left py-3 text-gray-700 dark:text-gray-300 font-semibold">Amaç</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {[
                  { key: 'anamurpin_theme', type: 'localStorage', purpose: 'Tema tercihinizi (açık/koyu) hatırlar.' },
                  { key: 'anamurpin_votes', type: 'localStorage', purpose: 'Hangi pinlere oy verdiğinizi hatırlar; çift oy engeller.' },
                  { key: 'anamurpin_pin_times', type: 'localStorage', purpose: 'Saatlik pin oluşturma limitini (5 pin/saat) uygulamak için kullanılır.' },
                  { key: 'anamurpin_reports_v2', type: 'sessionStorage', purpose: 'Aktif oturum süresince pin verilerini önbelleğe alır; gereksiz Firebase okumalarını azaltır.' },
                  { key: 'anamurpin_weather', type: 'sessionStorage', purpose: 'Hava durumu verisini 30 dakika önbellekte tutar.' },
                ].map(row => (
                  <tr key={row.key}>
                    <td className="py-3 pr-4">
                      <code className="text-xs bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded text-gray-700 dark:text-gray-300">{row.key}</code>
                    </td>
                    <td className="py-3 pr-4 text-gray-500 dark:text-gray-400 whitespace-nowrap">{row.type}</td>
                    <td className="py-3 text-gray-600 dark:text-gray-300">{row.purpose}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">Üçüncü Taraf Çerezleri</h2>
          <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
            Firebase Authentication (Google), giriş oturumunu yönetmek amacıyla kendi çerezlerini
            kullanabilir. Bu çerezler Google&apos;ın gizlilik politikasına tabidir.
            Harita döşemeleri OpenStreetMap ve CARTO sunucularından yüklenir; bu sunuculara yapılan
            istekler IP adresinizi içerebilir.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">Depolama Verilerini Silme</h2>
          <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
            Tarayıcınızın geliştirici araçları aracılığıyla (F12 → Application → Storage) veya
            tarayıcı ayarlarından tüm yerel depolama verilerini temizleyebilirsiniz.
            Bu işlem tema tercihinizi, oy geçmişinizi ve pin zamanlarınızı sıfırlar.
          </p>
        </section>

        <div>
          <Link href="/" className="text-sm text-blue-500 hover:underline">← Haritaya Dön</Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
