'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import { XIcon } from '@phosphor-icons/react';

type Props = {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
};

/** 아래에서 올라오는 창. 배경을 누르거나 ESC로 닫힌다 */
export function BottomSheet({ open, onClose, title, children }: Props) {
  const panelRef = useRef<HTMLDivElement>(null);
  // 부모가 다시 그려질 때마다 onClose가 새 함수여도 아래 효과가 다시 돌지 않도록 ref로 최신 값만 참조
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  });

  // 열릴 때 한 번만 포커스를 옮긴다 (입력 중 포커스를 빼앗지 않게)
  useEffect(() => {
    if (!open) return;
    panelRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCloseRef.current();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

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
