"use client";

import { useCartCount } from "@/features/shop/cart/store";
import { cn } from "@/shared/lib/utils";

/** 장바구니 아이콘 오른쪽 위 수량 배지 (Figma: Badge). 0이면 숨긴다. */
export function CartCountBadge({ className }: { className?: string }) {
  const count = useCartCount();
  if (count === 0) return null;
  return (
    <span
      className={cn(
        "absolute -top-1.5 left-3.5 inline-flex min-w-5 items-center justify-center rounded-pill bg-badge px-1.5 py-px text-[11px] leading-4 font-medium text-on-badge",
        className,
      )}
    >
      {count > 99 ? "99+" : count}
    </span>
  );
}
