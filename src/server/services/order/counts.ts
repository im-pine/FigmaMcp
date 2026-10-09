import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import type { OrderStatus } from "@/generated/prisma/enums";
import { db } from "@/server/db";

/*
 * 관리자 주문 상태별 건수 — 상태 필터 칩 · 모바일 접수 탭 배지에 쓴다.
 * 주문이 생기거나 상태가 바뀌면 updateTag('orders')로 갱신한다.
 */
export async function getOrderStatusCounts(): Promise<Record<OrderStatus, number> & { ALL: number }> {
  "use cache";
  cacheLife("minutes");
  cacheTag("orders");

  const rows = await db.order.groupBy({ by: ["status"], _count: { _all: true } });
  const counts = { ALL: 0, RECEIVED: 0, PREPARING: 0, SHIPPING: 0, DELIVERED: 0, CANCELED: 0 };
  for (const row of rows) {
    counts[row.status] = row._count._all;
    counts.ALL += row._count._all;
  }
  return counts;
}
