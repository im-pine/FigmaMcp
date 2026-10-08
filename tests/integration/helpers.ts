import { db } from "@/server/db";

/*
 * 통합 테스트 공통 준비 — 테스트마다 DB를 비우고 필요한 상품만 넣는다 (테스트끼리 독립).
 */
export async function resetDb() {
  await db.$executeRawUnsafe('TRUNCATE "OrderItem", "Order", "Product" RESTART IDENTITY CASCADE');
}

const base = {
  nameEn: "Test",
  description: "테스트 상품",
  category: "BREAD" as const,
  imagePath: "/images/products/butter-croissant.jpg",
  ingredients: "밀가루",
  storageGuide: "실온",
  allergens: "밀",
};

/** 상품 2개: 크루아상(4,500원), 캄파뉴(7,800원) */
export async function seedProducts() {
  const croissant = await db.product.create({
    data: { ...base, slug: "butter-croissant", name: "버터 크루아상", price: 4500 },
  });
  const campagne = await db.product.create({
    data: { ...base, slug: "campagne", name: "캄파뉴", price: 7800 },
  });
  return { croissant, campagne };
}

export const orderer = {
  ordererName: "홍길동",
  ordererPhone: "010-1234-5678",
  ordererEmail: "test@example.com",
  recipientName: "김철수",
  recipientPhone: "010-9876-5432",
  address: "서울시 성동구 베이커리로 12",
  addressDetail: "101호",
  requestNote: null,
  paymentMethod: "CARD" as const,
};

/** Server Action · 서비스가 쓰는 next 모듈의 가짜 — 쿠키는 메모리에 저장한다 */
export function createCookieJar() {
  const jar = new Map<string, { value: string; options?: Record<string, unknown> }>();
  return {
    jar,
    store: {
      get: (name: string) => (jar.has(name) ? { name, value: jar.get(name)!.value } : undefined),
      set: (name: string, value: string, options?: Record<string, unknown>) => {
        jar.set(name, { value, options });
      },
    },
  };
}
