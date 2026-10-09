import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import type { OrderStatus } from "@/generated/prisma/enums";
import { db } from "@/server/db";
import { maskAddress, maskName, maskPhone } from "@/shared/lib/mask";
import { applySalesDelta } from "./sales";

/*
 * 관리자 주문 — 목록 · 상세 조회(마스킹된 값만 돌려준다)와 상태 변경.
 * 조회는 'orders' 태그로 캐시하고, 상태가 바뀌면 Server Action이 updateTag('orders')로 갱신한다.
 */

/** hong@example.com → h***@example.com */
function maskEmail(email: string): string {
  const [local, domain] = email.split("@");
  if (!domain) return "***";
  return `${local.slice(0, 1)}***@${domain}`;
}

/** 관리자 주문 목록 (최신순). status가 없으면 전체 */
export async function getAdminOrders(status?: OrderStatus) {
  "use cache";
  cacheLife("minutes");
  cacheTag("orders");

  const orders = await db.order.findMany({
    where: status ? { status } : undefined,
    orderBy: { createdAt: "desc" },
    select: {
      orderNo: true,
      createdAt: true,
      ordererName: true,
      ordererPhone: true,
      address: true,
      total: true,
      status: true,
      items: { select: { productName: true }, orderBy: { id: "asc" } },
    },
  });

  return orders.map(({ items, ...o }) => ({
    orderNo: o.orderNo,
    createdAt: o.createdAt,
    ordererName: maskName(o.ordererName),
    ordererPhone: maskPhone(o.ordererPhone),
    address: maskAddress(o.address),
    total: o.total,
    status: o.status,
    // 상품 요약: 첫 상품명 + 외 N건 (좁은 칸에서 상품명만 줄이도록 나눠 둔다)
    firstItemName: items[0]?.productName ?? "",
    extraItemCount: Math.max(items.length - 1, 0),
  }));
}

export type AdminOrderRow = Awaited<ReturnType<typeof getAdminOrders>>[number];

/** 관리자 주문 상세. 없으면 null */
export async function getAdminOrder(orderNo: string) {
  "use cache";
  cacheLife("minutes");
  cacheTag("orders");

  const order = await db.order.findUnique({
    where: { orderNo },
    select: {
      orderNo: true,
      createdAt: true,
      status: true,
      ordererName: true,
      ordererPhone: true,
      ordererEmail: true,
      recipientName: true,
      recipientPhone: true,
      address: true,
      requestNote: true,
      paymentMethod: true,
      subtotal: true,
      shippingFee: true,
      total: true,
      items: {
        orderBy: { id: "asc" },
        select: {
          id: true,
          productName: true,
          unitPrice: true,
          quantity: true,
          giftWrap: true,
          lineTotal: true,
          product: { select: { imagePath: true } },
        },
      },
    },
  });
  if (!order) return null;

  return {
    ...order,
    ordererName: maskName(order.ordererName),
    ordererPhone: maskPhone(order.ordererPhone),
    ordererEmail: maskEmail(order.ordererEmail),
    recipientName: maskName(order.recipientName),
    recipientPhone: maskPhone(order.recipientPhone),
    address: maskAddress(order.address),
  };
}

export type AdminOrder = NonNullable<Awaited<ReturnType<typeof getAdminOrder>>>;

/**
 * 주문 상태 변경 (1건 · 일괄 공용). 한 트랜잭션에서 처리한다.
 * - 이미 목표 상태인 주문은 건너뛴다.
 * - 판매수: 취소로 바뀌면 -1, 취소에서 다른 상태로 돌아오면 +1 (sales.ts)
 * 바뀐 건수와 판매수 변경 여부를 돌려준다.
 */
export async function updateOrderStatuses(orderNos: string[], status: OrderStatus) {
  return db.$transaction(async (tx) => {
    const orders = await tx.order.findMany({
      where: { orderNo: { in: orderNos }, status: { not: status } },
      select: {
        id: true,
        status: true,
        items: { select: { productId: true, quantity: true } },
      },
    });
    if (orders.length === 0) return { updated: 0, salesChanged: false };

    // 읽은 상태 그대로일 때만 바꾼다. 다른 관리자가 같은 주문을 동시에 바꿨다면 건너뛰어
    // 판매수가 두 번 빠지거나 더해지지 않게 한다.
    const changed: typeof orders = [];
    for (const o of orders) {
      const { count } = await tx.order.updateMany({ where: { id: o.id, status: o.status }, data: { status } });
      if (count === 1) changed.push(o);
    }

    let salesChanged = false;
    if (status === "CANCELED") {
      // 취소로 바뀐 주문만큼 판매수를 뺀다
      const lines = changed.flatMap((o) => o.items);
      if (lines.length > 0) {
        await applySalesDelta(tx, lines, -1);
        salesChanged = true;
      }
    } else {
      // 취소에서 되살린 주문만큼 판매수를 다시 더한다
      const lines = changed.filter((o) => o.status === "CANCELED").flatMap((o) => o.items);
      if (lines.length > 0) {
        await applySalesDelta(tx, lines, 1);
        salesChanged = true;
      }
    }
    return { updated: changed.length, salesChanged };
  });
}
