// 테스트 시작 전 한 번: 테스트 DB를 비우고 마이그레이션을 처음부터 적용한다.
import { execSync } from "node:child_process";
import { config } from "dotenv";

export default function globalSetup() {
  config({ path: ".env.test", override: true, quiet: true });
  const url = process.env.DATABASE_URL ?? "";
  if (!url.includes("_test"))
    throw new Error("테스트 전용 DB(이름에 _test)가 아닙니다. .env.test를 확인하세요.");
  execSync("pnpm exec prisma migrate reset --force", {
    stdio: "pipe",
    env: { ...process.env, DATABASE_URL: url, PRISMA_USER_CONSENT_FOR_DANGEROUS_AI_ACTION: "yes" },
  });
}
