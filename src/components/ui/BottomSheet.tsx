'use client';

import type { ReactNode } from 'react';
import { XIcon } from '@phosphor-icons/react';
import { useModal } from './useModal';

type Props = {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
};

/** 아래에서 올라오는 창. 배경을 누르거나 ESC로 닫힌다 */
export function BottomSheet({ open, onClose, title, children }: Props) {
  const panelRef = useModal<HTMLDivElement>(open, onClose);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 animate-[ongi-fade_0.2s_ease-out] bg-black/30" onClick={onClose} aria-hidden />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        className="absolute inset-x-0 bottom-0 mx-auto max-w-[480px] animate-[ongi-sheet_0.25s_ease-out] rounded-t-3xl bg-surface px-5 pt-5 pb-[calc(env(safe-area-inset-bottom)+20px)] outline-none"
      >
        <div className="mb-4 flex items-center gap-2">
          {title && <h2 className="flex-1 text-lg font-bold text-ink-900">{title}</h2>}
          <button
            type="button"
            onClick={onClose}
            aria-label="닫기"
            className="-mr-2 ml-auto grid size-11 place-items-center rounded-full text-ink-600 active:bg-black/5"
          >
            <XIcon size={22} aria-hidden />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
