import type { Metadata, Viewport } from 'next';
import 'pretendard/dist/web/variable/pretendardvariable-dynamic-subset.css';
import './globals.css';
import { AudioProvider } from '@/components/audio/AudioProvider';
import { SongWatcher } from '@/components/music/SongWatcher';
import { Toaster } from '@/components/ui/Toast';

export const metadata: Metadata = {
  title: '오목이',
  description: '지금 내 마음을 노래로. 오목이가 감정에 맞는 곡을 만들어 주는 사운드 테라피 앱이에요.',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#FDFAF5',
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="ko" className="h-full antialiased">
      <body className="min-h-full">
        <AudioProvider>
          {children}
          {/* 작곡을 맡겨 둔 곡이 있으면 어느 화면에 있든 완성됐는지 확인한다 */}
          <SongWatcher />
          <Toaster />
        </AudioProvider>
      </body>
    </html>
  );
}
