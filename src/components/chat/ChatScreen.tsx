'use client';

import Link from 'next/link';
import { useEffect, useState, useSyncExternalStore, type FormEvent } from 'react';
import { ChatTeardropDotsIcon, PhoneCallIcon } from '@phosphor-icons/react';
import { AppBar } from '@/components/layout/AppBar';
import { Omok } from '@/components/omok/Omok';
import { Button } from '@/components/ui/Button';
import { todayKey } from '@/lib/date';
import { track } from '@/lib/events';
import { buildChatContext } from '@/lib/omok/context';
import { getBrowserStore, useApp, useStore } from '@/lib/storage/useApp';
import { cn } from '@/lib/cn';

const MAX_LENGTH = 500;
/** 대화가 이만큼 쌓일 때마다 오목이 메모 갱신 */
const NOTE_EVERY = 20;

/** 처음 들어올 때 한 번 보여 주는 안내 팝업을 봤는지 */
const NOTICE_KEY = 'chat-notice-seen';
const noopSubscribe = () => () => {};
function noticeSeenInStorage(): boolean {
  try {
    return localStorage.getItem(NOTICE_KEY) === '1';
  } catch {
    return true;
  }
}

/** 위기 표현 뒤에 붙는 따뜻한 안내 카드: 자살예방 상담 109 (24시간), 전화가 부담스러우면 문자로 */
function CrisisCard() {
  const button =
    'flex h-11 flex-1 items-center justify-center gap-1.5 rounded-full text-sm font-bold transition-transform active:scale-[0.98]';
  return (
    <div className="mt-2 w-[80%] rounded-2xl rounded-tl-md bg-cream px-4 py-3.5 shadow-[0_4px_14px_rgba(75,46,32,0.08)]">
      <p className="text-sm font-bold text-cocoa-900">지금 바로 이야기 들어 줄 사람들이야</p>
      <p className="mt-0.5 text-[13px] text-taupe-500">자살예방 상담 109 · 24시간 · 비밀 보장</p>
      <div className="mt-3 flex gap-2">
        <a href="tel:109" className={cn(button, 'bg-leaf-600 text-white')}>
          <PhoneCallIcon size={17} aria-hidden />
          전화하기
        </a>
        <a href="sms:109" className={cn(button, 'border border-cream-line bg-surface text-cocoa-900')}>
          <ChatTeardropDotsIcon size={17} aria-hidden />
          문자로 하기
        </a>
      </div>
      <p className="mt-2.5 text-[12px] leading-relaxed text-taupe-500">위험한 상황이면 112·119로 연락해 줘.</p>
    </div>
  );
}

