// @vitest-environment node
import nextConfig from '../next.config';

describe('next.config 헤더', () => {
  it('모든 경로에 기본 보안 헤더를 붙인다', async () => {
    const rules = await nextConfig.headers!();
    const all = rules.find((rule) => rule.source === '/:path*');
    expect(all?.headers).toEqual(
      expect.arrayContaining([
        { key: 'X-Content-Type-Options', value: 'nosniff' },
        { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        { key: 'X-Frame-Options', value: 'DENY' },
      ]),
    );
  });
});
