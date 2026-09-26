import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ArrowSquareOutIcon } from '@phosphor-icons/react/ssr';
import { AppBar } from '@/components/layout/AppBar';
import { MobileShell } from '@/components/layout/MobileShell';
import lettersData from '@/data/letters.json';
import type { Letter } from '@/lib/letters';

const LETTERS = lettersData as Letter[];

function findLetter(id: string): Letter | undefined {
  return LETTERS.find((letter) => String(letter.id) === id);
}

// 목록에 있는 레터만 미리 만들고, 그 밖의 id는 404
export const dynamicParams = false;

export function generateStaticParams() {
  return LETTERS.map((letter) => ({ id: String(letter.id) }));
}

export async function generateMetadata({ params }: PageProps<'/letters/[id]'>): Promise<Metadata> {
  const { id } = await params;
  const letter = findLetter(id);
  return { title: letter ? `${letter.title} · 온기레터` : '온기레터' };
}

/** 레터 상세: 스티비 원문을 앱 안에서 그대로 보여준다 (스티비 공유 페이지는 iframe 허용 — 2026-09-26 확인) */
export default async function LetterPage({ params }: PageProps<'/letters/[id]'>) {
  const { id } = await params;
  const letter = findLetter(id);
  if (!letter) notFound();

  return (
    <MobileShell>
      <div className="flex h-dvh flex-col">
        <AppBar
          title="온기레터"
          backHref="/letters"
          right={
            <a
              href={letter.link}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="새 창에서 열기"
              className="grid size-11 place-items-center rounded-full text-ink-900 active:bg-black/5"
            >
              <ArrowSquareOutIcon size={22} aria-hidden />
            </a>
          }
        />
        <iframe src={letter.link} title={letter.title} className="w-full flex-1 border-0 bg-white" />
      </div>
    </MobileShell>
  );
}
