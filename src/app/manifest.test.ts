import manifest from './manifest';

describe('웹 앱 매니페스트', () => {
  it('홈 화면에 추가하면 앱처럼(standalone) 온기로 열린다', () => {
    const m = manifest();
    expect(m.short_name).toBe('온기');
    expect(m.start_url).toBe('/');
    expect(m.display).toBe('standalone');
    expect(m.theme_color).toBe('#FDFAF5');
    expect(m.background_color).toBe('#FDFAF5');
  });

  it('192·512 아이콘과 마스커블 아이콘이 있다', () => {
    const icons = manifest().icons ?? [];
    expect(icons.map((i) => i.sizes)).toEqual(expect.arrayContaining(['192x192', '512x512']));
    expect(icons.some((i) => i.purpose === 'maskable')).toBe(true);
  });
});
