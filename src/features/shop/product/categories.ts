import type { Category } from "@/generated/prisma/client";
import { CATEGORIES } from "@/shared/constants/catalog";

/** 카테고리별 화면 문구 · 색 · 이미지 (Figma: Category Card · Category Tab) */
export const CATEGORY_DISPLAY = {
  BREAD: {
    description: "매일 아침 굽는 담백한 식사빵",
    bg: "bg-category-bread",
    image: "/images/categories/bread.png",
  },
  CAKE: {
    description: "특별한 날을 위한 케이크",
    bg: "bg-category-cake",
    image: "/images/categories/cake.png",
  },
  COOKIE: {
    description: "바삭하고 진한 수제 쿠키",
    bg: "bg-category-cookie",
    image: "/images/categories/cookie.png",
  },
  BEVERAGE: {
    description: "빵과 어울리는 커피와 차",
    bg: "bg-category-beverage",
    image: "/images/categories/beverage.png",
  },
} satisfies Record<Category, { description: string; bg: string; image: string }>;

export const ALL_CATEGORY_DISPLAY = {
  label: "All",
  bg: "bg-category-all",
  image: "/images/categories/all.png",
};

/** URL의 ?category=bread → "BREAD". 모르는 값이면 undefined (전체) */
export function categoryFromSlug(slug: string | string[] | undefined) {
  return CATEGORIES.find((c) => c.slug === slug);
}

export function categoryOf(value: Category) {
  return CATEGORIES.find((c) => c.value === value)!;
}
