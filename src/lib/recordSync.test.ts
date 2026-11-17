import { retry } from './recordSync';

describe('retry (잠깐의 오류는 다시 해 보기)', () => {
  it('잠깐 실패해도 다시 해서 결과를 받는다', async () => {
    let calls = 0;
    const task = async () => {
      calls += 1;
      if (calls < 3) throw new Error('JWT issued at future');
      return '기록';
    };
    await expect(retry(task, [0, 0])).resolves.toBe('기록');
    expect(calls).toBe(3);
  });

  it('계속 실패하면 정해진 횟수만큼만 해 보고 오류를 알린다', async () => {
    let calls = 0;
    const task = async () => {
      calls += 1;
      throw new Error(`실패 ${calls}`);
    };
    await expect(retry(task, [0, 0])).rejects.toThrow('실패 3');
    expect(calls).toBe(3);
  });
});
