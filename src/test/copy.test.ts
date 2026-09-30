// @vitest-environment node
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

/** 폴더 안의 소스 파일 (테스트 파일 제외) */
function sourceFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return sourceFiles(path);
    return /\.tsx?$/.test(name) && !/\.test\.tsx?$/.test(name) ? [path] : [];
  });
}

describe('앱 문구', () => {
  it("'털어놓기' 대신 '내 생각 얘기하기' 말투를 쓴다", () => {
    const offenders = ['app', 'components', 'data', 'lib'].flatMap(sourceFiles).filter((file) => /털어놓|털어놔/.test(readFileSync(file, 'utf8')));
    expect(offenders).toEqual([]);
  });
});
