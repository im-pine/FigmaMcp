import { afterAll, beforeEach, describe, expect, jest, test } from "@jest/globals";

// Server Action · 서비스가 쓰는 next 모듈은 테스트에서 가짜로 바꾼다 (ESM이라 import 전에 등록)
const updateTag = jest.fn();
jest.unstable_mockModule("next/cache", () => ({ updateTag, cacheLife: jest.fn(), cacheTag: jest.fn() }));

const { db } = await import("@/server/db");
const { changeOrderStatus } = await import("@/features/admin/order/actions");
const { getAdminOrders, getAdminOrder } = await import("@/server/services/order/admin");
const { resetDb, seedProducts, orderer } = await import("./helpers");

const PASSWORD = process.env.ADMIN_PASSWORD!;
let products: Awaited<ReturnType<typeof seedProducts>>;

/** 주문 하나를 만든다 — 크루아상 qty개 + 캄파뉴 1개 */
async function makeOrder(orderNo: string, status: "RECEIVED" | "PREPARING" | "CANCELED", qty = 2) {
  return db.order.create({
    data: {
      ...orderer,
      orderNo,
      status,
      subtotal: 4500 * qty + 7800,
      shippingFee: 3000,
      total: 4500 * qty + 7800 + 3000,
      items: {
        create: [
          {
            productId: products.croissant.id,
            productName: "버터 크루아상",
            unitPrice: 4500,
            quantity: qty,
            lineTotal: 4500 * qty,
          },
          {
            productId: products.campagne.id,
            productName: "캄파뉴",
            unitPrice: 7800,
            quantity: 1,
            lineTotal: 7800,
          },
        ],
      },
    },
  });
}

const salesOf = async () =>
  Object.fromEntries(
    (await db.product.findMany({ select: { slug: true, salesCount: true } })).map((p) => [
      p.slug,
      p.salesCount,
    ]),
  );
const statusOf = async (orderNo: string) => (await db.order.findUniqueOrThrow({ where: { orderNo } })).status;

beforeEach(async () => {
  await resetDb();
  products = await seedProducts();
  // 판매수는 주문에서 계산된 값이라고 가정하고 넉넉히 둔다
  await db.product.updateMany({ data: { salesCount: 10 } });
  updateTag.mockClear();
});

afterAll(async () => {
  await db.$disconnect();
});

// #test/필수 #test/권한 #test/통합
describe("주문 상태 변경 — 비밀번호", () => {
  test("비밀번호가 틀리면 상태가 바뀌지 않는다", async () => {
    await makeOrder("20261009-0001", "RECEIVED");
    expect(await changeOrderStatus("wrong", ["20261009-0001"], "PREPARING")).toEqual({
      ok: false,
      error: "password",
    });
    expect(await statusOf("20261009-0001")).toBe("RECEIVED");
    expect(updateTag).not.toHaveBeenCalled();
  });
});

// #test/필수 #test/입력검증 #test/통합
describe("주문 상태 변경 — 입력 검증", () => {
  test("없는 상태 · 빈 주문 목록은 거부하고 아무것도 바꾸지 않는다", async () => {
    await makeOrder("20261009-0001", "RECEIVED");
    expect(await changeOrderStatus(PASSWORD, ["20261009-0001"], "LOST")).toMatchObject({
      ok: false,
      error: "invalid",
    });
    expect(await changeOrderStatus(PASSWORD, [], "PREPARING")).toMatchObject({ ok: false, error: "invalid" });
    expect(await statusOf("20261009-0001")).toBe("RECEIVED");
  });
});

