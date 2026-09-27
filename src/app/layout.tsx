import type { Metadata, Viewport } from 'next';
import { Nanum_Pen_Script } from 'next/font/google';
import 'pretendard/dist/web/variable/pretendardvariable-dynamic-subset.css';
import './globals.css';
import { ServiceWorkerRegister } from '@/components/layout/ServiceWorkerRegister';

/** 시작 화면(먼저 도착한 편지)의 손글씨. 빌드 때 받아 앱에 포함하고, 쓰는 화면에서만 내려받도록 미리 받지 않는다 */
const handwriting = Nanum_Pen_Script({ weight: '400', subsets: ['latin'], variable: '--font-hand', display: 'swap', preload: false });

export const metadata: Metadata = {
  title: '온기',
  description: '내 생각을 가볍게 얘기하고, 하루에 하나씩 작은 활기를. 온기우편함과 함께하는 마음 쉼터예요.',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#FDFAF5',
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="ko" className={`h-full antialiased ${handwriting.variable}`}>
      <body className="min-h-full">
        {children}
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
