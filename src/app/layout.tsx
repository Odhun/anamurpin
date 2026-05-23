import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'AnamurPin — Canlı Yerel Harita',
  description:
    'Anamur, Bozyazı ve Aydıncık için gerçek zamanlı crowdsourced harita. Pin bırak, haberleri paylaş.',
  keywords: ['Anamur', 'Bozyazı', 'Aydıncık', 'Mersin', 'yerel harita', 'crowdsourced'],
  openGraph: {
    title: 'AnamurPin',
    description: 'Anamur-Bozyazı-Aydıncık canlı yerel haber haritası',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const t = localStorage.getItem('anamurpin_theme');
                if (t === 'dark') document.documentElement.classList.add('dark');
              } catch(e) {}
            `,
          }}
        />
      </head>
      <body className={`${inter.className} bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 antialiased`}>
        {children}
      </body>
    </html>
  );
}
