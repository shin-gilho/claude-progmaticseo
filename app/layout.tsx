import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Programmatic SEO Generator',
  description:
    '롱테일 키워드를 활용한 SEO 최적화 콘텐츠 자동 생성 & 워드프레스 등록 시스템',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className={inter.className}>
        <div className="min-h-screen bg-background">{children}</div>
      </body>
    </html>
  );
}
