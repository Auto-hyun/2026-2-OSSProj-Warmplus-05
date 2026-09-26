import Image from 'next/image';
import { STAGES, type StageNo } from '@/data/stages';
import { cn } from '@/lib/cn';

/** 성장 앨범: 도달한 단계는 모습과 이름, 아직인 단계는 흐린 실루엣과 필요한 미션 수 */
export function GrowthAlbum({ reached }: { reached: StageNo }) {
  return (
    <ol className="grid grid-cols-5 gap-2">
      {STAGES.map((stage) => {
        const open = stage.no <= reached;
        return (
          <li key={stage.no} className="flex flex-col items-center">
            <div className={cn('grid aspect-square w-full place-items-center rounded-2xl', open ? 'bg-yellow-100' : 'bg-line/60')}>
              <Image
                src={stage.image}
                alt={open ? stage.name : ''}
                width={64}
                height={64}
                className={cn('size-[88%]', !open && 'opacity-25 blur-[1.5px] grayscale')}
              />
            </div>
            <span className={cn('mt-1.5 text-[11px] whitespace-nowrap', open ? 'font-semibold text-ink-900' : 'text-ink-400')}>
              {open ? stage.name.split(' ')[0] : `미션 ${stage.minMissions}개`}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
