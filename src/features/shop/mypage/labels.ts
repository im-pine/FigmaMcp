// 주문 표시 규칙은 관리자와 함께 쓰므로 shared로 옮겼다.
import { formatOrderDate } from "@/shared/constants/order";

export {
  ORDER_STATUS_LABEL,
  ORDER_PROGRESS,
  PAYMENT_METHOD_LABEL,
  formatOrderDate,
} from "@/shared/constants/order";

/** 주문 날짜: 2026.10.06 (한국 시간) */
export function formatOrderDay(date: Date): string {
  return formatOrderDate(date).slice(0, 10);
}
