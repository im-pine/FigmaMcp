import type { PrismaClient } from "../../src/generated/prisma/client";

/** 저장된 판매수와 주문(OrderItem)으로 다시 센 값을 비교한다. fix=true면 어긋난 상품을 바로잡는다. */
export async function recountSales(db: PrismaClient, fix: boolean) {
  const rows = await db.$queryRaw<{ id: number; slug: string; stored: number; actual: number }[]>`
    SELECT p."id", p."slug", p."salesCount" AS stored, COALESCE(s.qty, 0)::int AS actual
    FROM "Product" p
    LEFT JOIN (
      SELECT oi."productId", SUM(oi."quantity") AS qty
      FROM "OrderItem" oi
      JOIN "Order" o ON o."id" = oi."orderId"
      WHERE o."status" <> 'CANCELED' AND oi."productId" IS NOT NULL
      GROUP BY oi."productId"
    ) s ON s."productId" = p."id"
    ORDER BY p."id"`;

  const diff = rows.filter((r) => r.stored !== r.actual);
  if (fix) {
    for (const r of diff) {
      await db.$executeRaw`UPDATE "Product" SET "salesCount" = ${r.actual} WHERE "id" = ${r.id}`;
    }
  }
  return { total: rows.length, diff };
}
