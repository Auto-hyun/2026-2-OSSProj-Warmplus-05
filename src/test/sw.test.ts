// @vitest-environment node
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const ORIGIN = 'http://localhost';
const code = readFileSync(resolve(__dirname, '../../public/sw.js'), 'utf8');

type Req = { url: string; method: string; mode: string };
const keyOf = (req: Req | string) => (typeof req === 'string' ? new URL(req, ORIGIN).href : req.url);

/** public/sw.js를 가짜 서비스 워커 환경(self·caches·fetch)에서 실행한다 */
function loadWorker(cached: Record<string, string>, fetchImpl: (req: Req) => Promise<Response>) {
  const store = new Map<string, Response>(Object.entries(cached).map(([path, body]) => [`${ORIGIN}${path}`, new Response(body)]));
  const put = vi.fn(async (req: Req, res: Response) => {
    store.set(keyOf(req), res);
  });
  const cache = { put, match: async (req: Req) => store.get(keyOf(req)), addAll: async () => {} };
  const caches = {
    open: async () => cache,
    match: async (req: Req | string) => store.get(keyOf(req)),
    keys: async () => [],
    delete: async () => true,
  };
  const listeners: Record<string, (event: unknown) => void> = {};
  const self = {
    addEventListener: (type: string, fn: (event: unknown) => void) => {
      listeners[type] = fn;
    },
    location: { origin: ORIGIN },
    skipWaiting: () => {},
    clients: { claim: async () => {} },
  };
  const fetchSpy = vi.fn(fetchImpl);
  new Function('self', 'caches', 'fetch', code)(self, caches, fetchSpy);

  function dispatch(path: string, mode = 'no-cors') {
    let response: Promise<Response> | undefined;
    const waits: Promise<unknown>[] = [];
    listeners.fetch({
      request: { url: `${ORIGIN}${path}`, method: 'GET', mode },
      respondWith: (p: Promise<Response>) => {
        response = p;
      },
      waitUntil: (p: Promise<unknown>) => {
        waits.push(p);
      },
    });
    return { response, settled: async () => Promise.all(waits) };
  }

  return { dispatch, put, store, fetchSpy };
}

const ok = (body: string) => async () => new Response(body, { status: 200 });

describe('서비스 워커 (public/sw.js)', () => {
  it('화면 이동이 오류(500)면 캐시에 저장하지 않는다 — 오프라인 화면이 오류 화면으로 덮이지 않게', async () => {
    const sw = loadWorker({}, async () => new Response('서버 오류', { status: 500 }));
    const { response, settled } = sw.dispatch('/', 'navigate');
    expect((await response!).status).toBe(500);
    await settled();
    expect(sw.put).not.toHaveBeenCalled();
  });

  it('화면 이동이 성공하면 오프라인용으로 저장한다', async () => {
    const sw = loadWorker({}, ok('<html>홈</html>'));
    const { response, settled } = sw.dispatch('/', 'navigate');
    expect(await (await response!).text()).toBe('<html>홈</html>');
    await settled();
    expect(await sw.store.get(`${ORIGIN}/`)!.text()).toBe('<html>홈</html>');
  });

  it('마스코트 이미지는 저장본을 먼저 보여주되, 뒤에서 새 파일로 갱신한다 — 에셋 교체가 반영되게', async () => {
    const sw = loadWorker({ '/mascot/stage-1.png': '옛 그림' }, ok('새 그림'));
    const { response, settled } = sw.dispatch('/mascot/stage-1.png');
    expect(await (await response!).text()).toBe('옛 그림');
    await settled();
    expect(sw.fetchSpy).toHaveBeenCalled();
    expect(await sw.store.get(`${ORIGIN}/mascot/stage-1.png`)!.text()).toBe('새 그림');
  });

  it('최적화 이미지(/_next/image)도 뒤에서 갱신한다', async () => {
    const sw = loadWorker({ '/_next/image?url=%2Fmascot%2Fstage-1.png&w=640&q=75': '옛 그림' }, ok('새 그림'));
    const { settled } = sw.dispatch('/_next/image?url=%2Fmascot%2Fstage-1.png&w=640&q=75');
    await settled();
    expect(await sw.store.get(`${ORIGIN}/_next/image?url=%2Fmascot%2Fstage-1.png&w=640&q=75`)!.text()).toBe('새 그림');
  });

  it('빌드 결과물(/_next/static)은 해시 이름이라 저장본만 쓴다', async () => {
    const sw = loadWorker({ '/_next/static/chunks/app.js': '번들' }, ok('다른 번들'));
    const { response } = sw.dispatch('/_next/static/chunks/app.js');
    expect(await (await response!).text()).toBe('번들');
    expect(sw.fetchSpy).not.toHaveBeenCalled();
  });

  it('API 요청은 건드리지 않는다', () => {
    const sw = loadWorker({}, ok('x'));
    expect(sw.dispatch('/api/chat').response).toBeUndefined();
  });
});
