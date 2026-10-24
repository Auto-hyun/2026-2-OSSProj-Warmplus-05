'use client';

import Link from 'next/link';
import {
  CloudFogIcon,
  CloudIcon,
  CloudLightningIcon,
  CloudRainIcon,
  CloudSunIcon,
  QuestionIcon,
  SunIcon,
  WindIcon,
  type Icon,
} from '@phosphor-icons/react';
import { getMood, type MoodId } from '@/data/moods';
import { todayKey } from '@/lib/date';
import { useApp } from '@/lib/storage/useApp';

/** 마음 날씨별 아이콘 (Figma 공통 컴포넌트의 선 아이콘) */
const WEATHER_ICONS: Record<MoodId, Icon> = {
  joy: SunIcon,
  flutter: CloudSunIcon,
  calm: CloudIcon,
  tired: CloudFogIcon,
  sad: CloudRainIcon,
  anxious: WindIcon,
  angry: CloudLightningIcon,
};

/** 홈 위 한 줄 카드: 오늘의 마음날씨. 아직이면 테스트(/today) 입구, 했으면 오늘 날씨 + 다시 고르기 */
export function DailyMoodQuiz() {
  const day = useApp(() => todayKey());
  const today = useApp((s) => s.moods.find((m) => m.day === todayKey()));
  if (!day) return <div className="h-[52px]" />;

  const mood = today && getMood(today.mood);
  const WeatherIcon = today ? WEATHER_ICONS[today.mood] : QuestionIcon;

  return (
    <Link
      href="/today"
      aria-label={mood ? `오늘의 마음날씨 ${mood.label}, 다시 고르기` : '오늘의 마음날씨 테스트 하기'}
      className="flex h-[52px] items-center gap-2.5 rounded-full border border-cream-line bg-cream/95 pr-4 pl-3 shadow-[0_6px_18px_rgba(75,46,32,0.12)] transition-transform active:scale-[0.98]"
    >
      <WeatherIcon size={30} weight="light" className="shrink-0 text-leaf-600" aria-hidden />
      <span className="min-w-0 flex-1 leading-tight">
        <span className="block text-[11px] text-taupe-500">오늘의 마음날씨</span>
        <span className="block truncate text-[15px] font-bold text-cocoa-900">{mood ? mood.label : '3문항으로 구슬 만들기'}</span>
      </span>
      <span className="shrink-0 border-l border-cream-line pl-3 text-[13px] whitespace-nowrap text-taupe-500">{mood ? '다시 고르기 ›' : '시작 ›'}</span>
    </Link>
  );
}
