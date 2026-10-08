"use client";

import { useCartRehydrate } from "@/features/shop/cart/store";

/** localStorage의 장바구니를 클라이언트에서 한 번 불러온다 */
export function CartHydrator() {
  useCartRehydrate();
  return null;
}
