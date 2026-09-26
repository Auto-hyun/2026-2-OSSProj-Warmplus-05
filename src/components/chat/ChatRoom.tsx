'use client';

import { Fragment, useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { ArrowClockwiseIcon, PaperPlaneRightIcon, WifiSlashIcon } from '@phosphor-icons/react';
import { AppBar } from '@/components/layout/AppBar';
import { HelplineCard } from '@/components/ui/HelplineCard';
import { Skeleton } from '@/components/ui/Skeleton';
import { BRIDGE_AFTER_USER_MESSAGES, buildRequestMessages, requestReply } from '@/lib/chat-client';
import { cn } from '@/lib/cn';
import { formatKoreanDate, type DayKey } from '@/lib/date';
import { MAX_USER_CHARS } from '@/lib/llm/validate';
import { displayStage } from '@/lib/storage/selectors';
import { useOngi, useStore } from '@/lib/storage/useOngi';
import { BridgeCard } from './BridgeCard';
import { ChatNotice } from './ChatNotice';
import { MessageBubble } from './MessageBubble';
import { QuickReplies } from './QuickReplies';

function subscribeOnline(onChange: () => void) {
  window.addEventListener('online', onChange);
  window.addEventListener('offline', onChange);
  return () => {
    window.removeEventListener('online', onChange);
    window.removeEventListener('offline', onChange);
  };
}

function useOnline(): boolean {
  return useSyncExternalStore(subscribeOnline, () => navigator.onLine, () => true);
}

type Props = {
  date: DayKey;
  question: string;
  /** 지난 대화: 읽기만 */
  readOnly: boolean;
};

export function ChatRoom({ date, question, readOnly }: Props) {
  const store = useStore();
  const hydrated = useOngi(() => true);
  const day = useOngi((s) => s.chats[date]);
  const stage = useOngi(displayStage) ?? 1;
  const birdName = useOngi((s) => s.profile.birdName) ?? '뱁새';
  const seenNotice = useOngi((s) => s.settings.seenChatNotice);
  const online = useOnline();

  const [input, setInput] = useState('');
  /** 스트리밍 중인 답장. null이면 기다리는 답장 없음 */
  const [pending, setPending] = useState<string | null>(null);
  /** 온기우편함 카드를 붙일 위치(이 개수만큼의 메시지 뒤) */
  const [bridgeAt, setBridgeAt] = useState<number | null>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const messages = day?.messages ?? [];
  const userCount = messages.filter((m) => m.role === 'user').length;
  const lastIsUser = messages.at(-1)?.role === 'user';
  const busy = pending !== null;

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: 'end' });
  }, [messages.length, pending]);

  // 사용자 메시지가 쌓이면 답장 바로 뒤에 한 번 보여주고 기록해 둔다(다음 방문엔 보이지 않음).
  // 위기 안내 답장 뒤에는 도움 기관 카드에 집중하도록 보여주지 않는다.
  function maybeShowBridge() {
    const current = store.getState().chats[date];
    if (!current || current.bridgeShown) return;
    if (current.messages.filter((m) => m.role === 'user').length < BRIDGE_AFTER_USER_MESSAGES) return;
    setBridgeAt(current.messages.length);
    store.markBridgeShown(date);
  }

  async function fetchReply() {
    const current = store.getState().chats[date];
    if (!current) return;
    setPending('');
    try {
      const result = await requestReply(buildRequestMessages(current.question, current.messages), (chunk) =>
        setPending((prev) => (prev ?? '') + chunk),
      );
      if (result.type === 'safety') {
        store.appendChatMessage(date, question, { role: 'assistant', content: result.message, kind: 'safety' });
      } else {
        store.appendChatMessage(date, question, { role: 'assistant', content: result.text });
        maybeShowBridge();
      }
    } catch {
      // 마지막 메시지가 사용자 메시지로 남아 '다시 보내기'가 나타난다
    } finally {
      setPending(null);
    }
  }

  function send(text: string) {
    const content = text.trim();
    if (!content || busy || readOnly) return;
    store.appendChatMessage(date, question, { role: 'user', content });
    setInput('');
    if (inputRef.current) inputRef.current.style.height = '';
    void fetchReply();
  }

  function onInput(value: string) {
    setInput(value);
    const el = inputRef.current;
    if (el) {
      el.style.height = 'auto';
      el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
    }
  }

  const title = (
    <span className="flex items-center gap-2">
      {birdName}
      {readOnly && <span className="text-sm font-medium text-ink-400">{formatKoreanDate(date)}</span>}
    </span>
  );

  return (
    <div className="flex min-h-dvh flex-col">
      <AppBar title={title} backHref={readOnly ? '/me' : '/'} />

      {!online && (
        <p role="status" className="flex items-center justify-center gap-1.5 bg-ink-900 px-4 py-2 text-xs text-white">
          <WifiSlashIcon size={14} aria-hidden />
          인터넷 연결을 확인해 주세요
        </p>
      )}

      <div className="flex-1 space-y-3 px-4 pt-2 pb-6">
        {!hydrated ? (
          <Skeleton className="h-16 w-3/4" />
        ) : (
          <>
            {readOnly && <p className="py-1 text-center text-xs text-ink-400">지난 대화예요</p>}
            {!readOnly && seenNotice === false && <ChatNotice onClose={() => store.markChatNoticeSeen()} />}

            <MessageBubble role="assistant" content={question} avatarStage={stage} />
            {!readOnly && userCount === 0 && !busy && <QuickReplies onPick={send} />}

            {messages.map((m, i) => (
              <Fragment key={`${m.at}-${i}`}>
                <MessageBubble role={m.role} content={m.content} avatarStage={stage} />
                {m.kind === 'safety' && (
                  <div className="pl-11">
                    <HelplineCard />
                  </div>
                )}
                {bridgeAt === i + 1 && <BridgeCard />}
              </Fragment>
            ))}

            {busy && <MessageBubble role="assistant" content={pending ?? ''} pending avatarStage={stage} />}

            {!readOnly && lastIsUser && !busy && (
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => void fetchReply()}
                  className="inline-flex min-h-11 items-center gap-1.5 rounded-full px-3 text-[13px] font-semibold text-brown-600 active:bg-black/5"
                >
                  <ArrowClockwiseIcon size={15} aria-hidden />
                  다시 보내기
                </button>
              </div>
            )}
          </>
        )}
        <div ref={endRef} />
      </div>

      {!readOnly && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            send(input);
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
              onChange={(e) => onInput(e.target.value)}
              placeholder="편하게 털어놓아 보세요"
              className="max-h-[120px] min-h-11 flex-1 resize-none rounded-2xl border border-line bg-surface px-4 py-2.5 text-[15px] leading-relaxed text-ink-900 outline-none placeholder:text-ink-400 focus:border-brown-600/40"
            />
            <button
              type="submit"
              aria-label="보내기"
              disabled={!input.trim() || busy}
              className={cn(
                'grid size-11 shrink-0 place-items-center rounded-full bg-yellow-500 text-ink-900 transition disabled:opacity-40',
              )}
            >
              <PaperPlaneRightIcon size={20} weight="fill" aria-hidden />
            </button>
          </div>
          {input.length > MAX_USER_CHARS - 100 && (
            <p className="mt-1 text-right text-xs text-ink-400">
              {input.length.toLocaleString()}/{MAX_USER_CHARS.toLocaleString()}
            </p>
          )}
        </form>
      )}
    </div>
  );
}
