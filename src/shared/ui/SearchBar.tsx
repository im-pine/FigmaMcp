import * as React from "react";
import { Search } from "lucide-react";
import { cn } from "@/shared/lib/utils";

/** Figma: SearchBar — 검색 모달 · 모바일 검색 페이지 */
export function SearchBar({ className, ...props }: React.ComponentProps<"input">) {
  return (
    <label
      className={cn(
        "flex h-14 w-full items-center gap-3 rounded-pill border border-line-strong bg-card px-5",
        className,
      )}
    >
      <Search className="size-6 shrink-0 text-heading" aria-hidden />
      <input
        type="search"
        className="h-full w-full min-w-0 bg-transparent type-body-lg text-heading outline-none placeholder:text-caption"
        {...props}
      />
    </label>
  );
}
