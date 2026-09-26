/** 테스트용 Storage. throwOnSet이면 사파리 사생활 보호 모드처럼 쓰기에서 예외를 던진다 */
export class FakeStorage implements Storage {
  private data = new Map<string, string>();

  constructor(private readonly throwOnSet = false) {}

  get length(): number {
    return this.data.size;
  }

  clear(): void {
    this.data.clear();
  }

  getItem(key: string): string | null {
    return this.data.has(key) ? this.data.get(key)! : null;
  }

  key(index: number): string | null {
    return [...this.data.keys()][index] ?? null;
  }

  removeItem(key: string): void {
    this.data.delete(key);
  }

  setItem(key: string, value: string): void {
    if (this.throwOnSet) throw new DOMException('QuotaExceededError', 'QuotaExceededError');
    this.data.set(key, String(value));
  }
}
