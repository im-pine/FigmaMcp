import { defineConfig } from "@playwright/test";
import { config } from "dotenv";

/*
 * E2E 테스트 — 실제 브라우저로 핵심 흐름을 확인한다.
 * 테스트 전용 DB(.env.test)를 비우고 시드한 뒤, 프로덕션 빌드를 포트 3800에서 띄운다.
 */
config({ path: ".env.test", quiet: true });
const DATABASE_URL = process.env.DATABASE_URL ?? "";
if (!DATABASE_URL.includes("_test")) {
  throw new Error("E2E는 테스트 전용 DB(이름에 _test)에서만 실행합니다. .env.test를 확인하세요.");
}

const PORT = 3800;

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: false,
  workers: 1, // 같은 DB를 쓰므로 순서대로
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: "retain-on-failure",
  },
  projects: [
    { name: "desktop", testIgnore: /mobile\.spec\.ts/, use: { viewport: { width: 1440, height: 900 } } },
    {
      name: "mobile",
      testMatch: /mobile\.spec\.ts/,
      use: { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true },
    },
  ],
  webServer: {
    command: `node tests/e2e/prepare-db.mjs && pnpm build && pnpm start -p ${PORT}`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: false,
    timeout: 300_000,
    env: { DATABASE_URL },
  },
});
