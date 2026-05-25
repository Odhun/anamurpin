import type { Metadata } from 'next';
import Link from 'next/link';
import Header from '@/components/ui/Header';
import Footer from '@/components/ui/Footer';

export const metadata: Metadata = {
  title: 'Sorumluluk Reddi — AnamurPin',
  description: 'AnamurPin sorumluluk reddi beyanı.',
};

export default function SorumlulukReddiPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-gray-950">
      <Header />

      <main className="flex-1 max-w-3xl mx-auto w-full px-6 py-12 space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">Sorumluluk Reddi Beyanı</h1>
          <p className="text-xs text-gray-400">Son güncelleme: Mayıs 2026</p>
        </div>

        <hr className="border-gray-100 dark:border-gray-800" />

        {/* Acil uyarı */}
        <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 flex gap-3">
          <span className="text-2xl flex-shrink-0">🆘</span>
          <div className="space-y-1">
            <p className="font-bold text-red-700 dark:text-red-400 text-sm">Acil Durum Uyarısı</p>
            <p className="text-sm text-red-600 dark:text-red-300">
              AnamurPin bir acil durum hizmeti değildir. Yangın, kaza veya tıbbi acil durumlarda
              lütfen <strong>112</strong>&apos;yi arayın. Uygulamadaki bilgilere güvenerek acil müdahaleyi geciktirmeyin.
            </p>
          </div>
        </div>

        <div className="space-y-6 text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
          <section className="space-y-2">
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">1. Kullanıcı İçeriği</h2>
            <p>
              AnamurPin&apos;de yayınlanan tüm içerikler (pinler, başlıklar, açıklamalar, fotoğraflar)
              yalnızca kullanıcılar tarafından oluşturulmaktadır. OdhunSoft ve AnamurPin, kullanıcı
              tarafından oluşturulan içeriklerin doğruluğunu, güncelliğini veya güvenilirliğini
              garanti etmez.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">2. Bilgilerin Doğruluğu</h2>
            <p>
              Haritada görüntülenen bilgiler gerçek zamanlı ve crowdsourced niteliktedir. Bu bilgiler
              doğrulanmamış, yanlış veya yanıltıcı olabilir. Herhangi bir kararı yalnızca bu uygulama
              üzerindeki bilgilere dayandırmayın; resmi kaynak ve yetkili mercilerden teyit alın.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">3. Sorumluluk Sınırı</h2>
            <p>
              OdhunSoft ve AnamurPin; kullanıcı içeriklerinden, hizmetin kesintiye uğramasından,
              veri kaybından veya uygulamanın kullanımından doğabilecek doğrudan ya da dolaylı
              zararlardan sorumlu tutulamaz.
            </p>
            <p>
              Uygulama &quot;olduğu gibi&quot; (as-is) sunulmaktadır; belirli bir amaca uygunluk veya
              kesintisiz hizmet garantisi verilmemektedir.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">4. İçerik Moderasyonu</h2>
            <p>
              Topluluk oylama sistemi (yukarı/aşağı oy) ile yüksek downvote alan içerikler otomatik
              gizlenir. Yine de tüm içeriklerin sürekli moderasyonunu garanti etmiyoruz. Uygunsuz
              içerik tespit ederseniz lütfen{' '}
              <Link href="/iletisim" className="text-blue-500 hover:underline">bildirin</Link>.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">5. Konum Verileri</h2>
            <p>
              Kullanıcılar pin oluştururken konum paylaşmaktadır. Bu koordinatlar herkese açık
              olarak görüntülenmektedir. Hassas konumunuzu paylaşmadan önce bunu göz önünde bulundurun.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">6. Fikri Mülkiyet</h2>
            <p>
              Kullanıcılar yükledikleri içeriklerin kendilerine ait olduğunu ve üçüncü tarafların
              haklarını ihlal etmediğini beyan eder. İhlal iddiası için{' '}
              <Link href="/iletisim" className="text-blue-500 hover:underline">iletişime geçin</Link>.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">7. Hizmet Değişiklikleri</h2>
            <p>
              AnamurPin herhangi bir bildirim yapmaksızın hizmeti değiştirme, askıya alma veya
              sonlandırma hakkını saklı tutar.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">8. Uygulanacak Hukuk</h2>
            <p>
              Bu beyan Türkiye Cumhuriyeti hukukuna tabidir. Anlaşmazlıklarda Mersin mahkemeleri
              yetkilidir.
            </p>
          </section>
        </div>

        <div>
          <Link href="/" className="text-sm text-blue-500 hover:underline">← Haritaya Dön</Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
