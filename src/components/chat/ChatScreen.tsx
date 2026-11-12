'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { AppBar } from '@/components/layout/AppBar';
import { Omok } from '@/components/omok/Omok';
import { Button } from '@/components/ui/Button';
import { buildChatContext } from '@/lib/omok/context';
import { getBrowserStore, useApp, useStore } from '@/lib/storage/useApp';
import { cn } from '@/lib/cn';

const MAX_LENGTH = 500;
/** 대화가 이만큼 쌓일 때마다 오목이 메모 갱신 */
const NOTE_EVERY = 20;

/** 오목이와 대화 (뼈대 UI). 대화는 이 기기에만 저장된다 */
export function ChatScreen() {
  const store = useStore();
  const messages = useApp((s) => s.chat.messages);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);
  const [clearing, setClearing] = useState(false);

  // 하단 입력창이 sticky로 떠 있어서 scrollIntoView로는 마지막 말풍선이 입력창 뒤에 숨는다 — 문서 끝까지 내린다
  useEffect(() => {
    window.scrollTo({ top: document.documentElement.scrollHeight });
  }, [messages?.length, sending]);

  async function send(e: FormEvent) {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed || sending) return;
    // 맥락은 내 말을 넣기 전 기록으로 만든다 (내 말은 text로 따로 보낸다)
    const context = buildChatContext(getBrowserStore().getState());
    store.addChatMessage({ role: 'user', text: trimmed });
    setText('');
    setSending(true);
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: trimmed, context }),
      });
      const data = (await res.json()) as { reply?: string; crisis?: boolean; error?: string };
      store.addChatMessage({ role: 'omok', text: data.reply ?? data.error ?? '잠깐 말을 놓쳤어. 다시 말해 줄래?', crisis: data.crisis || undefined });
    } catch {
      store.addChatMessage({ role: 'omok', text: '연결이 잠깐 끊겼어. 다시 말해 줄래?' });
    } finally {
      setSending(false);
    }
    void refreshNote();
  }

  /** 지난 메모 뒤로 대화가 NOTE_EVERY줄 쌓이면 오목이 메모를 새로 쓴다 (실패해도 대화는 그대로) */
  async function refreshNote(force = false) {
    const { chat } = getBrowserStore().getState();
    const since = chat.messages.length - (chat.note?.messageCount ?? 0);
    if (since <= 0 || (!force && since < NOTE_EVERY)) return;
    try {
      const res = await fetch('/api/chat/note', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          previous: chat.note?.summary ?? null,
          messages: chat.messages.slice(-since).map(({ role, text }) => ({ role, text })),
        }),
      });
      const data = (await res.json()) as { summary?: string };
      if (data.summary) store.setOmokNote({ summary: data.summary, messageCount: chat.messages.length });
    } catch {
      // 다음 기회에 다시
    }
  }

  const clearButton =
    messages && messages.length > 0 ? (
      confirmClear ? (
        <Button
          variant="ghost"
          className="h-11! px-3! text-sm! text-danger!"
          onClick={async () => {
            setConfirmClear(false);
            setClearing(true);
            // 아직 메모에 안 들어간 대화를 먼저 기억에 정리하고 지운다
            await refreshNote(true);
            store.clearChat();
            setClearing(false);
          }}
          disabled={clearing}
        >
          정말 지우기
        </Button>
      ) : (
        <Button variant="ghost" className="h-11! px-3! text-sm!" onClick={() => setConfirmClear(true)}>
          대화 지우기
        </Button>
      )
    ) : null;

  return (
    <div className="flex min-h-dvh flex-col">
      <AppBar title="오목이와 대화" backHref="/" right={clearButton} />
      <div className="flex-1 space-y-3 px-4 pb-4">
        <p className="rounded-2xl bg-yellow-100 px-4 py-3 text-sm text-ink-600">
          오목이와 나눈 대화는 이 기기에만 저장돼요. 대화를 지워도 오목이는 정리해 둔 메모로 너를 기억해요. 오목이는 상담사가 아니에요. 많이 힘들 땐 109(자살예방 상담전화)에 전화해 주세요.
        </p>
        {messages?.length === 0 && (
          <div className="flex items-center gap-2 pt-2">
            <Omok pose="hello" height={48} />
            <p className="rounded-2xl rounded-tl-md border border-line bg-surface px-3.5 py-2.5">오늘 하루는 어땠어? 편하게 이야기해 줘.</p>
          </div>
        )}
        <ul className="space-y-2">
          {messages?.map((m) => (
            <li key={m.id} className={cn('flex', m.role === 'user' ? 'justify-end' : 'justify-start')}>
              <p
                className={cn(
                  'max-w-[80%] rounded-2xl px-3.5 py-2.5 text-[15px] leading-relaxed whitespace-pre-wrap',
                  m.role === 'user' ? 'rounded-tr-md bg-yellow-100' : 'rounded-tl-md border border-line bg-surface',
                  m.crisis && 'border-danger',
                )}
              >
                {m.text}
              </p>
            </li>
          ))}
        </ul>
        {sending && <p className="text-sm text-ink-400">오목이가 생각 중…</p>}
      </div>
      <form onSubmit={send} className="sticky bottom-0 flex gap-2 border-t border-line bg-bg px-4 pt-3 pb-[calc(env(safe-area-inset-bottom)+12px)]">
        <label htmlFor="chat-input" className="sr-only">
          오목이에게 할 말
        </label>
        <input
          id="chat-input"
          value={text}
          maxLength={MAX_LENGTH}
          onChange={(e) => setText(e.target.value)}
          placeholder="오목이에게 말하기"
          className="h-12 min-w-0 flex-1 rounded-2xl border border-line bg-surface px-4"
        />
        <Button type="submit" disabled={!text.trim() || sending}>
          보내기
        </Button>
      </form>
    </div>
  );
}
