import { afterAll, beforeEach, expect, jest, test } from "@jest/globals";

// 판매수 갱신을 일부러 실패시킨다 — 주문 저장과 같은 트랜잭션이라 주문도 남지 않아야 한다
jest.unstable_mockModule("@/server/services/order/sales", () => ({
  applySalesDelta: jest.fn(async () => {
    throw new Error("판매수 갱신 실패 (테스트)");
  }),
}));

const { db } = await import("@/server/db");
const { createOrder } = await import("@/server/services/order/create");
const { resetDb, seedProducts, orderer } = await import("./helpers");

let products: Awaited<ReturnType<typeof seedProducts>>;

beforeEach(async () => {
  await resetDb();
  products = await seedProducts();
});

afterAll(async () => {
  await db.$disconnect();
});

// #test/필수 #test/원자성 #test/통합
test("판매수 갱신이 실패하면 주문도 저장되지 않는다", async () => {
  await expect(
    createOrder({ ...orderer, items: [{ productId: products.croissant.id, quantity: 2, giftWrap: false }] }),
  ).rejects.toThrow("판매수 갱신 실패");

  expect(await db.order.count()).toBe(0);
  expect(await db.orderItem.count()).toBe(0);
  const croissant = await db.product.findUniqueOrThrow({ where: { id: products.croissant.id } });
  expect(croissant.salesCount).toBe(0);
});
