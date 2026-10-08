"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { ArrowRight } from "lucide-react";
import type { Product } from "@/generated/prisma/client";
import { CATEGORIES } from "@/shared/constants/catalog";
import { cn } from "@/shared/lib/utils";
import { ALL_CATEGORY_DISPLAY, CATEGORY_DISPLAY } from "@/features/shop/product/categories";
import { ProductCard } from "@/features/shop/product/components/ProductCard";

/*
 * 모바일 카테고리 탭 (Figma: Category Tab) — 원형 아이콘 탭을 누르면 아래 2×2 상품 목록이 바뀐다.
 * 탭 선택은 화면 안 상태(URL 변경 없음). "전체 보기"로 해당 카테고리 목록으로 이동한다.
 */
const TABS = [
  {
    key: "ALL",
    label: ALL_CATEGORY_DISPLAY.label,
    slug: "",
    bg: ALL_CATEGORY_DISPLAY.bg,
    image: ALL_CATEGORY_DISPLAY.image,
  },
  ...CATEGORIES.map((c) => ({ key: c.value, label: c.label, slug: c.slug, ...CATEGORY_DISPLAY[c.value] })),
];

const PREVIEW_COUNT = 4;

export function CategoryTabs({ products }: { products: Product[] }) {
  const [selected, setSelected] = useState(TABS[1].key);
  const tab = TABS.find((t) => t.key === selected)!;
  const matched =
    selected === "ALL"
      ? // 전체 탭은 베스트 상품을 먼저 보여준다
        [...products].sort((a, b) => Number(b.isBest) - Number(a.isBest))
      : products.filter((p) => p.category === selected);

  return (
    <div>
      <div role="tablist" aria-label="카테고리" className="flex justify-between">
        {TABS.map((t) => {
          const active = t.key === selected;
          return (
            <button
              key={t.key}
              type="button"
              role="tab"
              aria-selected={active}
              aria-controls="category-tab-panel"
              onClick={() => setSelected(t.key)}
              className="flex w-[62px] flex-col items-center gap-2"
            >
              <span
                className={cn(
                  "relative flex size-[62px] items-center justify-center overflow-hidden rounded-full transition-shadow",
                  t.bg,
                  active && "ring-2 ring-action ring-offset-2 ring-offset-page",
                )}
              >
                <Image src={t.image} alt="" width={48} height={48} className="size-12 object-contain" />
              </span>
              <span className={cn("type-body-sm", active ? "font-medium text-link" : "text-body")}>
                {t.label}
              </span>
            </button>
          );
        })}
      </div>

      <div id="category-tab-panel" role="tabpanel" className="mt-6 border-t border-line pt-6">
        <div className="flex items-center justify-between">
          <p className="flex items-baseline gap-1.5">
            <span className="type-h3 text-heading">{tab.label}</span>
            <span className="type-body-sm text-caption">{matched.length}개</span>
          </p>
          <Link
            href={tab.slug ? `/products?category=${tab.slug}` : "/products"}
            className="flex items-center gap-1 type-body-sm text-link"
          >
            전체 보기 <ArrowRight className="size-4" aria-hidden />
          </Link>
        </div>
        <div className="mt-5 grid grid-cols-2 gap-x-4 gap-y-8">
          {matched.slice(0, PREVIEW_COUNT).map((p) => (
            <ProductCard key={p.id} product={p} sizes="50vw" />
          ))}
        </div>
      </div>
    </div>
  );
}
