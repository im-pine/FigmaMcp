import { Fragment } from "react";
import { Check } from "lucide-react";
import type { OrderStatus } from "@/generated/prisma/enums";
import { cn } from "@/shared/lib/utils";
import { ORDER_PROGRESS, ORDER_STATUS_LABEL } from "../labels";

/** 배송 진행 단계 (주문 접수 → 배송 준비중 → 배송중 → 배송 완료). 완료 = 체크, 현재 = 링 */
export function OrderProgress({ status }: { status: OrderStatus }) {
  if (status === "CANCELED") {
    return (
      <p className="rounded-card bg-card px-5 py-5 type-body-md text-body lg:px-12 lg:py-7">
        취소된 주문이에요. 배송이 진행되지 않습니다.
      </p>
    );
  }

  const current = ORDER_PROGRESS.indexOf(status);

  return (
    <ol
      aria-label="배송 진행 단계"
      className="flex items-start rounded-card bg-card px-4 py-5 lg:px-12 lg:py-7"
    >
      {ORDER_PROGRESS.map((step, i) => {
        const state = i < current ? "done" : i === current ? "current" : "upcoming";
        return (
          <Fragment key={step}>
            {i > 0 && (
              <li
                aria-hidden
                className={cn(
                  "mx-2 mt-3 h-0.5 flex-1 lg:mx-3 lg:mt-4",
                  i <= current ? "bg-action" : "bg-line",
                )}
              />
            )}
            <li
              className="flex flex-col items-center gap-2"
              aria-current={state === "current" ? "step" : undefined}
            >
              <span
                className={cn(
                  "flex size-6 items-center justify-center rounded-full lg:size-8",
                  state === "done" && "bg-action text-on-action",
                  state === "current" && "border-2 border-action",
                  state === "upcoming" && "border-2 border-line",
                )}
              >
                {state === "done" && <Check className="size-3.5 lg:size-4" strokeWidth={3} />}
                {state === "current" && <span className="size-2.5 rounded-full bg-action lg:size-3" />}
              </span>
              <span
                className={cn(
                  "text-[11px] leading-tight whitespace-nowrap lg:type-body-md",
                  state === "upcoming" ? "text-caption lg:type-body-sm" : "font-medium text-heading",
                )}
              >
                {ORDER_STATUS_LABEL[step]}
                <span className="sr-only">
                  {state === "done" ? " (완료)" : state === "current" ? " (현재 단계)" : ""}
                </span>
              </span>
            </li>
          </Fragment>
        );
      })}
    </ol>
  );
}
