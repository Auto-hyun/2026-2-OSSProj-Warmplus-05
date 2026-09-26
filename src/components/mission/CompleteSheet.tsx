'use client';

import { useState } from 'react';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { Button } from '@/components/ui/Button';
import type { Mission } from '@/data/missions';

const NOTE_MAX = 100;

type Props = {
  open: boolean;
  mission: Mission;
  onClose: () => void;
  onSubmit: (note: string) => void;
};

/** 완료 확인 창. 한 줄 메모는 선택. 창을 닫으면 완료되지 않는다 */
export function CompleteSheet({ open, mission, onClose, onSubmit }: Props) {
  const [note, setNote] = useState('');

  return (
    <BottomSheet open={open} onClose={onClose} title="미션 완료">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit(note);
          setNote('');
        }}
      >
        <p className="flex items-center gap-2 text-[15px] font-semibold text-ink-900">
          <span aria-hidden className="text-xl">
            {mission.emoji}
          </span>
          {mission.title}
        </p>
        <label htmlFor="mission-note" className="mt-5 block text-sm font-medium text-ink-600">
          어땠나요? (선택)
        </label>
        <input
          id="mission-note"
          type="text"
          maxLength={NOTE_MAX}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="한 줄로 남겨도 좋아요"
          className="mt-2 h-12 w-full rounded-2xl border border-line bg-bg px-4 text-base text-ink-900 outline-none placeholder:text-ink-400 focus:border-brown-600/40"
        />
        <Button type="submit" size="lg" full className="mt-5">
          완료
        </Button>
      </form>
    </BottomSheet>
  );
}
