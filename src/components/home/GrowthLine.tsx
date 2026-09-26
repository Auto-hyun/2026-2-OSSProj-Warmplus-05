import Link from 'next/link';
import { CaretRightIcon } from '@phosphor-icons/react/ssr';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { josa } from '@/lib/josa';
import { nextStageInfo } from '@/lib/progress';
import { DEFAULT_BIRD_NAME } from '@/lib/storage/adapters';

/** 다음 성장까지 남은 미션 수 (누르면 미션 탭) */
export function GrowthLine({ count, name = DEFAULT_BIRD_NAME }: { count: number; name?: string }) {
  const info = nextStageInfo(count);
  const text = info.next ? `다음 성장까지 미션 ${info.remaining}개` : `${josa(name, '이/가')} 다 자랐어요!`;
  return (
    <Link href="/mission" className="block w-full max-w-[280px] rounded-2xl px-3 py-2 active:bg-black/[0.03]">
      <span className="flex items-center justify-between text-[13px] text-ink-600">
        <span>{text}</span>
        <CaretRightIcon size={14} aria-hidden />
      </span>
      <span className="mt-1.5 block">
        <ProgressBar value={info.ratio} label="다음 성장까지 진행률" />
      </span>
    </Link>
  );
}
