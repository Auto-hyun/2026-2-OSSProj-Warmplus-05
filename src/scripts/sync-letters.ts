/**
 * 온기레터 목록 동기화: 스티비 공개 아카이브 JSON → data/letters.json
 * 사용: npm run sync:letters
 * - 기존 레터의 카테고리·그림은 유지한다
 * - 새 레터는 'uncategorized'로 들어가므로, 출력된 목록을 보고 category를 채워 주세요
 * - 받은 목록이 비었거나 형식이 다르거나 크게 줄었으면 저장하지 않는다
 *   (원본에서 정말 많이 지워진 경우에만 npm run sync:letters -- --force)
 */
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { LINKS } from '../data/links';
import { checkArchive, mergeLetters, type Letter } from '../lib/letters';

const OUT = resolve(process.cwd(), 'data/letters.json');
const TIMEOUT_MS = 20_000;

async function main() {
  const force = process.argv.includes('--force');
  const res = await fetch(LINKS.archiveApi, {
    headers: { Accept: 'application/json' },
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  if (!res.ok) throw new Error(`스티비 응답 오류: HTTP ${res.status}`);
  const existing: Letter[] = existsSync(OUT) ? JSON.parse(readFileSync(OUT, 'utf8')) : [];

  const checked = checkArchive(await res.json(), force ? 0 : existing.length);
  if (!checked.ok) throw new Error(`저장하지 않았어요: ${checked.reason}`);

  const { letters, added, removed } = mergeLetters(existing, checked.emails);
  writeFileSync(OUT, `${JSON.stringify(letters, null, 2)}\n`);

  console.log(`온기레터 ${letters.length}편 저장 (새로 추가 ${added.length}편, 원본에서 빠져 삭제 ${removed.length}편)`);
  const uncategorized = letters.filter((l) => l.category === 'uncategorized');
  if (uncategorized.length > 0) {
    console.log(`\n카테고리를 정해야 하는 레터 ${uncategorized.length}편 (data/letters.json의 category를 채워 주세요):`);
    for (const l of uncategorized) console.log(`  - id ${l.id} | ${l.title}`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
