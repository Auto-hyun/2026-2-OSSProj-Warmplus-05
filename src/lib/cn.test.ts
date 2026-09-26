import { cn } from './cn';

describe('cn', () => {
  it('참인 클래스만 공백으로 잇는다', () => {
    expect(cn('a', false, 'b', null, undefined, '', 'c')).toBe('a b c');
  });
});
