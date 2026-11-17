import { memoryBlock } from './claude';

describe('오목이 기억 (모델에 넘기는 사용자 기록)', () => {
  it('닉네임·만든 노래·오늘의 오하아사를 넘긴다', () => {
    const block = memoryBlock({
      note: null,
      nickname: '동글이',
      moods: [],
      tests: [],
      answers: [],
      songs: ['2026-11-17 노래 만들기 (감정: 슬픔) · 저장 안 함'],
      fortune: '물병자리 3위(좋은 날)',
      messages: [],
    });
    expect(block).toContain('닉네임: 동글이');
    expect(block).toContain('최근 만든 노래: 2026-11-17 노래 만들기 (감정: 슬픔) · 저장 안 함');
    expect(block).toContain('오늘의 오하아사: 물병자리 3위(좋은 날)');
  });

  it('오늘 날짜를 넘겨서 기록이 언제였는지(오늘·어제) 맞게 말할 수 있다', () => {
    const block = memoryBlock({ note: null, nickname: null, moods: ['2026-11-18 비(슬픔)'], tests: [], answers: [], songs: [], fortune: null, messages: [] }, '2026-11-18');
    expect(block).toContain('오늘: 2026-11-18 (11월 18일 수요일)');
  });

  it('기록이 없으면 없다고 넘긴다', () => {
    const block = memoryBlock({ note: null, nickname: null, moods: [], tests: [], answers: [], songs: [], fortune: null, messages: [] });
    expect(block).toContain('닉네임: 모름');
    expect(block).toContain('최근 만든 노래: 없음');
    expect(block).toContain('오늘의 오하아사: 없음');
  });
});
