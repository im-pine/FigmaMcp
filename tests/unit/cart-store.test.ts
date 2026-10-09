/** @jest-environment jsdom */
import { act, renderHook } from "@testing-library/react";
import { summarizeCart, useCartCount, useCartStore, type CartProduct } from "@/features/shop/cart/store";

const croissant: CartProduct = {
  id: 1,
  slug: "butter-croissant",
  name: "버터 크루아상",
  nameEn: "Butter Croissant",
  price: 4500,
  imagePath: "/images/products/butter-croissant.jpg",
};
const latte: CartProduct = { ...croissant, id: 2, slug: "latte", name: "라테", price: 5000 };

beforeEach(() => {
  act(() => useCartStore.getState().clear());
});

// #test/조건부 #test/클라이언트상태 #test/단위
describe("장바구니 store", () => {
  test("같은 상품 · 같은 포장은 수량이 합쳐진다", () => {
    act(() => {
      useCartStore.getState().addItem(croissant, 1, false);
      useCartStore.getState().addItem(croissant, 2, false);
    });
    expect(useCartStore.getState().items).toHaveLength(1);
    expect(useCartStore.getState().items[0].quantity).toBe(3);
  });

  test("같은 상품이라도 포장이 다르면 별도 줄이다", () => {
    act(() => {
      useCartStore.getState().addItem(croissant, 1, false);
      useCartStore.getState().addItem(croissant, 1, true);
    });
    expect(useCartStore.getState().items).toHaveLength(2);
  });

  test("수량 변경 · 삭제 · 비우기 후 값과 합계 수량이 맞다", () => {
    const { result } = renderHook(() => useCartCount());
    act(() => {
      useCartStore.getState().addItem(croissant, 1, false);
      useCartStore.getState().addItem(latte, 2, false);
    });
    expect(result.current).toBe(3);

    act(() => useCartStore.getState().updateQuantity(1, false, 5));
    expect(result.current).toBe(7);

    act(() => useCartStore.getState().removeItem(2, false));
    expect(result.current).toBe(5);
    expect(useCartStore.getState().items.map((i) => i.id)).toEqual([1]);

    act(() => useCartStore.getState().clear());
    expect(result.current).toBe(0);
  });

  test("표시용 합계는 선물 포장 1,000원을 수량만큼 더하고 3만 원 미만이면 배송비를 붙인다", () => {
    const summary = summarizeCart([{ ...croissant, quantity: 2, giftWrap: true }]);
    expect(summary.subtotal).toBe((4500 + 1000) * 2);
    expect(summary.shippingFee).toBe(3000);
    expect(summary.total).toBe(11_000 + 3000);
  });
});
