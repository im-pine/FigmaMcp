"use client";

import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import { CATEGORIES } from "@/shared/constants/catalog";
import { Chip } from "@/shared/ui/Chip";

/*
 * 상품 목록 필터 (Figma: Product List · Search Result)
 * - 카테고리 칩: ?category=bread … (All은 category 제거). 검색어는 유지한다
 * - 검색어 칩: ✕를 누르면 q만 지우고 카테고리는 유지한다
 * - 정렬(sort)은 어느 쪽을 눌러도 유지한다. 기본(인기순)은 주소에 넣지 않으므로 "latest"일 때만 받는다
 */
const CHIPS = [
  { label: "All", slug: undefined },
  ...CATEGORIES.map((c) => ({ label: c.label, slug: c.slug })),
];

function catalogHref(category?: string, q?: string, sort?: string) {
  const params = new URLSearchParams();
  if (q) params.set("q", q);
  if (category) params.set("category", category);
  if (sort) params.set("sort", sort);
  const query = params.toString();
  return query ? `/products?${query}` : "/products";
}

export function CatalogFilterBar({ category, q, sort }: { category?: string; q?: string; sort?: string }) {
  const router = useRouter();
  const go = (href: string) => router.push(href, { scroll: false });

  return (
    <div className="-mx-5 flex [scrollbar-width:none] items-center gap-2 overflow-x-auto px-5 lg:mx-0 lg:gap-3 lg:px-0">
      {q && (
        <>
          <span className="inline-flex h-10 shrink-0 items-center gap-2 rounded-pill bg-badge pr-3 pl-4 type-body-sm text-on-badge">
            검색어: {q}
            <button
              type="button"
              aria-label={`검색어 '${q}' 지우기`}
              onClick={() => go(catalogHref(category, undefined, sort))}
              className="rounded-full p-0.5 hover:bg-primary-300"
            >
              <X className="size-4" />
            </button>
          </span>
          <span aria-hidden className="hidden h-6 w-px shrink-0 bg-line lg:block" />
        </>
      )}
      {CHIPS.map((c) => (
        <Chip
          key={c.label}
          selected={c.slug === category}
          onClick={() => go(catalogHref(c.slug, q, sort))}
          className="shrink-0"
        >
          {c.label}
        </Chip>
      ))}
    </div>
  );
}
