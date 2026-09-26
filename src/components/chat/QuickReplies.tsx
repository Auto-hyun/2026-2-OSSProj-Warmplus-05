import { QUICK_REPLIES } from '@/lib/chat-client';

/** 무슨 말부터 해야 할지 막막할 때 누르는 빠른 답 */
export function QuickReplies({ onPick, disabled = false }: { onPick: (text: string) => void; disabled?: boolean }) {
  return (
    <div className="flex flex-wrap gap-2 pl-11">
      {QUICK_REPLIES.map((text) => (
        <button
          key={text}
          type="button"
          disabled={disabled}
          onClick={() => onPick(text)}
          className="min-h-11 rounded-full border border-line bg-surface px-3.5 text-sm font-medium text-ink-900 active:bg-yellow-100 disabled:opacity-40"
        >
          {text}
        </button>
      ))}
    </div>
  );
}
