import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { todayKey } from '@/lib/date';
import { FortuneNote } from './FortuneNote';

const note = () => screen.getByRole('button', { name: '오늘의 오하아사 쪽지 열기' });

describe('오하아사 쪽지', () => {
  beforeEach(() => localStorage.clear());

  it('오늘 아직 안 열었으면 쪽지가 살랑인다', () => {
    render(<FortuneNote />);
    expect(note().className).toContain('note-wiggle');
  });

  it('오늘 이미 열었으면 가만히 있다', () => {
    localStorage.setItem('fortune-note-seen', todayKey());
    render(<FortuneNote />);
    expect(note().className).not.toContain('note-wiggle');
  });

  it('열면 오늘 본 것으로 저장하고 살랑임을 멈춘다', async () => {
    render(<FortuneNote />);
    await userEvent.click(note());
    expect(localStorage.getItem('fortune-note-seen')).toBe(todayKey());
    expect(note().className).not.toContain('note-wiggle');
  });
});
