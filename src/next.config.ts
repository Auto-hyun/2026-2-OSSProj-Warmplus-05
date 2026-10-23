import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  // 개발 모드 표시 아이콘이 하단 탭 바를 가려서 끈다 (오류 표시는 그대로 나온다)
  devIndicators: false,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  async headers() {
    return [
      {
        // 기본 보안 헤더: MIME 추측 금지, 다른 사이트로 주소 전체를 넘기지 않기, 다른 사이트 안에 끼워 넣기 금지
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "DENY" },
        ],
      },
    ];
  },
  experimental: {
    // 아이콘 패키지는 기본 최적화 목록에 없어서, 쓰는 아이콘만 불러오도록 지정
    optimizePackageImports: ["@phosphor-icons/react"],
  },
};

export default nextConfig;
