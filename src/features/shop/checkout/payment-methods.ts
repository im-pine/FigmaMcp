import type { PaymentMethod } from "@/generated/prisma/enums";

/** 결제 수단 칩 순서와 표시 이름 */
export const PAYMENT_METHODS: { value: PaymentMethod; label: string }[] = [
  { value: "CARD", label: "신용카드" },
  { value: "BANK_TRANSFER", label: "계좌이체" },
  { value: "EASY_PAY", label: "간편결제" },
];

export const paymentLabel = (method: PaymentMethod) =>
  PAYMENT_METHODS.find((m) => m.value === method)?.label ?? method;
