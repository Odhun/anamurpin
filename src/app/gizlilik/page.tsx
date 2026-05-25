import type { Metadata } from 'next';
import Link from 'next/link';
import Header from '@/components/ui/Header';
import Footer from '@/components/ui/Footer';

export const metadata: Metadata = {
  title: 'Gizlilik Politikası — AnamurPin',
  description: 'AnamurPin gizlilik politikası ve KVKK aydınlatma metni.',
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">{title}</h2>
      <div className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed space-y-2">
        {children}
      </div>
    </section>
  );
}

export default function GizlilikPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-gray-950">
      <Header />

      <main className="flex-1 max-w-3xl mx-auto w-full px-6 py-12 space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">Gizlilik Politikası</h1>
          <p className="text-xs text-gray-400">Son güncelleme: Mayıs 2026</p>
        </div>

        <hr className="border-gray-100 dark:border-gray-800" />

        <Section title="1. Veri Sorumlusu">
          <p>
            6698 sayılı Kişisel Verilerin Korunması Kanunu (&quot;KVKK&quot;) kapsamında veri sorumlusu{' '}
            <strong>OdhunSoft</strong>&apos;tur. İletişim bilgilerine{' '}
            <Link href="/iletisim" className="text-blue-500 hover:underline">İletişim</Link> sayfasından
            ulaşabilirsiniz.
          </p>
        </Section>

        <Section title="2. Toplanan Kişisel Veriler">
          <p>AnamurPin uygulamasını kullandığınızda aşağıdaki veriler işlenebilir:</p>
          <ul className="list-disc list-inside space-y-1 pl-2">
            <li><strong>Google Hesap Bilgileri:</strong> Google ile giriş yapıldığında e-posta adresi ve profil bilgileri Firebase Authentication tarafından işlenir.</li>
            <li><strong>Kullanıcı Adı:</strong> Uygulama içinde seçtiğiniz takma ad Firestore veritabanında saklanır.</li>
            <li><strong>Paylaşılan İçerikler:</strong> Başlık, açıklama, konum koordinatları, yüklenen fotoğraflar ve kategori bilgileri.</li>
            <li><strong>Oy Geçmişi:</strong> Verdiğiniz oylar cihazınızın yerel depolama alanında (localStorage) tutulur, sunucuya yalnızca sayısal toplam aktarılır.</li>
            <li><strong>IP Adresi:</strong> Firebase altyapısı tarafından güvenlik amaçlı olarak işlenebilir.</li>
          </ul>
        </Section>

        <Section title="3. Verilerin İşlenme Amaçları">
          <ul className="list-disc list-inside space-y-1 pl-2">
            <li>Kimlik doğrulama ve hesap güvenliğinin sağlanması</li>
            <li>Kullanıcı içeriklerinin haritada görüntülenmesi</li>
            <li>İçerik güvenilirliğinin topluluk oylamasıyla ölçülmesi</li>
            <li>Uygunsuz içeriklerin tespit edilmesi ve kaldırılması</li>
            <li>Hizmetin iyileştirilmesi</li>
          </ul>
        </Section>

        <Section title="4. Üçüncü Taraf Hizmetler">
          <p>Uygulama aşağıdaki üçüncü taraf hizmetleri kullanmaktadır:</p>
          <ul className="list-disc list-inside space-y-1 pl-2">
            <li><strong>Google Firebase:</strong> Kimlik doğrulama, veritabanı ve dosya depolama. Google Gizlilik Politikası geçerlidir.</li>
            <li><strong>OpenStreetMap:</strong> Harita döşemeleri. ODbL lisansı altında.</li>
            <li><strong>CARTO:</strong> Karanlık tema harita döşemeleri.</li>
            <li><strong>Open-Meteo:</strong> Anonimleştirilmiş konum tabanlı hava durumu verileri.</li>
          </ul>
        </Section>

        <Section title="5. Yerel Depolama Kullanımı">
          <p>Uygulama sunucuya herhangi bir çerez göndermez. Yalnızca cihazınızda aşağıdaki veriler saklanır:</p>
          <ul className="list-disc list-inside space-y-1 pl-2">
            <li><strong>localStorage:</strong> Tema tercihi, oy geçmişi, pin oluşturma zamanları (hız sınırı için)</li>
            <li><strong>sessionStorage:</strong> Aktif oturum süresince raporlar önbelleği</li>
          </ul>
          <p>Bu veriler yalnızca cihazınızda kalır, üçüncü taraflarla paylaşılmaz.</p>
        </Section>

        <Section title="6. Verilerin Saklanma Süresi">
          <ul className="list-disc list-inside space-y-1 pl-2">
            <li>Pinler, oluşturulurken belirlenen sürenin (1-7 gün) sonunda otomatik olarak silinir.</li>
            <li>Hesap bilgileri, hesap silinene kadar saklanır.</li>
            <li>Hesabınızı silmek için <Link href="/iletisim" className="text-blue-500 hover:underline">İletişim</Link> sayfasından talepte bulunabilirsiniz.</li>
          </ul>
        </Section>

        <Section title="7. KVKK Kapsamındaki Haklarınız">
          <p>KVKK Madde 11 kapsamında aşağıdaki haklara sahipsiniz:</p>
          <ul className="list-disc list-inside space-y-1 pl-2">
            <li>Kişisel verilerinizin işlenip işlenmediğini öğrenme</li>
            <li>Kişisel verileriniz işlenmişse buna ilişkin bilgi talep etme</li>
            <li>Kişisel verilerinizin işlenme amacını ve bunların amacına uygun kullanılıp kullanılmadığını öğrenme</li>
            <li>Yurt içinde veya yurt dışında kişisel verilerinizin aktarıldığı üçüncü kişileri bilme</li>
            <li>Kişisel verilerinizin eksik veya yanlış işlenmiş olması hâlinde bunların düzeltilmesini isteme</li>
            <li>Kişisel verilerinizin silinmesini veya yok edilmesini isteme</li>
          </ul>
          <p>
            Bu haklarınızı kullanmak için <Link href="/iletisim" className="text-blue-500 hover:underline">İletişim</Link> sayfasından
            bize ulaşabilirsiniz.
          </p>
        </Section>

        <Section title="8. Güvenlik">
          <p>
            Verilerinizin güvenliği için Firebase&apos;in sağladığı SSL/TLS şifrelemesi, kimlik doğrulama
            ve güvenlik kuralları kullanılmaktadır. Ancak hiçbir internet iletiminin %100 güvenli
            olmadığını kabul etmekteyiz.
          </p>
        </Section>

        <Section title="9. Politika Değişiklikleri">
          <p>
            Bu politikada yapılan önemli değişiklikler uygulama içinde duyurulacaktır. Uygulamayı
            kullanmaya devam etmeniz güncel politikayı kabul ettiğiniz anlamına gelir.
          </p>
        </Section>

        <div>
          <Link href="/" className="text-sm text-blue-500 hover:underline">← Haritaya Dön</Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
