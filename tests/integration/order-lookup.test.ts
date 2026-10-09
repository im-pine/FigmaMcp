import { afterAll, beforeEach, describe, expect, jest, test } from "@jest/globals";

const { createCookieJar } = await import("./helpers");
const cookies = createCookieJar();
jest.unstable_mockModule("next/headers", () => ({ cookies: async () => cookies.store }));
jest.unstable_mockModule("next/server", () => ({ connection: async () => {} }));
jest.unstable_mockModule("next/navigation", () => ({
  redirect: (url: string) => {
    throw Object.assign(new Error("NEXT_REDIRECT"), { url });
  },
}));

const { db } = await import("@/server/db");
const { createOrder } = await import("@/server/services/order/create");
const { grantOrderAccess, getAccessibleOrder } = await import("@/server/services/order/lookup");
const { lookupOrder } = await import("@/features/shop/mypage/actions");
const { resetDb, seedProducts, orderer } = await import("./helpers");

const LOOKUP_FAILED = "주문 정보를 찾을 수 없어요. 주문번호와 연락처를 다시 확인해 주세요.";
let orderNo: string;
let otherOrderNo: string;

beforeEach(async () => {
  await resetDb();
  cookies.jar.clear();
  const { croissant } = await seedProducts();
  const items = [{ productId: croissant.id, quantity: 1, giftWrap: false }];
  const first = await createOrder({ ...orderer, items });
  const second = await createOrder({ ...orderer, ordererPhone: "010-2222-3333", items });
  if (!first.ok || !second.ok) throw new Error("주문 준비 실패");
  orderNo = first.orderNo;
  otherOrderNo = second.orderNo;
});

afterAll(async () => {
  await db.$disconnect();
});

const form = (values: Record<string, string>) => {
  const data = new FormData();
  for (const [k, v] of Object.entries(values)) data.set(k, v);
  return data;
};

// #test/필수 #test/권한 #test/통합
describe("비회원 주문조회 권한", () => {
  test("주문번호와 연락처가 맞으면 해당 주문 경로에만 쓰는 접근 쿠키를 설정한다", async () => {
    expect(await grantOrderAccess({ orderNo, ordererPhone: "01012345678" })).toBe(true);
    const cookie = cookies.jar.get("order_access");
    expect(cookie?.options).toMatchObject({ httpOnly: true, path: `/mypage/orders/${orderNo}`, maxAge: 600 });
  });

  test("연락처가 틀리거나 없는 주문번호면 같은 실패 메시지를 돌려준다", async () => {
    const wrongPhone = await lookupOrder({}, form({ orderNo, ordererPhone: "010-0000-0000" }));
    const noOrder = await lookupOrder({}, form({ orderNo: "20990101-0001", ordererPhone: "010-1234-5678" }));
    expect(wrongPhone.errors?.form).toEqual([LOOKUP_FAILED]);
    expect(noOrder.errors?.form).toEqual([LOOKUP_FAILED]);
    expect(cookies.jar.size).toBe(0);
  });

  test("맞으면 주문 상세로 이동한다", async () => {
    await expect(lookupOrder({}, form({ orderNo, ordererPhone: "010-1234-5678" }))).rejects.toMatchObject({
      url: `/mypage/orders/${orderNo}`,
    });
  });

  test("토큰이 없으면 상세를 주지 않는다", async () => {
    expect(await getAccessibleOrder(orderNo)).toBeNull();
  });

  test("만료된 토큰이면 상세를 주지 않는다", async () => {
    await grantOrderAccess({ orderNo, ordererPhone: "010-1234-5678" });
    const now = Date.now();
    const spy = jest.spyOn(Date, "now").mockReturnValue(now + 11 * 60 * 1000);
    try {
      expect(await getAccessibleOrder(orderNo)).toBeNull();
    } finally {
      spy.mockRestore();
    }
  });

  test("위조된 토큰이면 상세를 주지 않는다", async () => {
    const future = Math.floor(Date.now() / 1000) + 600;
    cookies.store.set("order_access", `${future}.forged-signature`);
    expect(await getAccessibleOrder(orderNo)).toBeNull();
  });

  test("다른 주문으로 받은 토큰이면 상세를 주지 않는다", async () => {
    await grantOrderAccess({ orderNo: otherOrderNo, ordererPhone: "010-2222-3333" });
    expect(await getAccessibleOrder(orderNo)).toBeNull();
    expect(await getAccessibleOrder(otherOrderNo)).not.toBeNull();
  });
});

// #test/필수 #test/개인정보 #test/통합
describe("주문 상세 개인정보", () => {
  test("응답에 원본 이름 · 연락처 · 주소가 없고 마스킹된 값만 있다", async () => {
    await grantOrderAccess({ orderNo, ordererPhone: "010-1234-5678" });
    const order = await getAccessibleOrder(orderNo);
    expect(order).not.toBeNull();
    expect(order).toMatchObject({
      recipientName: "김*수",
      recipientPhone: "010-****-5432",
      address: "서울시 성동구 ********",
    });
    const json = JSON.stringify(order);
    for (const raw of ["김철수", "9876", "베이커리로", "1234-5678", "01012345678", "test@example.com"]) {
      expect(json).not.toContain(raw);
    }
  });
});
