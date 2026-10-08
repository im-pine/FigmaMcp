"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";
import { SORT_OPTIONS, type SortValue } from "../sort";

/*
 * 정렬 선택 (Figma: Product List 7:171 / 9:995의 "인기순 ▾")
 * ?sort=latest|popular. 기본(popular)은 주소에서 뺀다. 카테고리 · 검색어는 그대로 둔다.
 */
export function SortSelect({ value }: { value: SortValue }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const current = SORT_OPTIONS.find((o) => o.value === value)!;

  const change = (next: string) => {
    const params = new URLSearchParams(searchParams);
    if (next === "popular") params.delete("sort");
    else params.set("sort", next);
    const query = params.toString();
    router.push(query ? `/products?${query}` : "/products", { scroll: false });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="inline-flex items-center gap-1 type-body-sm text-caption outline-none hover:text-heading focus-visible:text-heading">
        {current.label}
        <ChevronDown aria-hidden className="size-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-28 rounded-input border-line bg-card">
        <DropdownMenuRadioGroup value={value} onValueChange={change}>
          {SORT_OPTIONS.map((o) => (
            <DropdownMenuRadioItem key={o.value} value={o.value} className="type-body-sm text-body">
              {o.label}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
