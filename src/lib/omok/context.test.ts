import { createMemoryAdapter } from '@/lib/storage/adapters';
import { createStore } from '@/lib/storage/store';
import { buildChatContext } from './context';

describe('오목이 대화 맥락', () => {
  it('메모·최근 기분·최근 대화를 담는다', () => {
    const store = createStore(createMemoryAdapter(), () => new Date('2026-10-18T10:00:00Z'));
    store.recordMood('sad', { note: '시험 망침' });
    store.addChatMessage({ role: 'user', text: '안녕' });
    store.addChatMessage({ role: 'omok', text: '안녕!' });
    store.setOmokNote({ summary: '시험 기간이라 힘들어함', messageCount: 2 });

    expect(buildChatContext(store.getState())).toEqual({
      note: '시험 기간이라 힘들어함',
      moods: ['2026-10-18 비(슬픔) 메모: 시험 망침'],
      tests: [],
      messages: [
        { role: 'user', text: '안녕' },
        { role: 'omok', text: '안녕!' },
      ],
    });
  });

  it('대화를 지워도 오목이 메모(기억)는 남는다', () => {
    const store = createStore(createMemoryAdapter());
    store.addChatMessage({ role: 'user', text: '안녕' });
    store.setOmokNote({ summary: '인사를 잘 함', messageCount: 1 });
    store.clearChat();
    expect(store.getState().chat.messages).toEqual([]);
    expect(store.getState().chat.note).toMatchObject({ summary: '인사를 잘 함', messageCount: 0 });
  });

  it('기억까지 지우기', () => {
    const store = createStore(createMemoryAdapter());
    store.addChatMessage({ role: 'user', text: '안녕' });
    store.setOmokNote({ summary: 'x', messageCount: 1 });
    store.forgetOmok();
    expect(store.getState().chat).toEqual({ messages: [], note: null });
  });
});
