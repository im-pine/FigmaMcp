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

/* 겉모양은 18px 아이콘 그대로, 누르는 영역만 44px로 넓힌다 (UX 공통 원칙: 터치 영역) */
const STEP_BUTTON =
  "relative text-heading transition-colors hover:text-link disabled:text-decor disabled:hover:text-decor before:absolute before:top-1/2 before:left-1/2 before:size-11 before:-translate-1/2 before:content-['']";

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
        className={STEP_BUTTON}
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
        className={STEP_BUTTON}
      >
        <Plus className="size-[18px]" />
      </button>
    </div>
  );
}
