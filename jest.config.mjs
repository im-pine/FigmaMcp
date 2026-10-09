import nextJest from "next/jest.js";

/*
 * 단위 테스트 (DB 없이). 함수 · store는 node, 컴포넌트는 파일 맨 위 `@jest-environment jsdom`로 브라우저 환경.
 * Next.js 공식 설정(next/jest): SWC 변환, next.config · .env 로드, CSS · 이미지 import 처리.
 * 통합 테스트는 jest.integration.config.mjs (테스트 DB · ESM).
 */
const createJestConfig = nextJest({ dir: "./" });

export default createJestConfig({
  displayName: "unit",
  testEnvironment: "node",
  testMatch: ["<rootDir>/tests/unit/**/*.test.{ts,tsx}"],
  setupFilesAfterEnv: ["<rootDir>/tests/unit/setup.ts"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
    "^server-only$": "<rootDir>/tests/mocks/empty.ts",
  },
});
