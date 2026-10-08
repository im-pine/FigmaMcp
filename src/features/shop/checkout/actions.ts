"use server";

import { createOrder, priceOrder } from "@/server/services/order/create";
import { CheckoutItemsSchema, parseCheckout, type CheckoutErrors } from "./schema";

export type PlaceOrderResult = { orderNo: string } | { errors: CheckoutErrors };

/** 주문 생성 — 입력을 검증하고, 금액은 서버에서 DB 가격으로 다시 계산한다 (실제 결제 없음) */
export async function placeOrder(input: unknown): Promise<PlaceOrderResult> {
  const parsed = parseCheckout(input);
  if (!parsed.success) return { errors: parsed.errors };

  const result = await createOrder({ ...parsed.data, requestNote: parsed.data.requestNote ?? null });
  if (result.ok) return { orderNo: result.orderNo };

  return {
    errors: {
      form: [
        result.reason === "PRODUCT_NOT_FOUND"
          ? "판매가 끝난 상품이 장바구니에 있어요. 장바구니를 확인해 주세요."
          : "주문이 몰려 처리하지 못했어요. 잠시 후 다시 시도해 주세요.",
      ],
    },
  };
}

/** 결제창에 보여 줄 금액 — 장바구니에 저장된 가격 대신 DB 가격으로 계산한다 */
export async function quoteOrder(items: unknown): Promise<{ total: number } | { error: string }> {
  const parsed = CheckoutItemsSchema.safeParse(items);
  if (!parsed.success) return { error: "주문할 상품 정보가 올바르지 않습니다." };
  const priced = await priceOrder(parsed.data);
  if (!priced) return { error: "판매가 끝난 상품이 장바구니에 있어요. 장바구니를 확인해 주세요." };
  return { total: priced.total };
}
