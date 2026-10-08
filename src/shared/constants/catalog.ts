/** 상품 카테고리 — Prisma enum Category와 같은 값 */
export const CATEGORIES = [
  { value: "BREAD", label: "Bread", slug: "bread" },
  { value: "CAKE", label: "Cake", slug: "cake" },
  { value: "COOKIE", label: "Cookie", slug: "cookie" },
  { value: "BEVERAGE", label: "Beverage", slug: "beverage" },
] as const;

export type CategoryValue = (typeof CATEGORIES)[number]["value"];

/** 배송비 규칙: 30,000원 이상 무료, 미만 3,000원 */
export const SHIPPING = { fee: 3000, freeThreshold: 30000 } as const;

export function shippingFeeFor(subtotal: number): number {
  return subtotal >= SHIPPING.freeThreshold ? 0 : SHIPPING.fee;
}

/** 선물 포장 옵션 추가 금액 */
export const GIFT_WRAP_FEE = 1000;
