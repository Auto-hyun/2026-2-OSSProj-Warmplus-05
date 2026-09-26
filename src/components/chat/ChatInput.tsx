'use client';

import { useRef, useState } from 'react';
import { PaperPlaneRightIcon } from '@phosphor-icons/react';
import { cn } from '@/lib/cn';
import { MAX_USER_CHARS } from '@/lib/llm/validate';

const MAX_HEIGHT_PX = 120;

type Props = {
  /** 답장을 기다리는 중이면 보내지 않는다 */
  busy: boolean;
  onSend: (text: string) => void;
};

/** 대화 입력창: 내용에 맞춰 높이가 늘고, 1,000자를 넘으면 알려주고 보내지 않는다 */
export function ChatInput({ busy, onSend }: Props) {
  const [input, setInput] = useState('');
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const content = input.trim();
  const tooLong = content.length > MAX_USER_CHARS;

  function onChange(value: string) {
    setInput(value);
    const el = inputRef.current;
    if (el) {
      el.style.height = 'auto';
      el.style.height = `${Math.min(el.scrollHeight, MAX_HEIGHT_PX)}px`;
    }
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!content || tooLong || busy) return;
        onSend(content);
        setInput('');
        if (inputRef.current) inputRef.current.style.height = '';
      }}
      className="sticky bottom-0 border-t border-line bg-bg/95 px-4 pt-2.5 pb-[calc(env(safe-area-inset-bottom)+10px)] backdrop-blur"
    >
      <div className="flex items-end gap-2">
        <textarea
          ref={inputRef}
          aria-label="메시지 입력"
          rows={1}
          maxLength={MAX_USER_CHARS}
          value={input}
          onChange={(e) => onChange(e.target.value)}
          placeholder="내 생각을 얘기해 보세요"
          className="max-h-[120px] min-h-11 flex-1 resize-none rounded-2xl border border-line bg-surface px-4 py-2.5 text-base leading-relaxed text-ink-900 outline-none placeholder:text-ink-400 focus:border-brown-600/40"
        />
        <button
          type="submit"
          aria-label="보내기"
          disabled={!content || busy || tooLong}
          className="grid size-11 shrink-0 place-items-center rounded-full bg-yellow-500 text-ink-900 transition disabled:opacity-40"
        >
          <PaperPlaneRightIcon size={20} weight="fill" aria-hidden />
        </button>
      </div>
      {input.length > MAX_USER_CHARS - 100 && (
        <p className={cn('mt-1 text-right text-xs', tooLong ? 'text-brown-600' : 'text-ink-400')}>
          {tooLong && <span role="alert">{MAX_USER_CHARS.toLocaleString()}자까지 보낼 수 있어요 · </span>}
          {input.length.toLocaleString()}/{MAX_USER_CHARS.toLocaleString()}
        </p>
      )}
    </form>
  );
}
