import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { CATEGORIES } from "@/shared/constants/catalog";
import { CATEGORY_DISPLAY } from "@/features/shop/product/categories";
import { cn } from "@/shared/lib/utils";

type CategoryItem = (typeof CATEGORIES)[number];

/** Figma: Category Card (데스크톱) — 카테고리 색 배경 · 배경 없는 오브젝트 · 세리프 이름 · 한 줄 설명 + 화살표 */
export function CategoryCard({ category }: { category: CategoryItem }) {
  const display = CATEGORY_DISPLAY[category.value];
  return (
    <Link
      href={`/products?category=${category.slug}`}
      className={cn(
        "group flex h-[436px] flex-col items-center rounded-card px-5 pt-8 pb-6 shadow-card transition-transform duration-200 hover:-translate-y-1",
        display.bg,
      )}
    >
      <h3 className="type-h2 text-heading">{category.label}</h3>
      <div className="relative my-4 w-full flex-1">
        <Image src={display.image} alt="" fill sizes="240px" className="object-contain" />
      </div>
      <div className="flex w-full items-center justify-between gap-2">
        <p className="type-body-lg text-body">{display.description}</p>
        <ArrowRight
          className="size-7 shrink-0 text-link transition-transform group-hover:translate-x-1"
          strokeWidth={2.5}
          aria-hidden
        />
      </div>
    </Link>
  );
}

/** 데스크톱 카테고리 카드 4개 */
export function CategoryCardGrid() {
  return (
    <div className="grid grid-cols-4 gap-6">
      {CATEGORIES.map((c) => (
        <CategoryCard key={c.value} category={c} />
      ))}
    </div>
  );
}
