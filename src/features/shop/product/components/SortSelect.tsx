"use client";

import { startTransition } from "react";
import { useRouter } from "next/navigation";
import { Check } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";
import { catalogHref } from "../catalog-href";
import { SORT_OPTIONS, type SortValue } from "../sort";

/*
 * 정렬 선택 (Figma: Product List (Sort Open) 92:2230 / Mobile 92:2384, SortMenu 92:2377)
 * ?sort=latest|popular. 기본(popular)은 주소에서 뺀다. 카테고리 · 검색어는 그대로 둔다 (주소는 catalogHref).
 * 메뉴: 최신순 → 인기순 순서, 선택된 항목은 배경 + 굵은 글씨 + 체크.
 */
export function SortSelect({ value, category, q }: { value: SortValue; category?: string; q?: string }) {
  const router = useRouter();
  const current = SORT_OPTIONS.find((o) => o.value === value)!;

  const change = (next: SortValue) => {
    const href = catalogHref({ category, q, sort: next === "popular" ? undefined : next });
    startTransition(() => router.push(href, { scroll: false }));
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label={`정렬: ${current.label}`}
        className="inline-flex min-h-10 items-center type-body-sm text-caption outline-none hover:text-heading focus-visible:text-heading"
      >
        {current.label} ▾
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="min-w-[168px] gap-0.5 rounded-input border-line bg-card p-1.5 shadow-card"
      >
        {SORT_OPTIONS.map((o) => {
          const selected = o.value === value;
          return (
            <DropdownMenuItem
              key={o.value}
              onSelect={() => change(o.value)}
              className={
                selected
                  ? "justify-between rounded-input bg-section px-3 py-2.5 type-body-md font-medium text-link focus:bg-section focus:text-link"
                  : "rounded-input px-3 py-2.5 type-body-md text-body focus:bg-section focus:text-body"
              }
            >
              {o.label}
              {selected && <Check aria-hidden className="size-[18px] text-link" />}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
