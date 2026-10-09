"use client";

import { startTransition } from "react";
import { useRouter } from "next/navigation";
import type { OrderStatus } from "@/generated/prisma/enums";
import { Chip } from "@/shared/ui/Chip";
import { ORDER_STATUS_LABEL } from "../labels";

/** 주문 내역 상태 필터 — ?status=received … (전체는 status 제거). 칩마다 건수를 함께 보여 준다 */
export function OrderStatusFilter({
  current,
  counts,
}: {
  current?: OrderStatus;
  counts: { all: number } & Partial<Record<OrderStatus, number>>;
}) {
  const router = useRouter();
  const go = (status?: OrderStatus) =>
    startTransition(() =>
      router.push(status ? `/mypage/orders?status=${status.toLowerCase()}` : "/mypage/orders", {
        scroll: false,
      }),
    );

  const chips: { status?: OrderStatus; label: string; count: number }[] = [
    { label: "전체", count: counts.all },
    ...(Object.keys(ORDER_STATUS_LABEL) as OrderStatus[]).map((s) => ({
      status: s,
      label: ORDER_STATUS_LABEL[s],
      count: counts[s] ?? 0,
    })),
  ];

  return (
    <div
      role="group"
      aria-label="주문 상태"
      className="-mx-5 flex [scrollbar-width:none] gap-2 overflow-x-auto px-5 lg:mx-0 lg:flex-wrap lg:px-0"
    >
      {chips.map((c) => (
        <Chip key={c.label} selected={c.status === current} onClick={() => go(c.status)} className="shrink-0">
          {c.label} {c.count}
        </Chip>
      ))}
    </div>
  );
}
