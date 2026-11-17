import { existsSync, readdirSync } from 'node:fs';
import { isMoodId } from '@/data/moods';
import { SAMPLE_SONGS } from '@/data/samples';
import { getWord, WORDS } from '@/data/words';
import { createSampleTask, getSampleTask, isSampleTaskId, ownedSampleFiles, pickSampleSongs, SAMPLE_DELAY_MS, sampleCandidates } from './sample';

/** 곡 파일이 어떤 감정(7가지)의 곡인지 */
const moodOf = (file: string) => getWord(SAMPLE_SONGS.find((s) => s.file === file)!.word)!.mood;

describe('샘플 곡 목록 (data/samples.ts)', () => {
  it('감정 단어마다 7가지 감정 중 하나가 붙어 있다', () => {
    for (const word of WORDS) expect(isMoodId(word.mood), word.label).toBe(true);
  });

  it('목록의 곡은 모두 public/samples에 있고, 목록에 없는 곡 파일은 없다', () => {
    const listed = new Set([...SAMPLE_SONGS.map((s) => s.file), 'unease-1', 'unease-2']);
    expect(listed.size, '같은 파일이 두 번 적혀 있다').toBe(SAMPLE_SONGS.length + 2);
    for (const file of listed) expect(existsSync(`public/samples/${file}.mp3`), file).toBe(true);
    const onDisk = readdirSync('public/samples')
      .filter((f) => f.endsWith('.mp3'))
      .map((f) => f.replace(/\.mp3$/, ''));
    expect(onDisk.filter((f) => !listed.has(f))).toEqual([]);
  });

  it('곡마다 알려진 감정 단어로 만든 곡이다', () => {
    for (const song of SAMPLE_SONGS) expect(getWord(song.word), song.file).toBeDefined();
  });

  it('감정마다 16곡씩 있다 (같은 감정을 고른 사람끼리 덜 겹치게)', () => {
    for (const mood of ['joy', 'flutter', 'calm', 'tired', 'sad', 'anxious', 'angry'] as const) {
      expect(SAMPLE_SONGS.filter((s) => getWord(s.word)!.mood === mood).length, mood).toBe(16);
    }
  });
});

describe('sampleCandidates (작곡 재료 → 곡 후보)', () => {
  it('감정 단어 하나: 그 단어가 속한 감정의 곡이 모두 후보', () => {
    const files = sampleCandidates({ kind: 'words', words: ['anger'] });
    expect(new Set(files.map(moodOf))).toEqual(new Set(['angry']));
    // 화남·짜증·답답함으로 만든 곡이 함께 후보 (지침 곡은 아님)
    expect(files).toEqual(expect.arrayContaining(['stress-3', 'stress-4', 'stress-5', 'stress-9']));
    expect(files).not.toContain('stress-11');
  });

  it('여러 감정을 섞어 고르면 가장 많이 고른 감정, 같으면 먼저 고른 단어의 감정', () => {
    expect(new Set(sampleCandidates({ kind: 'words', words: ['tired', 'anger', 'annoyed'] }).map(moodOf))).toEqual(new Set(['angry']));
    expect(new Set(sampleCandidates({ kind: 'words', words: ['sadness', 'happy'] }).map(moodOf))).toEqual(new Set(['sad']));
  });

  it('불안·스트레스·답답함을 (순서 상관없이) 고르면 전용 곡', () => {
    expect(sampleCandidates({ kind: 'words', words: ['stuffy', 'anxiety', 'stress'] })).toEqual(['unease-1', 'unease-2']);
  });

  it('심리테스트: 결과에 감정이 있으면 그 감정의 곡', () => {
    // 나의 마음 소리 유형 d = 흔들리는 바람 소리 (불안)
    expect(new Set(sampleCandidates({ kind: 'test', testId: 'mind-sound', resultId: 'd' }).map(moodOf))).toEqual(new Set(['anxious']));
  });

  it('심리테스트: 결과에 감정이 없으면 그 갈래의 곡', () => {
    // 나의 쉼 유형 a = 고요한 방 (잔잔한 마음 갈래, 감정 없음)
    const files = sampleCandidates({ kind: 'test', testId: 'my-rest', resultId: 'a' });
    expect(files.length).toBeGreaterThanOrEqual(2);
    expect(files.every((f) => f.startsWith('calm-'))).toBe(true);
  });

  it('모르는 재료면 후보가 없다', () => {
    expect(sampleCandidates({ kind: 'words', words: ['nope'] })).toEqual([]);
    expect(sampleCandidates({ kind: 'words', words: [] })).toEqual([]);
    expect(sampleCandidates({ kind: 'test', testId: 'nope', resultId: 'a' })).toEqual([]);
  });
});

describe('pickSampleSongs (후보에서 2곡 고르기)', () => {
  it('이미 가진 곡은 빼고 서로 다른 2곡을 고른다', () => {
    expect([...pickSampleSongs(['a', 'b', 'c', 'd'], new Set(['a', 'b']))].sort()).toEqual(['c', 'd']);
  });

  it('안 가진 곡이 모자라면 가진 곡도 다시 쓴다', () => {
    const picked = pickSampleSongs(['a', 'b', 'c'], new Set(['a', 'b']));
    expect(picked).toContain('c');
    expect(new Set(picked).size).toBe(2);
  });

  it('무작위라서 여러 번 고르면 후보가 골고루 나온다', () => {
    const files = Array.from({ length: 16 }, (_, i) => `x-${i + 1}`);
    const seen = new Set(Array.from({ length: 300 }, () => pickSampleSongs(files, new Set())).flat());
    expect(seen.size).toBe(16);
  });
});

describe('ownedSampleFiles (화면이 보낸 내 곡 주소 → 곡 파일)', () => {
  it('샘플 곡 주소만 파일 이름으로 바꾸고 나머지는 버린다', () => {
    expect(ownedSampleFiles(['/samples/sad-3.mp3', 'https://cdn.example.com/x.mp3', '/samples/../x.mp3', 3, '/samples/calm-11.mp3'])).toEqual(new Set(['sad-3', 'calm-11']));
    expect(ownedSampleFiles('sad-3')).toEqual(new Set());
  });
});

describe('샘플 작곡 작업', () => {
  const at = 1_800_000_000_000;

  it('몇 초 동안은 작곡 중이고, 그 뒤엔 고른 두 곡을 돌려준다', () => {
    const taskId = createSampleTask(['sad-3', 'calm-11'], at);
    expect(isSampleTaskId(taskId)).toBe(true);
    expect(getSampleTask(taskId, at + 1000)).toEqual({ state: 'composing' });
    expect(getSampleTask(taskId, at + SAMPLE_DELAY_MS)).toEqual({
      state: 'done',
      tracks: [
        { id: `${taskId}-1`, audioUrl: '/samples/sad-3.mp3', duration: null, temporary: false },
        { id: `${taskId}-2`, audioUrl: '/samples/calm-11.mp3', duration: null, temporary: false },
      ],
    });
  });

  it('목록에 없는 곡을 담은 작업 번호는 받지 않는다', () => {
    expect(isSampleTaskId(`sample-sad-99.calm-11-${at}`)).toBe(false);
    expect(isSampleTaskId(`sample-..%2Fx.calm-11-${at}`)).toBe(false);
    expect(getSampleTask(`sample-sad-99.calm-11-${at}`).state).toBe('failed');
  });
});
