import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import AuthProvider from '@/lib/auth-context';
import AnnouncementBanner from '@/components/AnnouncementBanner';
import IntlProvider from '@/providers/IntlProvider';
const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: { default: 'Evara - Shop Everything', template: '%s | Evara' },
  description: 'Shop millions of products at great prices. Fast delivery, easy returns, and secure checkout.',
  keywords: ['online shopping', 'electronics', 'deals', 'ecommerce'],
  openGraph: {
    title: 'Evara - Shop Everything',
    description: 'Shop millions of products at great prices.',
    url: process.env.NEXTAUTH_URL || 'http://localhost:3000',
    siteName: 'Evara',
    type: 'website',
    locale: 'en_US',
  },
  twitter: { card: 'summary_large_image', title: 'Evara', description: 'Shop millions of products at great prices.' },
  robots: { index: true, follow: true },
  metadataBase: new URL(process.env.NEXTAUTH_URL || 'http://localhost:3000'),
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} flex flex-col min-h-screen bg-white text-gray-900 dark:bg-gray-900 dark:text-gray-100`}>
        <AuthProvider>
          <IntlProvider>
            <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[100] focus:bg-amazon-orange focus:text-black focus:px-4 focus:py-2 focus:rounded focus:font-bold">
              Skip to content
            </a>
            <AnnouncementBanner />
            <Header />
            <main id="main-content" role="main" className="flex-1">{children}</main>
            <Footer />
          </IntlProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
