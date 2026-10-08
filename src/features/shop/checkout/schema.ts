import * as z from "zod";
import { OrderInputSchema, OrderItemInputSchema } from "@/generated/zod/schemas/variants/input";

/*
 * 주문서 입력 스키마 — Prisma에서 생성된 Zod(OrderInput · OrderItemInput)에서 필요한 필드만 골라 쓴다.
 * 클라이언트(결제창을 열기 전 확인)와 Server Action(최종 검증)이 같은 스키마를 쓴다.
 * 가격은 받지 않는다. 금액은 서버가 상품 id로 DB 가격을 읽어 다시 계산한다.
 */
const PHONE = /^0\d{1,2}-?\d{3,4}-?\d{4}$/;

export const CheckoutItemSchema = OrderItemInputSchema.pick({ giftWrap: true }).extend({
  productId: z.number().int().positive(),
  quantity: OrderItemInputSchema.shape.quantity.max(99),
});

export const CheckoutItemsSchema = z.array(CheckoutItemSchema).min(1).max(50);

export const CheckoutSchema = OrderInputSchema.pick({
  ordererName: true,
  ordererPhone: true,
  ordererEmail: true,
  recipientName: true,
  recipientPhone: true,
  address: true,
  addressDetail: true,
  requestNote: true,
  paymentMethod: true,
}).extend({
  ordererPhone: OrderInputSchema.shape.ordererPhone.regex(PHONE),
  recipientPhone: OrderInputSchema.shape.recipientPhone.regex(PHONE),
  ordererEmail: z.email(),
  items: CheckoutItemsSchema,
});

export type CheckoutInput = z.infer<typeof CheckoutSchema>;
export type CheckoutField = keyof CheckoutInput;
export type CheckoutErrors = Partial<Record<CheckoutField | "form", string[]>>;

/** 필드별 안내 문구 (Zod 기본 메시지 대신 보여 준다) */
const MESSAGES: Record<CheckoutField, string> = {
  ordererName: "주문자 이름을 입력하세요.",
  ordererPhone: "연락처를 010-0000-0000 형식으로 입력하세요.",
  ordererEmail: "이메일 주소를 확인하세요.",
  recipientName: "받는 분 이름을 입력하세요.",
  recipientPhone: "받는 분 연락처를 010-0000-0000 형식으로 입력하세요.",
  address: "주소를 입력하세요.",
  addressDetail: "상세 주소를 확인하세요.",
  requestNote: "요청사항을 확인하세요.",
  paymentMethod: "결제 수단을 선택하세요.",
  items: "주문할 상품 정보가 올바르지 않습니다. 장바구니를 확인해 주세요.",
};

/** 앞뒤 공백 정리 · 빈 요청사항은 null */
function normalize(input: unknown): unknown {
  if (typeof input !== "object" || input === null) return input;
  const entries = Object.entries(input).map(([k, v]) => [k, typeof v === "string" ? v.trim() : v]);
  const data = Object.fromEntries(entries);
  if (data.requestNote === "") data.requestNote = null;
  return data;
}

export function parseCheckout(
  input: unknown,
): { success: true; data: CheckoutInput } | { success: false; errors: CheckoutErrors } {
  const result = CheckoutSchema.safeParse(normalize(input));
  if (result.success) return { success: true, data: result.data };

  const errors: CheckoutErrors = {};
  for (const issue of result.error.issues) {
    const field = issue.path[0];
    if (typeof field === "string" && field in MESSAGES) {
      errors[field as CheckoutField] = [MESSAGES[field as CheckoutField]];
    } else {
      errors.form = ["입력값을 확인해 주세요."];
    }
  }
  return { success: false, errors };
}
