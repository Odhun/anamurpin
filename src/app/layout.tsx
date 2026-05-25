import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'AnamurPin — Canlı Yerel Harita',
  description:
    'Anamur, Bozyazı ve Aydıncık için gerçek zamanlı crowdsourced harita. Pin bırak, haberleri paylaş.',
  keywords: ['Anamur', 'Bozyazı', 'Aydıncık', 'Mersin', 'yerel harita', 'crowdsourced'],
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'AnamurPin',
  },
  openGraph: {
    title: 'AnamurPin',
    description: 'Anamur-Bozyazı-Aydıncık canlı yerel haber haritası',
    type: 'website',
    siteName: 'AnamurPin',
  },
  twitter: {
    card: 'summary',
    title: 'AnamurPin',
    description: 'Anamur-Bozyazı-Aydıncık canlı yerel haber haritası',
  },
};

export const viewport: Viewport = {
  themeColor: '#3b82f6',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr" suppressHydrationWarning>

      <body
        className={`${inter.className} bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 antialiased`}
        suppressHydrationWarning
      >
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var t=localStorage.getItem('anamurpin_theme');if(t==='dark')document.documentElement.classList.add('dark');}catch(e){}`,
          }}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `if('serviceWorker' in navigator){window.addEventListener('load',function(){navigator.serviceWorker.register('/sw.js').catch(function(){});})}`,
          }}
        />
        {children}
      </body>
    </html>
  );
}
