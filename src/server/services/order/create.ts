import "server-only";
import { Prisma, type Order, type OrderItem } from "@/generated/prisma/client";
import { db } from "@/server/db";
import { GIFT_WRAP_FEE, shippingFeeFor } from "@/shared/constants/catalog";
import { applySalesDelta } from "./sales";

/** 주문 생성 입력 — 검증(safeParse)은 Server Action에서 끝낸 값을 받는다. 가격 필드는 받지 않는다. */
export type CreateOrderInput = Pick<
  Order,
  | "ordererName"
  | "ordererPhone"
  | "ordererEmail"
  | "recipientName"
  | "recipientPhone"
  | "address"
  | "addressDetail"
  | "requestNote"
  | "paymentMethod"
> & {
  items: (Pick<OrderItem, "quantity" | "giftWrap"> & { productId: number })[];
};

export type CreateOrderResult =
  { ok: true; orderNo: string } | { ok: false; reason: "PRODUCT_NOT_FOUND" | "ORDER_NO_CONFLICT" };

const MAX_ORDER_NO_RETRY = 3;

/**
 * 주문 생성. 금액은 클라이언트 값을 쓰지 않고 상품 id로 DB 가격을 읽어 다시 계산한다.
 * Order와 OrderItem을 한 트랜잭션으로 만든다. 주문번호: YYYYMMDD-NNNN (한국 시간 기준 일자별 일련번호)
 */
export async function createOrder(input: CreateOrderInput): Promise<CreateOrderResult> {
  const { items, ...orderer } = input;
  const priced = await priceOrder(items);
  if (!priced) return { ok: false, reason: "PRODUCT_NOT_FOUND" };
  const { lines, subtotal, shippingFee, total } = priced;

  // 같은 날짜의 주문번호가 동시에 만들어지면 unique 충돌이 나므로 몇 번 다시 시도한다
  for (let attempt = 0; attempt < MAX_ORDER_NO_RETRY; attempt++) {
    try {
      const order = await db.$transaction(async (tx) => {
        const prefix = todayKst();
        const last = await tx.order.findFirst({
          where: { orderNo: { startsWith: `${prefix}-` } },
          orderBy: { orderNo: "desc" },
          select: { orderNo: true },
        });
        const seq = last ? Number(last.orderNo.slice(prefix.length + 1)) + 1 : 1;
        const created = await tx.order.create({
          data: {
            ...orderer,
            orderNo: `${prefix}-${String(seq).padStart(4, "0")}`,
            subtotal,
            shippingFee,
            total,
            items: { create: lines },
          },
          select: { orderNo: true },
        });
        // 인기순 정렬용 판매수 — 주문과 같은 트랜잭션에서 올린다
        await applySalesDelta(tx, lines, 1);
        return created;
      });
      return { ok: true, orderNo: order.orderNo };
    } catch (error) {
      const conflict = error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002";
      if (!conflict) throw error;
    }
  }
  return { ok: false, reason: "ORDER_NO_CONFLICT" };
}

/**
 * 상품 id로 DB 가격을 읽어 주문 금액을 계산한다. 없는 상품이 있으면 null.
 * 결제창의 금액 표시(견적)와 주문 생성이 같은 계산을 쓴다.
 */
export async function priceOrder(items: CreateOrderInput["items"]) {
  const productIds = [...new Set(items.map((i) => i.productId))];
  const products = await db.product.findMany({
    where: { id: { in: productIds } },
    select: { id: true, name: true, price: true },
  });
  const byId = new Map(products.map((p) => [p.id, p]));
  if (byId.size !== productIds.length) return null;

  const lines = items.map((item) => {
    const product = byId.get(item.productId)!;
    return {
      productId: product.id,
      productName: product.name,
      unitPrice: product.price,
      quantity: item.quantity,
      giftWrap: item.giftWrap,
      lineTotal: (product.price + (item.giftWrap ? GIFT_WRAP_FEE : 0)) * item.quantity,
    };
  });
  const subtotal = lines.reduce((sum, l) => sum + l.lineTotal, 0);
  const shippingFee = shippingFeeFor(subtotal);
  return { lines, subtotal, shippingFee, total: subtotal + shippingFee };
}

/** 주문 완료 화면용 요약 — 개인정보 없이 주문번호 · 상품명 · 금액만 읽는다 (캐시하지 않음) */
export async function getOrderCompletion(orderNo: string) {
  return db.order.findUnique({
    where: { orderNo },
    select: {
      orderNo: true,
      total: true,
      items: { select: { productName: true }, orderBy: { id: "asc" } },
    },
  });
}

/** 한국 시간 기준 오늘 날짜 YYYYMMDD */
function todayKst(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  })
    .format(new Date())
    .replaceAll("-", "");
}
