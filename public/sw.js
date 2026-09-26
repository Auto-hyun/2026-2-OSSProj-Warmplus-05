/*
 * 온기 서비스 워커 (최소 구성)
 * - 화면 이동(HTML): 네트워크 우선, 실패하면 저장해 둔 화면 → 오프라인에서도 마지막으로 본 화면이 열린다
 * - 빌드 결과물(/_next/static)·마스코트·아이콘·최적화 이미지: 캐시 우선 (파일 이름에 해시가 있거나 거의 바뀌지 않음)
 * - /api 요청과 다른 사이트 요청은 건드리지 않는다
 * 캐시 구조를 바꾸면 CACHE 이름의 숫자를 올려 주세요(이전 캐시는 activate에서 지워짐).
 */
const CACHE = 'ongi-v1';

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.addAll(['/']))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  );
});

function isStaticAsset(pathname) {
  return (
    pathname.startsWith('/_next/static/') ||
    pathname.startsWith('/_next/image') ||
    pathname.startsWith('/mascot/') ||
    pathname.startsWith('/icons/')
  );
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin || url.pathname.startsWith('/api/')) return;

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE).then((cache) => cache.put(request, copy));
          return response;
        })
        .catch(() => caches.match(request).then((hit) => hit || caches.match('/'))),
    );
    return;
  }

  if (isStaticAsset(url.pathname)) {
    event.respondWith(
      caches.match(request).then(
        (hit) =>
          hit ||
          fetch(request).then((response) => {
            if (response.ok) {
              const copy = response.clone();
              caches.open(CACHE).then((cache) => cache.put(request, copy));
            }
            return response;
          }),
      ),
    );
  }
});
