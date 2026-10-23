'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { toast } from '@/components/ui/Toast';
import type { MoodFamily } from '@/data/music';
import { MAX_WORDS, WORDS } from '@/data/words';
import { particle } from '@/lib/josa';
import { songRequestFor } from '@/lib/music/prompt';
import type { SongSource } from '@/lib/music/types';
import { WordCloud } from './WordCloud';

const ORDER: MoodFamily[] = ['sad', 'stress', 'happy', 'calm'];
/** 갈래별로 묶지 않고 섞어서 보여 준다: 갈래를 번갈아 하나씩 */
const GROUPS = ORDER.map((family) => WORDS.filter((w) => w.family === family));
const MIXED = Array.from({ length: Math.max(...GROUPS.map((g) => g.length)) }, (_, i) => GROUPS.map((g) => g[i]))
  .flat()
  .filter((w) => w !== undefined);

type Props = { busy: boolean; onCompose: (source: SongSource) => void };

/** 방법 2: 지금 감정에 맞는 단어를 골라 그 분위기의 노래 */
export function WordMethod({ busy, onCompose }: Props) {
  const [picked, setPicked] = useState<string[]>([]);
  const request = picked.length > 0 ? songRequestFor({ kind: 'words', words: picked }) : null;

  function toggle(id: string) {
    if (picked.includes(id)) {
      setPicked(picked.filter((w) => w !== id));
      return;
    }
    if (picked.length >= MAX_WORDS) {
      toast(`단어는 ${MAX_WORDS}개까지 고를 수 있어요.`);
      return;
    }
    setPicked([...picked, id]);
  }

  return (
    <div className="space-y-3">
      <p className="flex items-baseline justify-between text-[15px] font-semibold">
        지금 마음에 맞는 단어를 골라 주세요
        <span className="text-sm font-normal text-ink-400">
          {picked.length}/{MAX_WORDS}
        </span>
      </p>
      <WordCloud words={MIXED} picked={picked} onToggle={toggle} />

      <div className="rounded-3xl border border-line bg-surface p-4">
        <p className="min-h-6 text-center text-[15px]">
          {request ? (
            <>
              <b>‘{request.title}’</b>
              {particle(request.title, '을/를')} 만들어요
            </>
          ) : (
            <span className="text-ink-400">{MAX_WORDS}개까지 고를 수 있어요</span>
          )}
        </p>
        <Button
          onClick={() => onCompose({ kind: 'words', words: picked })}
          disabled={!request || busy}
          className="mt-3 w-full"
        >
          {busy ? '오목이에게 부탁하는 중…' : '이 감정으로 작곡하기'}
        </Button>
      </div>
    </div>
  );
}
