import type { OrderStatus } from "@/generated/prisma/enums";
import { ORDER_PROGRESS, ORDER_STATUS_LABEL } from "@/shared/constants/order";

/* 관리자 주문 상태 표시 규칙 */

/** 상태 메뉴 · 필터 순서 (진행 단계 + 취소) */
export const ORDER_STATUSES: OrderStatus[] = [...ORDER_PROGRESS, "CANCELED"];

/** 모바일 밑줄 탭용 짧은 이름 */
export const ORDER_STATUS_SHORT: Record<OrderStatus, string> = {
  RECEIVED: "접수",
  PREPARING: "준비중",
  SHIPPING: "배송중",
  DELIVERED: "완료",
  CANCELED: "취소",
};

/** URL ?status= 값을 상태로. 모르는 값이면 undefined(전체) */
export function parseStatus(value: string | string[] | undefined): OrderStatus | undefined {
  return typeof value === "string" && (ORDER_STATUSES as string[]).includes(value)
    ? (value as OrderStatus)
    : undefined;
}

/** 다음 진행 단계. 배송 완료 · 주문 취소면 null */
export function nextStatus(status: OrderStatus): OrderStatus | null {
  const i = ORDER_PROGRESS.indexOf(status);
  return i >= 0 && i < ORDER_PROGRESS.length - 1 ? ORDER_PROGRESS[i + 1] : null;
}

/** 받침에 맞춘 조사: 배송중 → 배송중으로, 주문 접수 → 주문 접수로 (ㄹ 받침은 '로') */
export function withRo(word: string): string {
  const code = word.charCodeAt(word.length - 1) - 0xac00;
  if (code < 0 || code > 11171) return `${word}(으)로`;
  const jong = code % 28;
  return jong === 0 || jong === 8 ? `${word}로` : `${word}으로`;
}

export const statusRo = (status: OrderStatus) => withRo(ORDER_STATUS_LABEL[status]);

/** 1건 변경 확인 문구 */
export function singleChangeDescription(orderNo: string, from: OrderStatus, to: OrderStatus) {
  return `주문 ${orderNo}의 상태를\n'${ORDER_STATUS_LABEL[from]} → ${ORDER_STATUS_LABEL[to]}'${roAfterQuote(to)} 바꿉니다.`;
}

/** 일괄 변경 확인 문구 */
export function bulkChangeDescription(count: number, to: OrderStatus) {
  return `선택한 주문 ${count}건의 상태를\n'${ORDER_STATUS_LABEL[to]}'${roAfterQuote(to)} 한 번에 바꿉니다.`;
}

/** 따옴표 뒤에 붙는 조사만 */
function roAfterQuote(status: OrderStatus) {
  return statusRo(status).slice(ORDER_STATUS_LABEL[status].length);
}