/** 오목이와 대화 (뼈대 UI). 대화는 이 기기에만 저장된다 */
export function ChatScreen() {
  const store = useStore();
  const messages = useApp((s) => s.chat.messages);
  const hasNote = useApp((s) => s.chat.note !== null);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  // 처음 들어오면 안내 팝업 한 번, 오목이(위 얼굴)를 누르면 잊게 하기 팝업
  const noticeSeen = useSyncExternalStore(noopSubscribe, noticeSeenInStorage, () => true);
  const [noticeClosed, setNoticeClosed] = useState(false);
  const [forgetOpen, setForgetOpen] = useState(false);

  function closeNotice() {
    setNoticeClosed(true);
    try {
      localStorage.setItem(NOTICE_KEY, '1');
    } catch {}
  }

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
    track('chat_send');
    setText('');
    setSending(true);
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: trimmed, context }),
      });
      const data = (await res.json()) as { reply?: string; crisis?: boolean; error?: string; action?: { label: string; href: string } | null };
      store.addChatMessage({
        role: 'omok',
        text: data.reply ?? data.error ?? '잠깐 말을 놓쳤어. 다시 말해 줄래?',
        crisis: data.crisis || undefined,
        action: data.action ?? undefined,
      });
    } catch {
      store.addChatMessage({ role: 'omok', text: '연결이 잠깐 끊겼어. 다시 말해 줄래?' });
    } finally {
      setSending(false);
    }
    void refreshNote();
  }

  /** 지난 메모 뒤로 대화가 NOTE_EVERY줄 쌓이면 오목이 메모를 새로 쓴다. 메모가 대화를 다 담았으면 true */
  async function refreshNote(force = false): Promise<boolean> {
    const { chat } = getBrowserStore().getState();
    const since = chat.messages.length - (chat.note?.messageCount ?? 0);
    if (since <= 0) return true; // 새로 정리할 대화가 없다
    if (!force && since < NOTE_EVERY) return false;
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
      if (!data.summary) return false;
      store.setOmokNote({ summary: data.summary, messageCount: chat.messages.length });
      return true;
    } catch {
      return false; // 다음 기회에 다시
    }
  }

  // 날이 바뀌면 지난 대화는 메모로 정리하고 비운다. 정리에 실패하면(오프라인 등) 지우지 않고 그대로 둔다
  const lastAt = messages?.length ? messages[messages.length - 1].at : null;
  useEffect(() => {
    if (!lastAt || todayKey(new Date(lastAt)) === todayKey()) return;
    void refreshNote(true).then((ok) => {
      if (ok) store.clearChat();
    });
    // refreshNote·store는 바뀌지 않는 참조라 lastAt만 본다
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lastAt]);

  return (
    <div className="flex min-h-dvh flex-col">
      <AppBar
        title="오목이와 대화"
        backHref="/"
        right={
          <button
            type="button"
            aria-label="오목이가 나를 잊게 하기"
            onClick={() => setForgetOpen(true)}
            className="grid size-11 place-items-center rounded-full active:bg-black/5"
          >
            <Omok pose="hello" height={34} />
          </button>
        }
      />
      <div className="flex-1 space-y-3 px-4 pb-4">
        {messages?.length === 0 && (
          <div className="flex items-center gap-2 pt-2">
            <Omok pose="hello" height={48} />
            <p className="rounded-2xl rounded-tl-md border border-line bg-surface px-3.5 py-2.5">
              {hasNote
                ? '오늘 하루는 어땠어? 편하게 이야기해 줘.'
                : '안녕, 나는 오목이야! 흰머리 오목눈이 새고, 네 마음 이야기를 듣는 친구야. 고민도 자랑도 다 괜찮아 — 오늘 하루는 어땠어?'}
            </p>
          </div>
        )}
        <ul className="space-y-2">
          {messages?.map((m) => (
            <li key={m.id} className={cn('flex flex-col', m.role === 'user' ? 'items-end' : 'items-start')}>
              <p
                className={cn(
                  'max-w-[80%] rounded-2xl px-3.5 py-2.5 text-[15px] leading-relaxed whitespace-pre-wrap',
                  m.role === 'user' ? 'rounded-tr-md bg-leaf-600/15' : 'rounded-tl-md border border-line bg-surface',
                )}
              >
                {m.text}
              </p>
              {m.action && (
                <Link
                  href={m.action.href}
                  className="mt-1.5 inline-flex h-10 items-center gap-1 rounded-full bg-leaf-600 px-4 text-sm font-bold text-white shadow-[0_4px_12px_rgba(60,85,55,0.25)] transition-transform active:scale-[0.97]"
                >
                  {m.action.label} ›
                </Link>
              )}
              {m.crisis && <CrisisCard />}
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

      {/* 처음 들어올 때 한 번: 대화 저장·정리 안내 */}
      {!noticeSeen && !noticeClosed && (
        <div role="dialog" aria-modal="true" aria-label="대화 안내" className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-5" onClick={closeNotice}>
          <div className="w-full max-w-[400px] rounded-3xl bg-bg p-5" onClick={(e) => e.stopPropagation()}>
            <div className="flex flex-col items-center text-center">
              <Omok pose="hello" height={72} />
              <h2 className="mt-3 text-lg font-bold text-cocoa-900">오목이와 이야기하기 전에</h2>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-ink-600">
              오목이와 나눈 대화는 이 기기에만 저장되고, 하루가 지나면 오목이가 메모로 정리해 기억해요. 오목이는 상담사가 아니에요. 많이 힘들 땐
              109(자살예방 상담전화)에 전화해 주세요.
            </p>
            <Button onClick={closeNotice} className="mt-4 w-full">
              확인했어요
            </Button>
          </div>
        </div>
      )}

      {/* 오목이 얼굴을 누르면: 나를 잊게 하기 (대화+메모 완전 삭제) */}
      {forgetOpen && (
        <div role="dialog" aria-modal="true" aria-label="오목이가 나를 잊게 하기" className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-5" onClick={() => setForgetOpen(false)}>
          <div className="w-full max-w-[400px] rounded-3xl bg-bg p-5" onClick={(e) => e.stopPropagation()}>
            <div className="flex flex-col items-center text-center">
              <Omok pose="question" height={72} />
              <h2 className="mt-3 text-lg font-bold text-cocoa-900">오목이가 나를 잊게 할까?</h2>
            </div>
            <p className="mt-3 text-center text-sm leading-relaxed text-ink-600">
              대화와 오목이가 정리해 둔 메모가 모두 지워져요.
              <br />
              지운 기억은 되돌릴 수 없어요.
            </p>
            <div className="mt-4 space-y-2">
              <Button onClick={() => setForgetOpen(false)} className="w-full">
                계속 기억해 줘
              </Button>
              <Button
                variant="ghost"
                className="w-full text-danger!"
                onClick={() => {
                  store.forgetOmok();
                  setForgetOpen(false);
                }}
              >
                전부 잊어줘
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