// #test/필수 #test/핵심흐름 #test/통합
describe("주문 상태 일괄 변경", () => {
  test("여러 주문을 한 번에 같은 상태로 바꾸고 주문 캐시를 갱신한다", async () => {
    await makeOrder("20261009-0001", "RECEIVED");
    await makeOrder("20261009-0002", "PREPARING");
    expect(await changeOrderStatus(PASSWORD, ["20261009-0001", "20261009-0002"], "SHIPPING")).toEqual({
      ok: true,
    });
    expect(await statusOf("20261009-0001")).toBe("SHIPPING");
    expect(await statusOf("20261009-0002")).toBe("SHIPPING");
    expect(updateTag).toHaveBeenCalledWith("orders");
  });

  test("일괄 변경은 상태만 바꾸고 금액 · 개인정보는 그대로다", async () => {
    const before = await makeOrder("20261009-0001", "RECEIVED");
    await changeOrderStatus(PASSWORD, ["20261009-0001"], "PREPARING");
    const after = await db.order.findUniqueOrThrow({ where: { orderNo: "20261009-0001" } });
    expect({ ...after, status: before.status, updatedAt: before.updatedAt }).toEqual(before);
  });
});

// #test/필수 #test/금액 #test/원자성 #test/통합
describe("주문 취소와 판매수", () => {
  test("취소하면 판매수가 주문 수량만큼 줄고, 취소를 되돌리면 다시 늘어난다", async () => {
    await makeOrder("20261009-0001", "PREPARING", 2);
    expect(await changeOrderStatus(PASSWORD, ["20261009-0001"], "CANCELED")).toEqual({ ok: true });
    expect(await salesOf()).toEqual({ "butter-croissant": 8, campagne: 9 });
    expect(updateTag).toHaveBeenCalledWith("product-sales");

    await changeOrderStatus(PASSWORD, ["20261009-0001"], "PREPARING");
    expect(await salesOf()).toEqual({ "butter-croissant": 10, campagne: 10 });
  });

  test("이미 취소된 주문을 다시 취소해도 판매수가 또 줄지 않는다", async () => {
    await makeOrder("20261009-0001", "CANCELED", 2);
    expect(await changeOrderStatus(PASSWORD, ["20261009-0001"], "CANCELED")).toEqual({ ok: true });
    expect(await salesOf()).toEqual({ "butter-croissant": 10, campagne: 10 });
    expect(updateTag).not.toHaveBeenCalled();
  });

  test("취소가 아닌 상태끼리 바꾸면 판매수는 그대로다", async () => {
    await makeOrder("20261009-0001", "RECEIVED");
    await changeOrderStatus(PASSWORD, ["20261009-0001"], "SHIPPING");
    expect(await salesOf()).toEqual({ "butter-croissant": 10, campagne: 10 });
    expect(updateTag).not.toHaveBeenCalledWith("product-sales");
  });
});

// #test/필수 #test/개인정보 #test/통합
describe("관리자 주문 조회 — 개인정보", () => {
  test("목록과 상세에 원본 이름 · 연락처 · 주소 · 이메일이 없고 마스킹된 값만 있다", async () => {
    await makeOrder("20261009-0001", "RECEIVED");
    const list = await getAdminOrders();
    const detail = await getAdminOrder("20261009-0001");
    const raw = JSON.stringify({ list, detail });

    for (const secret of [
      orderer.ordererName,
      orderer.ordererPhone,
      orderer.recipientName,
      orderer.recipientPhone,
      orderer.address,
      orderer.addressDetail,
      orderer.ordererEmail,
    ]) {
      expect(raw).not.toContain(secret);
    }
    expect(list[0]).toMatchObject({
      ordererName: "홍*동",
      ordererPhone: "010-****-5678",
      address: "서울시 성동구 ********",
    });
    expect(detail).toMatchObject({ recipientName: "김*수", ordererEmail: "t***@example.com" });
  });

  test("상태로 걸러 볼 수 있다 (모바일 접수 탭)", async () => {
    await makeOrder("20261009-0001", "RECEIVED");
    await makeOrder("20261009-0002", "PREPARING");
    expect((await getAdminOrders("RECEIVED")).map((o) => o.orderNo)).toEqual(["20261009-0001"]);
  });
});
