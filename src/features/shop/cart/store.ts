"use client";

import { useEffect, useSyncExternalStore } from "react";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Product } from "@/generated/prisma/client";
import { GIFT_WRAP_FEE, shippingFeeFor } from "@/shared/constants/catalog";

/*
 * 장바구니 — 비회원 전용 클라이언트 상태 (localStorage 유지).
 * 가격은 표시용 스냅샷이다. 주문 금액은 서버에서 DB 가격으로 다시 계산한다.
 */
export type CartProduct = Pick<Product, "id" | "slug" | "name" | "nameEn" | "price" | "imagePath">;
export type CartItem = CartProduct & { quantity: number; giftWrap: boolean };

type CartState = {
  items: CartItem[];
  addItem: (product: CartProduct, quantity?: number, giftWrap?: boolean) => void;
  updateQuantity: (productId: number, giftWrap: boolean, quantity: number) => void;
  removeItem: (productId: number, giftWrap: boolean) => void;
  clear: () => void;
};

const sameLine = (item: CartItem, productId: number, giftWrap: boolean) =>
  item.id === productId && item.giftWrap === giftWrap;

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      addItem: (product, quantity = 1, giftWrap = false) =>
        set((state) => {
          const exists = state.items.some((i) => sameLine(i, product.id, giftWrap));
          return {
            items: exists
              ? state.items.map((i) =>
                  sameLine(i, product.id, giftWrap) ? { ...i, quantity: i.quantity + quantity } : i,
                )
              : [...state.items, { ...product, quantity, giftWrap }],
          };
        }),
      updateQuantity: (productId, giftWrap, quantity) =>
        set((state) => ({
          items: state.items.map((i) => (sameLine(i, productId, giftWrap) ? { ...i, quantity } : i)),
        })),
      removeItem: (productId, giftWrap) =>
        set((state) => ({ items: state.items.filter((i) => !sameLine(i, productId, giftWrap)) })),
      clear: () => set({ items: [] }),
    }),
    // skipHydration: 서버 렌더(빈 장바구니)와 브라우저 값이 달라 생기는 hydration 불일치를 막는다
    { name: "pine-bakery-cart", skipHydration: true },
  ),
);

/** 장바구니 상품 수량 합계 */
export const useCartCount = () => useCartStore((s) => s.items.reduce((sum, i) => sum + i.quantity, 0));

/** 클라이언트에서 한 번 localStorage 값을 불러온다. 쇼핑몰 레이아웃에서 호출한다. */
export function useCartRehydrate() {
  useEffect(() => {
    useCartStore.persist.rehydrate();
  }, []);
}

/** localStorage 값을 다 불러왔는지. 그 전에는 빈 장바구니로 단정하지 않고 자리만 잡아 둔다. */
export function useCartHydrated() {
  return useSyncExternalStore(
    (onChange) => useCartStore.persist.onFinishHydration(onChange),
    () => useCartStore.persist.hasHydrated(),
    () => false,
  );
}

/** 한 줄 금액(표시용): (가격 + 선물 포장) × 수량 */
export const lineTotalOf = (item: CartItem) =>
  (item.price + (item.giftWrap ? GIFT_WRAP_FEE : 0)) * item.quantity;

/** 장바구니 금액 요약(표시용). 실제 결제 금액은 서버가 DB 가격으로 다시 계산한다. */
export function summarizeCart(items: CartItem[]) {
  const subtotal = items.reduce((sum, i) => sum + lineTotalOf(i), 0);
  const shippingFee = items.length === 0 ? 0 : shippingFeeFor(subtotal);
  return { subtotal, shippingFee, total: subtotal + shippingFee };
}
