import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 개발 모드 표시 아이콘이 하단 탭 바를 가려서 끈다 (오류 표시는 그대로 나온다)
  devIndicators: false,
  // 서비스 워커는 항상 최신 파일을 받도록 (Next.js PWA 가이드 권장 헤더)
  async headers() {
    return [
      {
        source: "/sw.js",
        headers: [
          { key: "Content-Type", value: "application/javascript; charset=utf-8" },
          { key: "Cache-Control", value: "no-cache, no-store, must-revalidate" },
          { key: "Content-Security-Policy", value: "default-src 'self'; script-src 'self'" },
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
