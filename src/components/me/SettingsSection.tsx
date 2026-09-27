'use client';

import { useState } from 'react';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';

type Props = {
  version: string;
  onReset: () => void;
  /** 버전 정보 탭 (5번 연속이면 시연 모드) */
  onVersionTap: () => void;
};

export function SettingsSection({ version, onReset, onVersionTap }: Props) {
  const [confirming, setConfirming] = useState(false);

  return (
    <section aria-label="설정">
      <ul className="divide-y divide-line overflow-hidden rounded-2xl bg-surface">
        <li>
          <button type="button" onClick={() => setConfirming(true)} className="w-full px-4 py-3.5 text-left text-[15px] text-ink-900 active:bg-black/[0.02]">
            기록 모두 지우기
          </button>
        </li>
        <li className="flex items-center justify-between px-4 py-3.5">
          <span className="text-[15px] text-ink-900">앱 정보</span>
          <button type="button" onClick={onVersionTap} className="-mr-2 min-h-11 px-2 text-sm text-ink-400 select-none">
            v{version}
          </button>
        </li>
      </ul>
      <p className="mt-4 text-center text-xs leading-relaxed text-ink-400">
        사단법인 온기 × 동국대학교 오픈소스SW프로젝트 Warm+
      </p>

      <ConfirmDialog
        open={confirming}
        title="기록을 모두 지울까요?"
        description="미션·대화·오목이 성장 기록이 모두 사라지고 되돌릴 수 없어요."
        confirmLabel="모두 지우기"
        onCancel={() => setConfirming(false)}
        onConfirm={() => {
          setConfirming(false);
          onReset();
        }}
      />
    </section>
  );
}
