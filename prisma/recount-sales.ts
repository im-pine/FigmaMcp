import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { recountSales } from "./lib/recount";

// 사용: pnpm db:recount          → 어긋난 상품만 출력 (어긋나면 종료 코드 1)
//       pnpm db:recount --fix    → 어긋난 상품을 주문 기준으로 바로잡음
const fix = process.argv.includes("--fix");
const db = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });

recountSales(db, fix)
  .then(({ total, diff }) => {
    if (diff.length === 0) return console.log(`✓ ${total}개 상품의 판매수가 주문 기록과 일치합니다.`);
    for (const r of diff) console.log(`${r.slug}: 저장 ${r.stored} → 실제 ${r.actual}`);
    if (fix) console.log(`${diff.length}개 상품을 바로잡았습니다.`);
    else process.exitCode = 1;
  })
  .finally(() => db.$disconnect());
