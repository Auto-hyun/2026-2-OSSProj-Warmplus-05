import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 개발 모드 표시 아이콘이 하단 탭 바를 가려서 끈다 (오류 표시는 그대로 나온다)
  devIndicators: false,
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
      {
        // 서비스 워커는 항상 최신 파일을 받도록 (Next.js PWA 가이드 권장 헤더)
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
