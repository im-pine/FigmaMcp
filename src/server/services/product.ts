import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import type { Category, Product } from "@/generated/prisma/client";
import { db } from "@/server/db";

/*
 * 쇼핑몰 상품 조회.
 * 모든 조회는 'use cache'로 캐시하고 'products' 태그를 단다. 상품이 바뀌면 updateTag('products')로 갱신한다.
 * 상세는 상품별 태그(product:<slug>)도 함께 달아 한 상품만 갱신할 수 있게 한다.
 */

export type ProductFilter = {
  category?: Category;
  /** 상품명(한글 · 영문) 부분 일치 검색어 */
  q?: string;
};

/** 상품 목록 — 카테고리 · 검색어 필터, 등록 순 */
export async function getProducts(filter: ProductFilter = {}): Promise<Product[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("products");

  const q = filter.q?.trim();
  return db.product.findMany({
    where: {
      category: filter.category,
      ...(q && {
        OR: [
          { name: { contains: q, mode: "insensitive" } },
          { nameEn: { contains: q, mode: "insensitive" } },
        ],
      }),
    },
    orderBy: { id: "asc" },
  });
}

/** 베스트 상품 (홈 추천) */
export async function getBestProducts(limit = 4): Promise<Product[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("products");

  return db.product.findMany({ where: { isBest: true }, orderBy: { id: "asc" }, take: limit });
}

/** 상품 상세. 없으면 null */
export async function getProductBySlug(slug: string): Promise<Product | null> {
  "use cache";
  cacheLife("hours");
  cacheTag("products", `product:${slug}`);

  return db.product.findUnique({ where: { slug } });
}

/**
 * "함께 먹으면 좋은" 상품 4개.
 * 음료가 아니면 음료 2개 + 같은 카테고리 1개 + 다른 카테고리 1개, 음료면 음료 외 상품 4개를 고른다.
 * 모자라면 나머지 상품으로 채운다.
 */
export async function getRelatedProducts(product: Pick<Product, "id" | "category">): Promise<Product[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("products");

  const others = (await getProducts()).filter((p) => p.id !== product.id);
  const picks: Product[] =
    product.category === "BEVERAGE"
      ? others.filter((p) => p.category !== "BEVERAGE").slice(0, 4)
      : [
          ...others.filter((p) => p.category === "BEVERAGE").slice(0, 2),
          ...others.filter((p) => p.category === product.category).slice(0, 1),
          ...others.filter((p) => p.category !== product.category && p.category !== "BEVERAGE").slice(-1),
        ];

  const rest = others.filter((p) => !picks.includes(p));
  return [...picks, ...rest].slice(0, 4);
}
