import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { AuthWrapper } from '../components/auth/AuthWrapper';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Trufu AI Chat',
  description: 'Modern AI chatbot interface',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body className={inter.className}>
        <AuthWrapper>{children}</AuthWrapper>
      </body>
    </html>
  );
}
