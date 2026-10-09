import type { Category } from "@/generated/prisma/enums";
import { CATEGORIES } from "@/shared/constants/catalog";
import { cn } from "@/shared/lib/utils";

/** Figma: CategoryBadge — 배경은 카테고리 색 토큰, 글자는 text-heading */
const CATEGORY_CLASS: Record<Category, string> = {
  BREAD: "bg-category-bread",
  CAKE: "bg-category-cake",
  COOKIE: "bg-category-cookie",
  BEVERAGE: "bg-category-beverage",
};

export function CategoryBadge({ category, className }: { category: Category; className?: string }) {
  const label = CATEGORIES.find((c) => c.value === category)?.label ?? category;
  return (
    <span
      className={cn(
        "inline-flex w-fit shrink-0 items-center rounded-pill px-2.5 py-0.5 type-label text-heading uppercase",
        CATEGORY_CLASS[category],
        className,
      )}
    >
      {label}
    </span>
  );
}
