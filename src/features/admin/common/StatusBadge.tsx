import type { OrderStatus } from "@/generated/prisma/enums";
import { ORDER_STATUS_LABEL } from "@/shared/constants/order";
import { cn } from "@/shared/lib/utils";

/** Figma: StatusBadge — 주문 상태별 색. 취소는 진행 단계 밖이라 배경 없이 테두리만 */
const STATUS_CLASS: Record<OrderStatus, string> = {
  RECEIVED: "bg-status-received text-on-status-received",
  PREPARING: "bg-status-preparing text-on-status-preparing",
  SHIPPING: "bg-status-shipping text-on-status-shipping",
  DELIVERED: "bg-status-delivered text-on-status-delivered",
  CANCELED: "border border-status-canceled text-on-status-canceled",
};

export function StatusBadge({ status, className }: { status: OrderStatus; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex w-fit shrink-0 items-center rounded-pill px-2.5 py-0.5 type-label tracking-normal whitespace-nowrap",
        STATUS_CLASS[status],
        className,
      )}
    >
      {ORDER_STATUS_LABEL[status]}
    </span>
  );
}
