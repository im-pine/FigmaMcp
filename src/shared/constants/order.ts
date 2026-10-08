import type { OrderStatus, PaymentMethod } from "@/generated/prisma/enums";

/* 쇼핑몰 · 관리자 공용 주문 표시 규칙 */
/** 주문 상태 표시 이름 (Prisma enum OrderStatus) */
export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  RECEIVED: "주문 접수",
  PREPARING: "배송 준비중",
  SHIPPING: "배송중",
  DELIVERED: "배송 완료",
  CANCELED: "주문 취소",
};

/** 배송 진행 단계 순서 (취소는 단계에 포함하지 않음) */
export const ORDER_PROGRESS: OrderStatus[] = ["RECEIVED", "PREPARING", "SHIPPING", "DELIVERED"];

/** 결제 수단 표시 이름 — 실제 결제가 없는 데모라 (데모)를 붙인다 */
export const PAYMENT_METHOD_LABEL: Record<PaymentMethod, string> = {
  CARD: "신용카드 (데모)",
  BANK_TRANSFER: "계좌이체 (데모)",
  EASY_PAY: "간편결제 (데모)",
};

/** 주문 일시: 2026.10.06 14:32 (한국 시간) */
export function formatOrderDate(date: Date): string {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("ko-KR", {
      timeZone: "Asia/Seoul",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    })
      .formatToParts(date)
      .map((p) => [p.type, p.value]),
  );
  return `${parts.year}.${parts.month}.${parts.day} ${parts.hour}:${parts.minute}`;
}
