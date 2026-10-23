'use client';

import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { toast } from '@/components/ui/Toast';

/** 곡은 파일 주소(url)로 구분한다: 내 노래 목록과 커뮤니티 글의 같은 노래는 같은 곡 */
export type PlayableTrack = { title: string; url: string };

type AudioState = {
  current: PlayableTrack | null;
  playing: boolean;
  /** 같은 곡이면 재생/일시정지, 다른 곡이면 바꿔서 재생 */
  toggle(track: PlayableTrack): void;
  stop(): void;
};

const AudioContext = createContext<AudioState | null>(null);

/** 앱 전체에서 소리는 한 곡만: 탭을 옮겨도 계속 들린다 */
export function AudioProvider({ children }: { children: ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [current, setCurrent] = useState<PlayableTrack | null>(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const audio = new Audio();
    audio.preload = 'none';
    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    const onError = () => {
      // src를 비울 때(stop)도 error가 나서, 재생할 곡이 있을 때만 알린다
      if (!audio.getAttribute('src')) return;
      setPlaying(false);
      toast('곡을 재생하지 못했어요. 곡 파일이 사라졌을 수 있어요.', { tone: 'error' });
    };
    audio.addEventListener('play', onPlay);
    audio.addEventListener('pause', onPause);
    audio.addEventListener('ended', onPause);
    audio.addEventListener('error', onError);
    audioRef.current = audio;
    return () => {
      audio.pause();
      audio.removeEventListener('play', onPlay);
      audio.removeEventListener('pause', onPause);
      audio.removeEventListener('ended', onPause);
      audio.removeEventListener('error', onError);
    };
  }, []);

  function play(audio: HTMLAudioElement) {
    // 브라우저가 막으면(자동 재생 제한 등) 재생 버튼을 다시 누를 수 있게 둔다
    audio.play().catch(() => setPlaying(false));
  }

  const value: AudioState = {
    current,
    playing,
    toggle(track) {
      const audio = audioRef.current;
      if (!audio) return;
      if (current?.url === track.url) {
        if (audio.paused) play(audio);
        else audio.pause();
        return;
      }
      audio.src = track.url;
      setCurrent(track);
      play(audio);
    },
    stop() {
      const audio = audioRef.current;
      if (!audio) return;
      audio.pause();
      audio.removeAttribute('src');
      audio.load();
      setCurrent(null);
    },
  };

  return <AudioContext.Provider value={value}>{children}</AudioContext.Provider>;
}

export function useAudio(): AudioState {
  const ctx = useContext(AudioContext);
  if (!ctx) throw new Error('AudioProvider 안에서 써야 해요.');
  return ctx;
}
