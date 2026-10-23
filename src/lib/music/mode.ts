import type { MusicMode } from './types';

/** MUSIC_PROVIDER=suno이고 SUNO_API_KEY가 있을 때만 실제 작곡. 그 밖에는 샘플 곡 모드 (서버에서만) */
export function musicMode(): MusicMode {
  return process.env.MUSIC_PROVIDER === 'suno' && process.env.SUNO_API_KEY ? 'suno' : 'sample';
}
