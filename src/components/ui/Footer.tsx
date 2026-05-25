import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 border-t border-gray-800 flex-shrink-0">
      <div className="max-w-5xl mx-auto px-6 py-10">
        <div className="flex flex-col md:flex-row justify-between gap-8 mb-8">
          {/* Brand */}
          <div className="space-y-3 max-w-xs">
            <div className="flex items-center gap-2">
              <span className="text-2xl">📍</span>
              <span className="text-white font-bold text-lg">AnamurPin</span>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">
              Anamur, Bozyazı ve Aydıncık için gerçek zamanlı crowdsourced yerel haber haritası.
              Topluluk tarafından, topluluk için.
            </p>
          </div>

          {/* Link columns */}
          <div className="flex gap-12 flex-wrap">
            <div className="space-y-3">
              <h3 className="text-white text-xs font-semibold uppercase tracking-wider">Site</h3>
              <nav className="flex flex-col gap-2 text-sm">
                <Link href="/" className="hover:text-white transition-colors">Harita</Link>
                <Link href="/hakkinda" className="hover:text-white transition-colors">Hakkında</Link>
                <Link href="/iletisim" className="hover:text-white transition-colors">İletişim</Link>
              </nav>
            </div>
            <div className="space-y-3">
              <h3 className="text-white text-xs font-semibold uppercase tracking-wider">Yasal</h3>
              <nav className="flex flex-col gap-2 text-sm">
                <Link href="/gizlilik" className="hover:text-white transition-colors">Gizlilik Politikası</Link>
                <Link href="/cerezler" className="hover:text-white transition-colors">Çerezler</Link>
                <Link href="/sorumluluk-reddi" className="hover:text-white transition-colors">Sorumluluk Reddi</Link>
              </nav>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-gray-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-500">
          <span>© 2026 AnamurPin. Tüm hakları saklıdır.</span>
          <a
            href="https://www.odhun.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 hover:text-white transition-colors group"
          >
            <span className="text-yellow-500 group-hover:text-yellow-400">⚡</span>
            <span>OdhunSoft tarafından geliştirilmiştir</span>
          </a>
        </div>
      </div>
    </footer>
  );
}
