'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { getMood, type MoodId } from '@/data/moods';
import { AppBar } from '@/components/layout/AppBar';
import { Button, ButtonLink } from '@/components/ui/Button';
import { toast } from '@/components/ui/Toast';
import { dailyResult, quizForDay } from '@/lib/daily';
import { todayKey } from '@/lib/date';
import { track } from '@/lib/events';
import { startSong } from '@/lib/music/client';
import { songRequestFor } from '@/lib/music/prompt';
import { useApp, useStore } from '@/lib/storage/useApp';

/** 결과 감정 → 노래 공방 감정 단어: "오늘의 마음으로 노래 만들기"가 이 단어를 미리 골라 준다 */
const MOOD_WORD: Record<MoodId, string> = {
  joy: 'happy',
  flutter: 'flutter',
  calm: 'peace',
  tired: 'tired',
  sad: 'sadness',
  anxious: 'anxiety',
  angry: 'anger',
};

/** /today: 오늘의 마음 날씨 테스트 3문항 → 결과 화면. 결과는 오늘의 구슬로 유리병에 들어간다 (뼈대 UI) */
export function DailyQuizScreen() {
  const store = useStore();
  const router = useRouter();
  const day = useApp(() => todayKey());
  const [picks, setPicks] = useState<MoodId[]>([]);
  const [result, setResult] = useState<MoodId | null>(null);
  const [busy, setBusy] = useState(false);

  if (!day) return null;
  const quiz = quizForDay(day);

  /** 오늘의 감정에 맞는 단어로 바로 작곡을 맡기고 공방(작곡 중 화면)으로 */
  async function composeToday(mood: MoodId) {
    if (busy) return;
    const source = { kind: 'words' as const, words: [MOOD_WORD[mood]] };
    const request = songRequestFor(source);
    if (!request) return;
    setBusy(true);
    try {
      const { taskId, mode } = await startSong(source);
      store.addPending({ taskId, title: request.title, source, mode });
      router.push('/create');
    } catch (error) {
      toast(error instanceof Error ? error.message : '작곡을 맡기지 못했어요.', { tone: 'error' });
      setBusy(false);
    }
  }

  if (result) {
    const mood = getMood(result);
    return (
      <>
        <AppBar title="오늘의 마음 날씨" backHref="/" />
        <div className="flex flex-col items-center px-4 pt-10 text-center">
          <p className="text-6xl" aria-hidden>
            {mood.emoji}
          </p>
          <h2 className="mt-4 text-2xl font-bold">{mood.weather}</h2>
          <p className="mt-1 text-ink-600">오늘 마음은 {mood.label}에 가까워</p>
          <span className="mt-6 size-10 rounded-full border border-line" style={{ background: mood.color }} aria-hidden />
          <p className="mt-2 text-sm text-ink-600">이 구슬이 유리병에 들어갔어. 내일은 새 테스트가 기다려!</p>
          <Button onClick={() => composeToday(result)} disabled={busy} className="mt-8 w-full">
            {busy ? '오목이에게 부탁하는 중…' : '오늘의 마음으로 노래 만들기'}
          </Button>
          <ButtonLink href="/" variant="secondary" className="mt-2 w-full">
            홈에서 유리병 보기
          </ButtonLink>
          <Button
            variant="ghost"
            className="mt-2 w-full"
            onClick={() => {
              setPicks([]);
              setResult(null);
            }}
          >
            다시 해 보기
          </Button>
        </div>
      </>
    );
  }

  const index = picks.length;
  const question = quiz.questions[index];

  function pick(mood: MoodId) {
    const next = [...picks, mood];
    if (next.length < quiz.questions.length) {
      setPicks(next);
      return;
    }
    const result_ = dailyResult(next);
    store.recordMood(result_, { source: 'daily', testId: quiz.id });
    track('mood_record', { mood: result_, source: 'daily' });
    setResult(result_);
  }

  return (
    <>
      <AppBar title="오늘의 마음 날씨" backHref="/" />
      <div className="px-4 pt-2">
        <p className="text-sm text-ink-600">
          {quiz.title} · {index + 1}/{quiz.questions.length}
        </p>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-line" role="progressbar" aria-valuemin={0} aria-valuemax={quiz.questions.length} aria-valuenow={index + 1} aria-label="진행">
          <div className="h-full rounded-full bg-yellow-500 transition-all" style={{ width: `${((index + 1) / quiz.questions.length) * 100}%` }} />
        </div>
        <h2 className="mt-6 text-xl font-bold">{question.text}</h2>
        <div className="mt-5 grid gap-2.5">
          {question.choices.map((c) => (
            <button
              key={c.label}
              type="button"
              onClick={() => pick(c.mood)}
              className="rounded-2xl border border-line bg-surface px-4 py-3.5 text-left text-[15px] active:bg-yellow-100"
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>
    </>
  );
}
