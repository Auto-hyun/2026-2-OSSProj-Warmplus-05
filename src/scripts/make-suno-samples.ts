/**
 * 샘플 곡 모드에서 들려주는 임시 음원(public/samples)을 진짜 Suno 곡으로 바꾼다.
 * 감정 갈래 4개마다 한 번씩 작곡을 맡겨(크레딧이 든다) 나온 2곡을 {갈래}-1.mp3, {갈래}-2.mp3로 저장한다.
 *
 * 실행: npm run samples:suno   (.env.local의 SUNO_API_KEY를 쓴다)
 */
import { writeFile } from 'node:fs/promises';
import { BASE_STYLE, FAMILIES, type MoodFamily } from '@/data/music';
import { createSunoTask, getSunoTask } from '@/lib/music/suno';

const POLL_MS = 10_000;
const GIVE_UP_MS = 10 * 60_000;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function makeSamples(family: MoodFamily, apiKey: string) {
  const info = FAMILIES[family];
  // 콜백은 쓰지 않고 직접 확인하지만, sunoapi.org가 주소를 꼭 받아서 아무 주소나 넣는다
  const taskId = await createSunoTask({ title: `오목이 샘플 · ${info.label}`, style: `${BASE_STYLE}, ${info.style}`, family }, apiKey, 'https://example.com/suno-callback');
  console.log(`${info.label}: 작곡을 맡겼어요 (${taskId})`);

  const started = Date.now();
  while (Date.now() - started < GIVE_UP_MS) {
    await sleep(POLL_MS);
    const status = await getSunoTask(taskId, apiKey);
    if (status.state === 'composing') continue;
    if (status.state === 'failed') throw new Error(`${info.label}: ${status.reason}`);
    for (const [i, track] of status.tracks.slice(0, 2).entries()) {
      const res = await fetch(track.audioUrl);
      if (!res.ok) throw new Error(`${info.label}: 곡 파일을 받지 못했어요 (${res.status})`);
      await writeFile(`public/samples/${family}-${i + 1}.mp3`, Buffer.from(await res.arrayBuffer()));
    }
    console.log(`${info.label}: public/samples/${family}-1.mp3, ${family}-2.mp3 저장`);
    return;
  }
  throw new Error(`${info.label}: 10분이 넘게 걸려서 멈췄어요`);
}

async function main() {
  const apiKey = process.env.SUNO_API_KEY;
  if (!apiKey) throw new Error('.env.local에 SUNO_API_KEY를 넣어 주세요.');
  for (const family of Object.keys(FAMILIES) as MoodFamily[]) await makeSamples(family, apiKey);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
