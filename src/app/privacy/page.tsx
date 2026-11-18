import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { AppBar } from '@/components/layout/AppBar';
import { MobileShell } from '@/components/layout/MobileShell';

export const metadata: Metadata = { title: '개인정보 처리방침 · 온사이드 아웃' };

/** 무엇을 어디에 저장하는지 (코드가 실제로 하는 일과 맞춘다: docs/data.md) */
const STORED: { when: string; what: string; where: string }[] = [
  {
    when: '앱을 쓸 때 (로그인 없이)',
    what: '마음 기록(감정·메모), 만든 노래, 심리테스트 결과와 고른 답, 오목이 대화, 닉네임·생일',
    where: '지금 쓰는 브라우저에만 저장해요.',
  },
  {
    when: '커뮤니티에 글을 쓸 때',
    what: '닉네임, 글 내용, 함께 붙인 노래, 글쓴이를 구분하는 익명 계정 번호',
    where: '서버(Supabase)에 저장하고, 누구나 볼 수 있어요.',
  },
  {
    when: '카카오로 로그인할 때',
    what: '카카오 회원 번호, 닉네임, 프로필 사진·이메일(동의한 경우)과 내 마음 기록, 심리테스트 결과, 저장한 노래, 닉네임·생일',
    where: '서버(Supabase)의 내 계정에 저장하고, 나만 볼 수 있어요.',
  },
  {
    when: '앱을 쓰는 동안',
    what: '기기마다 만든 무작위 번호, 연 화면 주소, 쓴 기능(테스트 완료·노래 만들기·글쓰기 등)과 시각',
    where: '서버(Supabase)에 이용 통계로 저장해요. 이름이나 글 내용은 담지 않아요.',
  },
];

const PROCESSORS: { name: string; job: string; place: string }[] = [
  { name: 'Supabase', job: '커뮤니티 글, 계정 기록, 이용 통계 저장', place: '일본(도쿄)' },
  { name: 'Vercel', job: '웹 서비스 운영', place: '미국 등' },
  { name: 'Anthropic', job: '오목이 대화의 답 만들기 (Claude API)', place: '미국' },
  { name: '카카오', job: '카카오 로그인', place: '대한민국' },
];

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="space-y-2">
      <h2 className="text-[16px] font-bold text-cocoa-900">{title}</h2>
      <div className="space-y-2 text-[14px] leading-relaxed text-cocoa-900">{children}</div>
    </section>
  );
}

export default function PrivacyPage() {
  return (
    <MobileShell>
      <AppBar title="개인정보 처리방침" backHref="/me" />
      <article className="space-y-7 px-5 pb-16">
        <p className="text-[14px] leading-relaxed text-taupe-500">
          온사이드 아웃(웜플러스 팀)은 서비스를 운영하면서 아래 정보를 다뤄요. 시행일: 2026년 11월 18일
        </p>

        <Section title="1. 어떤 정보를 어디에 저장하나요">
          <ul className="space-y-2.5">
            {STORED.map((item) => (
              <li key={item.when} className="rounded-2xl border border-cream-line bg-surface px-4 py-3">
                <p className="font-bold">{item.when}</p>
                <p className="mt-1">{item.what}</p>
                <p className="mt-1 text-taupe-500">{item.where}</p>
              </li>
            ))}
          </ul>
        </Section>

        <Section title="2. 왜 쓰나요">
          <ul className="list-disc space-y-1 pl-5">
            <li>내 기록을 보여 주고, 카카오로 로그인하면 기기를 바꿔도 이어 주려고</li>
            <li>커뮤니티에서 글과 노래를 나누려고</li>
            <li>서비스가 얼마나, 어떻게 쓰이는지 보고 고쳐 나가려고 (이용 통계)</li>
          </ul>
        </Section>

        <Section title="3. 오목이와 대화할 때">
          <p>
            대화 내용은 이 기기에만 저장해요. 오목이가 답을 만들 때는 최근 대화와 일부 기록(닉네임, 최근 마음 기록, 심리테스트 결과와 고른 답, 만든 노래,
            오늘의 오하아사)을 Anthropic의 Claude API로 보내요.
          </p>
          <p>오목이는 마음을 나누는 친구이고, 전문 상담이나 치료를 대신하지 않아요. 많이 힘들 때는 자살예방 상담전화 109(24시간)에 연락해 주세요.</p>
        </Section>

        <Section title="4. 처리를 맡기는 곳">
          <ul className="space-y-2">
            {PROCESSORS.map((p) => (
              <li key={p.name} className="flex gap-3">
                <span className="w-20 shrink-0 font-bold">{p.name}</span>
                <span className="min-w-0 flex-1">
                  {p.job}
                  <span className="text-taupe-500"> · {p.place}</span>
                </span>
              </li>
            ))}
          </ul>
        </Section>

        <Section title="5. 얼마나 보관하나요">
          <ul className="list-disc space-y-1 pl-5">
            <li>계정 기록: &lsquo;내 기록 지우기&rsquo;를 하거나 탈퇴를 요청할 때까지</li>
            <li>커뮤니티 글: 직접 지울 때까지</li>
            <li>이용 통계: 서비스를 운영하는 동안 보관하고, 운영이 끝나면 지워요</li>
            <li>브라우저에 저장된 기록: 브라우저 데이터를 지우면 사라져요</li>
          </ul>
        </Section>

        <Section title="6. 내 정보 지우기">
          <ul className="list-disc space-y-1 pl-5">
            <li>마음 마을(지도) 오른쪽 위 &lsquo;내 정보&rsquo;의 &lsquo;내 기록 지우기&rsquo;로 계정 기록을 바로 지울 수 있어요.</li>
            <li>쓴 글은 홈 오른쪽 위 &lsquo;내 기록&rsquo;의 &lsquo;내가 쓴 글&rsquo;에서 하나씩 지울 수 있어요.</li>
            <li>카카오 계정 연결 끊기나 탈퇴는 아래로 문의해 주세요.</li>
          </ul>
        </Section>

        <Section title="7. 문의">
          <p>
            웜플러스 팀 ·{' '}
            <a
              href="https://github.com/CSID-DGU/2026-2-OSSProj-Warmplus-05/issues"
              target="_blank"
              rel="noreferrer"
              className="break-all text-leaf-600 underline underline-offset-2"
            >
              GitHub 이슈
            </a>
          </p>
        </Section>
      </article>
    </MobileShell>
  );
}
