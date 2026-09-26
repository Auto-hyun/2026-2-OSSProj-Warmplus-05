'use client';

import { Fragment, useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { ArrowClockwiseIcon, WifiSlashIcon } from '@phosphor-icons/react';
import { AppBar } from '@/components/layout/AppBar';
import { HelplineCard } from '@/components/ui/HelplineCard';
import { Skeleton } from '@/components/ui/Skeleton';
import { BRIDGE_AFTER_USER_MESSAGES, ReplyError, buildRequestMessages, requestReply } from '@/lib/chat-client';
import { formatKoreanDate, type DayKey } from '@/lib/date';
import { MAX_USER_CHARS } from '@/lib/llm/validate';
import { DEFAULT_BIRD_NAME } from '@/lib/storage/adapters';
import { displayStage } from '@/lib/storage/selectors';
import { useOngi, useStore } from '@/lib/storage/useOngi';
import { BridgeCard } from './BridgeCard';
import { ChatInput } from './ChatInput';
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
  const birdName = useOngi((s) => s.profile.birdName) ?? DEFAULT_BIRD_NAME;
  const seenNotice = useOngi((s) => s.settings.seenChatNotice);
  const online = useOnline();

  /** 스트리밍 중인 답장. null이면 기다리는 답장 없음 */
  const [pending, setPending] = useState<string | null>(null);
  /** 온기우편함 카드를 붙일 위치(이 개수만큼의 메시지 뒤) */
  const [bridgeAt, setBridgeAt] = useState<number | null>(null);
  /** 마지막 답장을 받지 못한 이유 */
  const [error, setError] = useState<ReplyError | null>(null);
  const endRef = useRef<HTMLDivElement>(null);

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
    const replyingTo = current.messages.at(-1)?.at;
    setError(null);
    setPending('');
    try {
      const result = await requestReply(buildRequestMessages(current.question, current.messages), (chunk) =>
        setPending((prev) => (prev ?? '') + chunk),
      );
      // 기다리는 사이 기록을 지웠거나(초기화) 다른 탭에서 대화가 이어졌으면 이 답장은 버린다
      if (store.getState().chats[date]?.messages.at(-1)?.at !== replyingTo) return;
      if (result.type === 'safety') {
        store.appendChatMessage(date, question, { role: 'assistant', content: result.message, kind: 'safety' });
      } else {
        store.appendChatMessage(date, question, { role: 'assistant', content: result.text });
        maybeShowBridge();
      }
    } catch (e) {
      // 마지막 메시지가 사용자 메시지로 남아 이유와 (다시 보낼 만하면) '다시 보내기'가 나타난다
      setError(e instanceof ReplyError ? e : new ReplyError('답장을 받지 못했어요. 다시 보내 주세요.', true));
    } finally {
      setPending(null);
    }
  }

  function send(text: string) {
    const content = text.trim();
    if (!content || content.length > MAX_USER_CHARS || busy || readOnly) return;
    store.appendChatMessage(date, question, { role: 'user', content });
    void fetchReply();
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

            {busy && <MessageBubble role="assistant" content={pending ?? ''} pending avatarStage={stage} name={birdName} />}

            {!readOnly && lastIsUser && !busy && (
              <div className="flex flex-col items-end">
                {error && (
                  <p role="alert" className="px-3 text-right text-[13px] text-ink-600">
                    {error.message}
                  </p>
                )}
                {error?.retryable !== false && (
                  <button
                    type="button"
                    onClick={() => void fetchReply()}
                    className="inline-flex min-h-11 items-center gap-1.5 rounded-full px-3 text-[13px] font-semibold text-brown-600 active:bg-black/5"
                  >
                    <ArrowClockwiseIcon size={15} aria-hidden />
                    다시 보내기
                  </button>
                )}
              </div>
            )}
          </>
        )}
        <div ref={endRef} />
      </div>

      {!readOnly && <ChatInput busy={busy} onSend={send} />}
    </div>
  );
}
