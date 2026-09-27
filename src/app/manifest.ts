import type { MetadataRoute } from 'next';

/** 홈 화면에 추가했을 때 앱처럼 열리도록 하는 웹 앱 매니페스트 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: '온기 — 내 생각을 가볍게 얘기하는 마음 쉼터',
    short_name: '온기',
    description: '오목이에게 내 생각을 가볍게 얘기하고, 하루에 하나씩 작은 활기를. 온기우편함과 함께해요.',
    start_url: '/',
    display: 'standalone',
    orientation: 'portrait',
    lang: 'ko',
    background_color: '#FDFAF5',
    theme_color: '#FDFAF5',
    icons: [
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
      { src: '/icons/maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  };
}
