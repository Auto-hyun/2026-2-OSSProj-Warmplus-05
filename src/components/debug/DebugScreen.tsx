'use client';

import { MOODS } from '@/data/moods';
import { AppBar } from '@/components/layout/AppBar';
import { Button } from '@/components/ui/Button';
import { buildChatContext } from '@/lib/omok/context';
import { currentJar, fullJars, JAR_SIZE } from '@/lib/jar';
import { todayKey } from '@/lib/date';
import { createDefaultState, STORAGE_KEY } from '@/lib/storage/adapters';
import type { AppState, MoodEntry } from '@/lib/storage/types';
import { useApp } from '@/lib/storage/useApp';

/** localStorage에 직접 쓰고 새로고침한다 (스토어는 시작할 때 저장본을 읽는다) */
function overwrite(next: AppState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // 저장 못 하면 그대로
  }
  location.reload();
}

/** 오늘 이전 n일치 기분을 무작위로 만든다 (오늘 기록은 건드리지 않음) */
function sampleMoods(state: AppState, days: number): MoodEntry[] {
  const today = todayKey();
  const keep = state.moods.filter((m) => m.day === today);
  const made = Array.from({ length: days }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (i + 1));
    return { day: todayKey(d), mood: MOODS[Math.floor(Math.random() * MOODS.length)].id, source: 'checkin' as const, at: d.toISOString() };
  });
  return [...keep, ...made];
}

export function DebugScreen() {
  const state = useApp((s) => s);
  if (!state) return null;
  const jar = currentJar(state.moods);
  const rows: [string, string | number][] = [
    ['기분 기록 (일)', state.moods.length],
    ['지금 병', `${jar.number}번 · ${jar.entries.length}/${JAR_SIZE}`],
    ['다 찬 병', fullJars(state.moods).length],
    ['심리테스트 결과', state.tests.length],
    ['만든 노래', state.songs.length],
    ['오목이 대화 (줄)', state.chat.messages.length],
    ['오목이 노트', state.chat.note?.summary ?? '없음'],
  ];

  return (
    <>
      <AppBar title="저장 기록 확인 (개발용)" />
      <div className="space-y-5 px-4 pb-10">
        <p className="text-sm text-ink-600">이 브라우저의 localStorage `{STORAGE_KEY}`에 저장된 내용이야. 개발 서버에서만 열려.</p>
        <table className="w-full text-sm">
          <tbody>
            {rows.map(([k, v]) => (
              <tr key={k} className="border-b border-line">
                <th className="py-2 pr-3 text-left font-medium text-ink-600">{k}</th>
                <td className="py-2">{v}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" onClick={() => overwrite({ ...state, moods: sampleMoods(state, 20) })}>
            지난 20일 기분 채우기
          </Button>
          <Button variant="secondary" onClick={() => overwrite({ ...state, moods: sampleMoods(state, 45) })}>
            지난 45일 (병 2개)
          </Button>
          <Button variant="secondary" onClick={() => overwrite({ ...state, moods: [] })}>
            기분 기록 지우기
          </Button>
          <Button variant="secondary" className="text-danger!" onClick={() => overwrite(createDefaultState())}>
            전체 초기화
          </Button>
        </div>

        <details>
          <summary className="cursor-pointer font-bold">오목이가 대답할 때 보는 맥락</summary>
          <pre className="mt-2 overflow-x-auto rounded-xl bg-surface p-3 text-xs">{JSON.stringify(buildChatContext(state), null, 2)}</pre>
        </details>
        <details>
          <summary className="cursor-pointer font-bold">저장된 전체 기록 (JSON)</summary>
          <pre className="mt-2 overflow-x-auto rounded-xl bg-surface p-3 text-xs">{JSON.stringify(state, null, 2)}</pre>
        </details>
      </div>
    </>
  );
}
