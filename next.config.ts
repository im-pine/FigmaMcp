import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  // /admin은 보여 줄 화면 없이 상품 목록으로만 보낸다. 페이지 안에서 redirect()를 던지면
  // 개발 모드의 instant 이동 검증이 실패해 서버 로그에 에러가 남으므로, 렌더링 전에 설정으로 이동시킨다.
  async redirects() {
    return [
      { source: "/admin", destination: "/admin/products", permanent: false },
      // 예전 상품 목록 주소 → 새 주소 (검색어가 있으면 검색 결과, 카테고리만 있으면 카테고리 경로). 나머지 주소 값은 그대로 넘어간다
      {
        source: "/products",
        has: [{ type: "query", key: "q" }],
        destination: "/products/search",
        permanent: true,
      },
      {
        source: "/products",
        has: [{ type: "query", key: "category", value: "(?<category>bread|cake|cookie|beverage)" }],
        destination: "/products/category/:category",
        permanent: true,
      },
    ];
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
