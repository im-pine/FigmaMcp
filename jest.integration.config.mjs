import nextJest from "next/jest.js";

/*
 * 통합 테스트 (서버 코드 + 테스트 DB).
 * Prisma가 생성한 클라이언트가 import.meta.url을 써서 CommonJS로 변환하면 불러올 수 없다.
 * 그래서 이 설정만 ESM으로 실행한다 (NODE_OPTIONS=--experimental-vm-modules, .ts를 ESM으로 취급).
 */
const createJestConfig = nextJest({ dir: "./" });

export default createJestConfig({
  displayName: "integration",
  testEnvironment: "node",
  testMatch: ["<rootDir>/tests/integration/**/*.test.ts"],
  extensionsToTreatAsEsm: [".ts", ".tsx"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
    "^server-only$": "<rootDir>/tests/mocks/empty.ts",
  },
  globalSetup: "<rootDir>/tests/integration/global-setup.mjs",
  setupFiles: ["<rootDir>/tests/integration/load-env.ts"],
});
