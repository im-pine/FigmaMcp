// E2E 시작 전: 테스트 전용 DB를 비우고 마이그레이션 · 시드를 다시 적용한다 (개발 DB는 건드리지 않음)
import { execSync } from "node:child_process";
import { config } from "dotenv";

config({ path: ".env.test", override: true, quiet: true });
const url = process.env.DATABASE_URL ?? "";
if (!url.includes("_test"))
  throw new Error("테스트 전용 DB(이름에 _test)가 아닙니다. .env.test를 확인하세요.");

const env = { ...process.env, DATABASE_URL: url, PRISMA_USER_CONSENT_FOR_DANGEROUS_AI_ACTION: "yes" };
execSync("pnpm exec prisma migrate reset --force", { stdio: "inherit", env });
execSync("pnpm db:seed", { stdio: "inherit", env });
