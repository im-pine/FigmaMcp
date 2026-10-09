import { afterAll, beforeEach, describe, expect, jest, test } from "@jest/globals";

// Server Action · 서비스가 쓰는 next 모듈은 테스트에서 가짜로 바꾼다 (ESM이라 import 전에 등록)
const updateTag = jest.fn();
jest.unstable_mockModule("next/cache", () => ({ updateTag, cacheLife: jest.fn(), cacheTag: jest.fn() }));

const { db } = await import("@/server/db");
const { createProduct, updateProduct, deleteProduct } = await import("@/features/admin/product/actions");
const { resetDb, seedProducts, orderer } = await import("./helpers");

const PASSWORD = process.env.ADMIN_PASSWORD!;
let products: Awaited<ReturnType<typeof seedProducts>>;

const input = {
  name: "소금빵",
  nameEn: "Butter Croissant", // 이미 있는 slug와 겹치게 해 slug 중복 처리를 확인한다
  description: "버터를 넣어 구운 소금빵",
  price: 3500,
  category: "BREAD",
  imagePath: "/images/products/salt-bread.jpg",
  isBest: true,
  ingredients: "밀가루, 버터, 소금",
  allergens: "밀, 우유",
  storageGuide: "실온 보관",
};

beforeEach(async () => {
  await resetDb();
  products = await seedProducts();
  updateTag.mockClear();
});

afterAll(async () => {
  await db.$disconnect();
});

// #test/필수 #test/권한 #test/통합
describe("관리자 상품 변경 — 비밀번호", () => {
  test("비밀번호가 틀리면 등록 · 수정 · 삭제 모두 막히고 DB는 그대로다", async () => {
    expect(await createProduct("wrong", input)).toEqual({ ok: false, error: "password" });
    expect(
      await updateProduct("wrong", { id: products.croissant.id, data: { ...input, name: "바뀜" } }),
    ).toEqual({
      ok: false,
      error: "password",
    });
    expect(await deleteProduct("wrong", { id: products.campagne.id })).toEqual({
      ok: false,
      error: "password",
    });

    expect(await db.product.count()).toBe(2);
    expect((await db.product.findUniqueOrThrow({ where: { id: products.croissant.id } })).name).toBe(
      "버터 크루아상",
    );
    expect(updateTag).not.toHaveBeenCalled();
  });

  test("비밀번호가 비어 있어도 막힌다", async () => {
    expect(await createProduct("", input)).toEqual({ ok: false, error: "password" });
    expect(await db.product.count()).toBe(2);
  });

  test("비밀번호 자리에 문자열이 아닌 값(숫자 · 객체)이 오면 등록 · 수정 · 삭제 모두 거부하고 DB는 그대로다", async () => {
    for (const bad of [1234, { password: PASSWORD }, null] as unknown[]) {
      expect(await createProduct(bad as string, input)).toEqual({ ok: false, error: "password" });
      expect(
        await updateProduct(bad as string, { id: products.croissant.id, data: { ...input, name: "바뀜" } }),
      ).toEqual({ ok: false, error: "password" });
      expect(await deleteProduct(bad as string, { id: products.campagne.id })).toEqual({
        ok: false,
        error: "password",
      });
    }
    expect(await db.product.count()).toBe(2);
    expect((await db.product.findUniqueOrThrow({ where: { id: products.croissant.id } })).name).toBe(
      "버터 크루아상",
    );
    expect(updateTag).not.toHaveBeenCalled();
  });
});

// #test/필수 #test/입력검증 #test/통합
describe("관리자 상품 변경 — 입력 검증", () => {
  test("검증에 실패하면 저장하지 않고 틀린 필드를 돌려준다", async () => {
    const result = await createProduct(PASSWORD, { ...input, name: "", price: -1 });
    expect(result).toMatchObject({ ok: false, error: "invalid" });
    if (!result.ok && result.error === "invalid") {
      expect(Object.keys(result.fieldErrors)).toEqual(expect.arrayContaining(["name", "price"]));
    }
    expect(await db.product.count()).toBe(2);
  });

  test("판매수 같은 편집 대상이 아닌 필드를 끼워 보내도 저장되지 않는다", async () => {
    await createProduct(PASSWORD, { ...input, salesCount: 999, slug: "hacked" });
    const created = await db.product.findFirstOrThrow({ where: { name: "소금빵" } });
    expect(created.salesCount).toBe(0);
    expect(created.slug).not.toBe("hacked");
  });
});

// #test/필수 #test/핵심흐름 #test/통합
describe("관리자 상품 등록 · 수정 · 삭제", () => {
  test("등록하면 slug가 겹치지 않게 만들어지고 상품 캐시를 갱신한다", async () => {
    expect(await createProduct(PASSWORD, input)).toEqual({ ok: true });
    const created = await db.product.findFirstOrThrow({ where: { name: "소금빵" } });
    expect(created.slug).toBe("butter-croissant-2");
    expect(updateTag).toHaveBeenCalledWith("products");
  });

  test("수정하면 값이 바뀌고 slug(쇼핑몰 주소)는 그대로다", async () => {
    const data = { ...input, name: "버터 크루아상", nameEn: "New Name", price: 4600 };
    expect(await updateProduct(PASSWORD, { id: products.croissant.id, data })).toEqual({ ok: true });
    const updated = await db.product.findUniqueOrThrow({ where: { id: products.croissant.id } });
    expect(updated.price).toBe(4600);
    expect(updated.slug).toBe("butter-croissant");
    expect(updateTag).toHaveBeenCalledWith("product:butter-croissant");
  });

  test("삭제해도 그 상품이 든 주문 기록은 남는다", async () => {
    const order = await db.order.create({
      data: {
        ...orderer,
        orderNo: "20261009-0001",
        subtotal: 7800,
        shippingFee: 3000,
        total: 10800,
        items: {
          create: [
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
    expect(await deleteProduct(PASSWORD, { id: products.campagne.id })).toEqual({ ok: true });
    expect(await db.product.findUnique({ where: { id: products.campagne.id } })).toBeNull();
    const item = await db.orderItem.findFirstOrThrow({ where: { orderId: order.id } });
    expect(item.productId).toBeNull();
    expect(item.productName).toBe("캄파뉴");
  });

  test("같은 상품을 두 번 삭제하면 두 번째는 not-found를 돌려준다", async () => {
    expect(await deleteProduct(PASSWORD, { id: products.campagne.id })).toEqual({ ok: true });
    expect(await deleteProduct(PASSWORD, { id: products.campagne.id })).toMatchObject({
      ok: false,
      error: "not-found",
    });
  });

  test("없는 상품을 수정 · 삭제하면 not-found를 돌려준다", async () => {
    expect(await deleteProduct(PASSWORD, { id: 9999 })).toMatchObject({ ok: false, error: "not-found" });
    expect(await updateProduct(PASSWORD, { id: 9999, data: input })).toMatchObject({
      ok: false,
      error: "not-found",
    });
  });
});
