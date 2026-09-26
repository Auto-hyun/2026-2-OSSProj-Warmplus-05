/*
 * 온기 서비스 워커 (최소 구성)
 * - 화면 이동(HTML): 네트워크 우선. 성공한 응답만 저장해 두고, 오프라인이면 저장본(없으면 홈)을 보여준다
 * - 빌드 결과물(/_next/static): 파일 이름에 해시가 있어 바뀌지 않으므로 저장본 우선
 * - 마스코트·아이콘·최적화 이미지: 저장본을 먼저 보여주고 뒤에서 새 파일로 갱신 (에셋을 교체해도 다음 방문부터 반영)
 * - /api 요청과 다른 사이트 요청은 건드리지 않는다
 * 캐시 구조를 바꾸면 CACHE 이름의 숫자를 올려 주세요(이전 캐시는 activate에서 지워짐).
 */
const CACHE = 'ongi-v2';

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

const isImmutable = (pathname) => pathname.startsWith('/_next/static/');
const isRevalidated = (pathname) =>
  pathname.startsWith('/_next/image') || pathname.startsWith('/mascot/') || pathname.startsWith('/icons/');

/** 네트워크 요청 + (성공했을 때만) 페이지에 넘기기 전에 저장용 복사본을 만들어 둔다 */
function fetchWithCopy(request) {
  return fetch(request).then((response) => ({ response, copy: response.ok ? response.clone() : null }));
}

function store(request, copy) {
  return copy ? caches.open(CACHE).then((cache) => cache.put(request, copy)) : undefined;
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin || url.pathname.startsWith('/api/')) return;

  if (request.mode === 'navigate') {
    const network = fetchWithCopy(request);
    event.respondWith(
      network.then(({ response }) => response).catch(() => caches.match(request).then((hit) => hit || caches.match('/'))),
    );
    event.waitUntil(network.then(({ copy }) => store(request, copy)).catch(() => undefined));
    return;
  }

  if (isImmutable(url.pathname)) {
    event.respondWith(
      caches.match(request).then((hit) => {
        if (hit) return hit;
        const network = fetchWithCopy(request);
        event.waitUntil(network.then(({ copy }) => store(request, copy)).catch(() => undefined));
        return network.then(({ response }) => response);
      }),
    );
    return;
  }

  if (isRevalidated(url.pathname)) {
    const network = fetchWithCopy(request);
    event.waitUntil(network.then(({ copy }) => store(request, copy)).catch(() => undefined));
    event.respondWith(caches.match(request).then((hit) => hit || network.then(({ response }) => response)));
  }
});
