'use client';

import Link from 'next/link';
import { BridgeCard } from '@/components/chat/BridgeCard';
import { AppBar } from '@/components/layout/AppBar';
import { Mascot } from '@/components/mascot/Mascot';
import { Button, buttonClass } from '@/components/ui/Button';
import { HelplineCard } from '@/components/ui/HelplineCard';
import { Toast, useToast } from '@/components/ui/Toast';
import { getTest, getTestResult } from '@/data/tests';
import { cn } from '@/lib/cn';
import { formatShortDate } from '@/lib/date';
import { DEFAULT_BIRD_NAME } from '@/lib/storage/adapters';
import { useOngi } from '@/lib/storage/useOngi';

function SectionTitle({ children }: { children: string }) {
  return <h3 className="mb-2 text-[15px] font-bold text-ink-900">{children}</h3>;
}

/** 테스트 결과. 공유 링크로 온 사람도 같은 화면을 본다 (내 결과면 날짜를 붙인다) */
export function TestResultView({ testId, resultId }: { testId: string; resultId: string }) {
  const test = getTest(testId)!;
  const result = getTestResult(test, resultId)!;
  const record = useOngi((s) => s.tests[testId]);
  const birdName = useOngi((s) => s.profile.birdName) ?? DEFAULT_BIRD_NAME;
  const mine = record?.resultId === resultId ? record : undefined;
  const { toast, showToast } = useToast(2500);

  async function share() {
    const url = `${window.location.origin}/tests/${test.id}/result/${result.id}`;
    const text = `나의 ${test.title} 결과는 '${result.name}' ${result.emoji} ${result.summary}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: `${test.title} · 온기`, text, url });
        return;
      } catch (error) {
        // 공유 창을 닫은 것이면 그대로 두고, 그 밖의 실패는 링크 복사로 넘어간다
        if (error instanceof DOMException && error.name === 'AbortError') return;
      }
    }
    try {
      await navigator.clipboard.writeText(`${text}\n${url}`);
      showToast('링크를 복사했어요');
    } catch {
      showToast('복사하지 못했어요. 주소창의 링크를 복사해 주세요.');
    }
  }

  return (
    <>
      <AppBar title={test.title} backHref="/tests" />
      <div className="space-y-7 px-5 pb-12">
        <section aria-labelledby="result-name" className="rounded-3xl px-6 pt-5 pb-7 text-center" style={{ background: result.tint }}>
          {mine && <p className="text-xs font-semibold text-brown-600">나의 결과 · {formatShortDate(mine.at)}</p>}
          <Mascot stage={result.stage} size="lg" animated={false} decorative className="mx-auto" />
          <h2 id="result-name" className="text-2xl font-bold text-ink-900">
            <span aria-hidden>{result.emoji}</span> {result.name}
          </h2>
          <p className="mt-1.5 text-[15px] text-ink-600">{result.summary}</p>
        </section>

        <div className="grid grid-cols-2 gap-2">
          <Button onClick={share} aria-label="결과 공유하기">
            공유하기
          </Button>
          <Link href={`/tests/${test.id}`} className={buttonClass('secondary')}>
            {mine ? '다시 하기' : '나도 해보기'}
          </Link>
        </div>

        <section>
          <SectionTitle>이런 편이에요</SectionTitle>
          <p className="text-[15px] leading-relaxed text-ink-600">{result.description}</p>
        </section>

        <section>
          <SectionTitle>이럴 땐 이렇게</SectionTitle>
          <ul className="space-y-2">
            {result.tips.map((tip) => (
              <li key={tip} className="rounded-2xl bg-surface px-4 py-3 text-[15px] text-ink-900">
                {tip}
              </li>
            ))}
          </ul>
        </section>

        {result.needsHelp && <HelplineCard />}

        <section className="rounded-2xl border border-line bg-surface p-4">
          <SectionTitle>마음 돌아보기</SectionTitle>
          <p className="text-[15px] leading-relaxed text-ink-900">{result.reflection}</p>
          <Link href="/chat" className={cn(buttonClass('secondary', 'md', true), 'mt-3')}>
            {birdName}에게 이야기하기
          </Link>
        </section>

        <BridgeCard />

        <Link href="/tests" className={buttonClass('ghost', 'md', true)}>
          다른 테스트 보기
        </Link>

        <footer className="space-y-1 text-xs leading-relaxed text-ink-400">
          <p>이 결과는 진단이 아니라 나를 돌아보기 위한 참고용이에요.</p>
          <p>
            원작: {test.source.name} — {test.source.citation}
          </p>
          <p>{test.source.note}</p>
        </footer>
      </div>
      <Toast message={toast} />
    </>
  );
}
