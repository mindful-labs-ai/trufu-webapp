import { AuthWrapper } from '@/components/auth/AuthWrapper';
import { GoogleAnalytics } from '@/components/common/GoogleAnalytics';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { ToastProvider } from '@/contexts/ToastContext';
import { QueryProvider } from '@/providers/QueryProvider';
import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Trufu AI - 공감지능 도포',
  description:
    '공감지능 도포 서비스 Trufu. 도포를 비롯한 다양한 AI 들과 대화하며 마음을 나누어보세요.',
  keywords: ['AI', '공감지능', 'Trufu', '도포', '마인드풀랩스'],
  authors: [{ name: '마인드풀랩스(주)' }],
  creator: '마인드풀랩스(주)',
  publisher: '마인드풀랩스(주)',
  icons: {
    icon: '/favicon.png',
    apple: '/webclip.png',
  },
  openGraph: {
    type: 'website',
    locale: 'ko_KR',
    url: 'https://trufu.vercel.app',
    title: 'Trufu AI - 공감지능 도포',
    description: '도포를 비롯한 다양한 AI 들과 대화하며 마음을 나누어보세요.',
    siteName: 'Trufu AI',
    images: [
      {
        url: '/opengraph_img.png',
        width: 1200,
        height: 630,
        alt: 'Trufu AI',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Trufu AI - 공감지능 도포',
    description:
      '공감지능 도포 서비스 Trufu. 도포를 비롯한 다양한 AI 들과 대화하며 마음을 나누어보세요.',
    images: ['/opengraph_img.png'],
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#ffffff',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <head>
        <GoogleAnalytics />
      </head>
      <body className={inter.className}>
        <ThemeProvider>
          <ToastProvider>
            <QueryProvider>
              <AuthWrapper>{children}</AuthWrapper>
            </QueryProvider>
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
