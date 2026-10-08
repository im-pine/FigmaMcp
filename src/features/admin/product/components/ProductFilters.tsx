"use client";

import Form from "next/form";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Category } from "@/generated/prisma/enums";
import { CATEGORIES } from "@/shared/constants/catalog";
import { cn } from "@/shared/lib/utils";
import { Chip } from "@/shared/ui/Chip";
import { SearchBar } from "@/shared/ui/SearchBar";

type FilterProps = { category?: Category; q?: string };

/** 목록 주소: 검색어와 카테고리를 함께 유지한다 */
function listHref({ category, q }: FilterProps) {
  const params = new URLSearchParams();
  if (q) params.set("q", q);
  if (category) params.set("category", category);
  const query = params.toString();
  return query ? `/admin/products?${query}` : "/admin/products";
}

/** 상품명 검색 — 제출하면 ?q=로 이동 (카테고리는 유지) */
export function ProductSearch({ q, category, className }: FilterProps & { className?: string }) {
  return (
    <Form action="/admin/products" role="search" className={className}>
      {category && <input type="hidden" name="category" value={category} />}
      <SearchBar
        key={q ?? ""}
        name="q"
        defaultValue={q}
        placeholder="상품명 검색"
        aria-label="상품명 검색"
        maxLength={50}
        className="h-full gap-2.5 px-4 [&_input]:type-body-md [&_svg]:size-5"
      />
    </Form>
  );
}

/** 데스크톱 카테고리 칩 (Figma: Chip) */
export function CategoryChips({ category, q }: FilterProps) {
  const router = useRouter();
  const items = [{ value: undefined, label: "All" }, ...CATEGORIES];
  return (
    <div className="flex items-center gap-2" role="group" aria-label="카테고리">
      {items.map((c) => (
        <Chip
          key={c.label}
          selected={category === c.value}
          onClick={() => router.push(listHref({ category: c.value, q }), { scroll: false })}
        >
          {c.label}
        </Chip>
      ))}
    </div>
  );
}

const TAB_BG: Record<Category | "ALL", string> = {
  ALL: "bg-category-all",
  BREAD: "bg-category-bread",
  CAKE: "bg-category-cake",
  COOKIE: "bg-category-cookie",
  BEVERAGE: "bg-category-beverage",
};

/** 모바일 원형 카테고리 아이콘 탭 — 선택된 탭은 클릭 요소 색 테두리 */
export function CategoryTabs({ category, q }: FilterProps) {
  const items = [
    { value: undefined, label: "All", slug: "all", bg: TAB_BG.ALL },
    ...CATEGORIES.map((c) => ({ ...c, bg: TAB_BG[c.value] })),
  ];
  return (
    <nav aria-label="카테고리">
      <ul className="flex justify-between pt-1">
        {items.map((c) => {
          const active = category === c.value;
          return (
            <li key={c.label}>
              <Link
                href={listHref({ category: c.value, q })}
                scroll={false}
                aria-current={active ? "page" : undefined}
                className="flex w-[62px] flex-col items-center gap-1.5"
              >
                <span
                  className={cn(
                    "flex size-[62px] items-center justify-center overflow-hidden rounded-full",
                    c.bg,
                    active && "ring-[3px] ring-action ring-offset-2 ring-offset-page",
                  )}
                >
                  <Image
                    src={`/images/categories/${c.slug}.png`}
                    alt=""
                    width={56}
                    height={56}
                    className="size-14 object-contain"
                  />
                </span>
                <span
                  className={cn(
                    "type-body-sm whitespace-nowrap",
                    active ? "font-medium text-link" : "text-body",
                  )}
                >
                  {c.label}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
