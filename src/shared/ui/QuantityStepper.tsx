"use client";

import { Minus, Plus } from "lucide-react";
import { cn } from "@/shared/lib/utils";

/** Figma: QuantityStepper — 상품 상세 · 장바구니 수량 조절 */
type QuantityStepperProps = {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  className?: string;
};

export function QuantityStepper({ value, onChange, min = 1, max = 99, className }: QuantityStepperProps) {
  return (
    <div
      className={cn(
        "inline-flex h-10 w-fit items-center gap-4 rounded-pill border border-line bg-card px-3.5",
        className,
      )}
    >
      <button
        type="button"
        aria-label="수량 줄이기"
        disabled={value <= min}
        onClick={() => onChange(Math.max(min, value - 1))}
        className="text-heading disabled:text-decor"
      >
        <Minus className="size-[18px]" />
      </button>
      <span className="min-w-4 text-center type-body-md text-heading" aria-live="polite">
        {value}
      </span>
      <button
        type="button"
        aria-label="수량 늘리기"
        disabled={value >= max}
        onClick={() => onChange(Math.min(max, value + 1))}
        className="text-heading disabled:text-decor"
      >
        <Plus className="size-[18px]" />
      </button>
    </div>
  );
}
