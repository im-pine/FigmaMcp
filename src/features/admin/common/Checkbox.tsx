"use client";

import { Check, Minus } from "lucide-react";
import { cn } from "@/shared/lib/utils";

/** Figma: Checkbox (Unchecked · Checked · Indeterminate) — 일괄 선택용. 선택 색은 클릭 요소 색(primary) */
export function Checkbox({
  checked,
  indeterminate = false,
  onCheckedChange,
  className,
  ...props
}: {
  checked: boolean;
  indeterminate?: boolean;
  onCheckedChange: (checked: boolean) => void;
  className?: string;
  "aria-label"?: string;
}) {
  const on = checked || indeterminate;
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={indeterminate ? "mixed" : checked}
      onClick={(e) => {
        e.stopPropagation();
        onCheckedChange(!checked);
      }}
      className={cn(
        "relative flex size-[18px] shrink-0 items-center justify-center rounded-[4px] transition-colors outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50",
        // 터치 영역을 40px로 넓힌다
        "before:absolute before:-inset-[11px]",
        on ? "bg-action text-on-action" : "border-[1.5px] border-line-strong bg-card",
        className,
      )}
      {...props}
    >
      {indeterminate ? (
        <Minus className="size-3.5" strokeWidth={2.5} />
      ) : checked ? (
        <Check className="size-3.5" strokeWidth={2.5} />
      ) : null}
    </button>
  );
}
