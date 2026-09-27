'use client';

import { useState } from 'react';
import { PencilSimpleIcon } from '@phosphor-icons/react';
import { Mascot } from '@/components/mascot/Mascot';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { Button } from '@/components/ui/Button';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { getStage, type StageNo } from '@/data/stages';
import { nextStageInfo } from '@/lib/progress';

type Props = {
  birdName: string;
  stage: StageNo;
  count: number;
  daysTogether: number;
  onRename: (name: string) => { ok: boolean };
};

export function ProfileCard({ birdName, stage, count, daysTogether, onRename }: Props) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(birdName);
  const [error, setError] = useState(false);
  const growth = nextStageInfo(count);

  function openEditor() {
    setDraft(birdName);
    setError(false);
    setEditing(true);
  }

  function save() {
    if (onRename(draft).ok) setEditing(false);
    else setError(true);
  }

  return (
    <section aria-label="나의 오목이" className="rounded-3xl bg-surface p-5">
      <div className="flex items-center gap-4">
        <div className="shrink-0 rounded-full bg-yellow-100">
          <Mascot stage={stage} size="md" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1">
            <p className="truncate text-xl font-bold text-ink-900">{birdName}</p>
            <button
              type="button"
              onClick={openEditor}
              aria-label="이름 바꾸기"
              className="-my-1 grid size-11 shrink-0 place-items-center rounded-full text-ink-400 active:bg-black/5"
            >
              <PencilSimpleIcon size={18} aria-hidden />
            </button>
          </div>
          <p className="text-sm text-ink-600">{getStage(stage).name}</p>
          <p className="mt-1 text-xs font-medium text-brown-600">함께한 지 {daysTogether}일째</p>
        </div>
      </div>
      <div className="mt-4">
        <div className="mb-1.5 flex justify-between text-[13px] text-ink-600">
          <span>{growth.next ? `다음 단계까지 미션 ${growth.remaining}개` : '모든 단계를 완성했어요!'}</span>
          <span>누적 {count}개</span>
        </div>
        <ProgressBar value={growth.ratio} label="다음 단계까지 진행률" />
      </div>

      <BottomSheet open={editing} onClose={() => setEditing(false)} title="오목이 이름 바꾸기">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            save();
          }}
        >
          <label htmlFor="bird-name" className="text-sm font-medium text-ink-600">
            새 이름
          </label>
          <input
            id="bird-name"
            value={draft}
            maxLength={10}
            onChange={(e) => {
              setDraft(e.target.value);
              setError(false);
            }}
            className="mt-2 h-12 w-full rounded-2xl border border-line bg-bg px-4 text-base text-ink-900 outline-none focus:border-brown-600/40"
          />
          {error && (
            <p role="alert" className="mt-2 text-[13px] text-brown-600">
              1~10자로 지어주세요
            </p>
          )}
          <Button type="submit" size="lg" full className="mt-5">
            저장
          </Button>
        </form>
      </BottomSheet>
    </section>
  );
}
