import { createDefaultState } from './adapters';
import { completedCount, daysTogether, displayStage, monthCompletedCount, realStage, talkedDaysCount } from './selectors';
import type { OngiState } from './types';

const NOW = new Date('2026-09-26T01:00:00Z');

function withRecords(days: string[]): OngiState {
  const s = createDefaultState(NOW, 'id');
  for (const d of days) s.missions.records[d] = { missionId: 'walk-10', completedAt: NOW.toISOString() };
  return s;
}

describe('selectors', () => {
  it('누적 완료 수와 실제 단계', () => {
    const s = withRecords(['2026-09-01', '2026-09-02', '2026-09-03', '2026-09-04', '2026-09-05']);
    expect(completedCount(s)).toBe(5);
    expect(realStage(s)).toBe(2);
    expect(displayStage(s)).toBe(2);
  });

  it('시연 단계 강제 표시는 보여주는 단계만 바꾼다', () => {
    const s = withRecords(['2026-09-01', '2026-09-02', '2026-09-03']);
    s.settings.stageOverride = 4;
    expect(displayStage(s)).toBe(4);
    expect(realStage(s)).toBe(2);
  });

  it('이번 달 완료 수는 월 경계를 지킨다', () => {
    const s = withRecords(['2026-08-31', '2026-09-01', '2026-09-30', '2026-10-01']);
    expect(monthCompletedCount(s, 2026, 9)).toBe(2);
  });

  it('얘기한 날은 내가 한 마디라도 한 날만 센다', () => {
    const s = createDefaultState(NOW, 'id');
    s.chats['2026-09-20'] = { question: 'Q', bridgeShown: false, messages: [{ role: 'user', content: 'a', at: '' }] };
    s.chats['2026-09-21'] = { question: 'Q', bridgeShown: false, messages: [{ role: 'assistant', content: 'b', at: '' }] };
    expect(talkedDaysCount(s)).toBe(1);
  });

  it('함께한 날은 시작일을 1일째로 센다', () => {
    const s = createDefaultState(NOW, 'id'); // startedOn 2026-09-26
    expect(daysTogether(s, '2026-09-26')).toBe(1);
    expect(daysTogether(s, '2026-10-02')).toBe(7);
    expect(daysTogether(s, '2026-09-20')).toBe(1);
  });
});
