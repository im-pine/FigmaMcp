import { afterAll, beforeEach, describe, expect, jest, test } from "@jest/globals";

// Server Action이 쓰는 next 모듈은 테스트에서 가짜로 바꾼다 (ESM이라 import 전에 등록)
const updateTag = jest.fn();
jest.unstable_mockModule("next/cache", () => ({ updateTag }));

const { db } = await import("@/server/db");
const { createOrder, priceOrder } = await import("@/server/services/order/create");
const { placeOrder } = await import("@/features/shop/checkout/actions");
const { resetDb, seedProducts, orderer } = await import("./helpers");

let products: Awaited<ReturnType<typeof seedProducts>>;

beforeEach(async () => {
  await resetDb();
  products = await seedProducts();
  updateTag.mockClear();
});

afterAll(async () => {
  await db.$disconnect();
});

// #test/필수 #test/금액 #test/통합
describe("주문 금액", () => {
  test("선물 포장은 1,000원×수량이 더해지고, 소계+배송비=합계다", async () => {
    const priced = await priceOrder([{ productId: products.croissant.id, quantity: 2, giftWrap: true }]);
    expect(priced).not.toBeNull();
    expect(priced!.subtotal).toBe((4500 + 1000) * 2);
    expect(priced!.shippingFee).toBe(3000);
    expect(priced!.total).toBe(priced!.subtotal + priced!.shippingFee);
  });

  test("가격 필드를 끼워 보내면 거부하고 주문이 저장되지 않는다", async () => {
    const result = await placeOrder({
      ...orderer,
      requestNote: "",
      total: 1,
      items: [{ productId: products.campagne.id, quantity: 4, giftWrap: false, unitPrice: 1 }],
    });
    expect(result).toHaveProperty("errors");
    expect(await db.order.count()).toBe(0);
  });

  test("금액은 보내지 않고 상품 id로 DB 가격을 읽어 합계를 저장한다", async () => {
    // 장바구니(localStorage)의 가격을 1원으로 바꿔도 서버로는 상품 id · 수량 · 포장만 간다
    const result = await placeOrder({
      ...orderer,
      requestNote: "",
      items: [{ productId: products.campagne.id, quantity: 4, giftWrap: false }],
    });
    expect(result).toHaveProperty("orderNo");

    const order = await db.order.findFirstOrThrow({ include: { items: true } });
    expect(order.subtotal).toBe(7800 * 4);
    expect(order.shippingFee).toBe(0); // 31,200원 → 무료
    expect(order.total).toBe(31_200);
    expect(order.items[0].unitPrice).toBe(7800);
    expect(updateTag).toHaveBeenCalledWith("product-sales");
  });
});

// #test/필수 #test/입력검증 #test/통합
describe("주문서 검증", () => {
  test("검증에 실패하면 { errors }를 돌려주고 주문이 저장되지 않는다", async () => {
    const result = await placeOrder({
      ...orderer,
      ordererName: "",
      items: [{ productId: products.croissant.id, quantity: 1, giftWrap: false }],
    });
    expect(result).toHaveProperty("errors.ordererName");
    expect(await db.order.count()).toBe(0);
    expect(updateTag).not.toHaveBeenCalled();
  });
});

// #test/필수 #test/원자성 #test/통합
describe("주문 저장", () => {
  test("주문하면 주문 · 주문 상품 · 판매수가 함께 저장되고 상품 수정일은 그대로다", async () => {
    const before = await db.product.findUniqueOrThrow({ where: { id: products.croissant.id } });

    const result = await createOrder({
      ...orderer,
      items: [
        { productId: products.croissant.id, quantity: 2, giftWrap: false },
        { productId: products.croissant.id, quantity: 1, giftWrap: true },
        { productId: products.campagne.id, quantity: 1, giftWrap: false },
      ],
    });
    expect(result.ok).toBe(true);

    expect(await db.order.count()).toBe(1);
    expect(await db.orderItem.count()).toBe(3);
    const after = await db.product.findUniqueOrThrow({ where: { id: products.croissant.id } });
    expect(after.salesCount).toBe(3);
    expect(after.updatedAt).toEqual(before.updatedAt);
    const campagne = await db.product.findUniqueOrThrow({ where: { id: products.campagne.id } });
    expect(campagne.salesCount).toBe(1);
  });

  test("없는 상품이 섞이면 실패하고 주문 · 판매수 모두 변하지 않는다", async () => {
    const result = await createOrder({
      ...orderer,
      items: [
        { productId: products.croissant.id, quantity: 1, giftWrap: false },
        { productId: 99_999, quantity: 1, giftWrap: false },
      ],
    });
    expect(result).toEqual({ ok: false, reason: "PRODUCT_NOT_FOUND" });
    expect(await db.order.count()).toBe(0);
    const croissant = await db.product.findUniqueOrThrow({ where: { id: products.croissant.id } });
    expect(croissant.salesCount).toBe(0);
  });

  test("같은 날 두 번째 주문은 일련번호가 1 늘어난다", async () => {
    const item = [{ productId: products.croissant.id, quantity: 1, giftWrap: false }];
    const first = await createOrder({ ...orderer, items: item });
    const second = await createOrder({ ...orderer, items: item });
    if (!first.ok || !second.ok) throw new Error("주문 실패");
    expect(first.orderNo).toMatch(/^\d{8}-0001$/);
    expect(second.orderNo).toBe(first.orderNo.replace(/0001$/, "0002"));
  });
});
