/**
 * 간단한 요청 횟수 제한 (서버 한 대의 메모리 안에서만 센다).
 * 배포 서버가 여러 대로 나뉘면 정확하지 않지만, 누군가 작곡 버튼을 마구 눌러 크레딧을 다 쓰는 것은 막는다.
 */
export function createRateLimiter(limit: number, windowMs: number) {
  const hits = new Map<string, number[]>();
  return function allow(key: string, now: number = Date.now()): boolean {
    const recent = (hits.get(key) ?? []).filter((at) => now - at < windowMs);
    const ok = recent.length < limit;
    if (ok) recent.push(now);
    hits.set(key, recent);
    return ok;
  };
}
