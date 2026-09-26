'use client';

import { Button } from './Button';
import { useModal } from './useModal';

type Props = {
  open: boolean;
  title: string;
  description?: string;
  confirmLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
};

/** 되돌릴 수 없는 동작 전에 한 번 더 묻는 창. ESC나 배경을 누르면 취소 */
export function ConfirmDialog({ open, title, description, confirmLabel, onConfirm, onCancel }: Props) {
  const panelRef = useModal<HTMLDivElement>(open, onCancel);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 grid place-items-center px-8">
      <div className="absolute inset-0 animate-[ongi-fade_0.2s_ease-out] bg-black/30" onClick={onCancel} aria-hidden />
      <div
        ref={panelRef}
        role="alertdialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        className="relative w-full max-w-[340px] animate-[ongi-pop_0.2s_ease-out] rounded-3xl bg-surface p-6 outline-none"
      >
        <h2 className="text-lg font-bold text-ink-900">{title}</h2>
        {description && <p className="mt-2 text-sm leading-relaxed text-ink-600">{description}</p>}
        <div className="mt-6 flex gap-2">
          <Button variant="secondary" full onClick={onCancel}>
            취소
          </Button>
          <Button full onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
