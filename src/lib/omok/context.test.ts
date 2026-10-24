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

  it('대화를 지우면 메모도 지워진다', () => {
    const store = createStore(createMemoryAdapter());
    store.addChatMessage({ role: 'user', text: '안녕' });
    store.setOmokNote({ summary: 'x', messageCount: 1 });
    store.clearChat();
    expect(store.getState().chat).toEqual({ messages: [], note: null });
  });
});
