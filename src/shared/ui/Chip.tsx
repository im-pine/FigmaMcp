import * as React from "react";
import { cn } from "@/shared/lib/utils";

/** Figma: Chip (State = Default · Selected) — 카테고리 필터, 결제 수단 선택 */
type ChipProps = React.ComponentProps<"button"> & { selected?: boolean };

export function Chip({ selected = false, className, ...props }: ChipProps) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      data-selected={selected}
      className={cn(
        "inline-flex h-10 items-center rounded-pill px-5 type-body-sm transition-colors",
        selected ? "bg-action text-on-action" : "border border-line text-body hover:bg-section",
        className,
      )}
      {...props}
    />
  );
}
