import { notFound } from "next/navigation";
import { categoryFromSlug } from "@/features/shop/product/categories";
import { ProductCatalog } from "@/features/shop/product/components/ProductCatalog";
import { CATEGORIES } from "@/shared/constants/catalog";

/**
 * 카테고리별 상품 목록. 카테고리는 4개로 정해져 있어 빌드 때 모두 만든다 —
 * 제목 · 설명이 미리 만든 화면에 들어가 스켈레톤 없이 바로 보인다. 정렬 · 목록만 요청 때 채운다.
 */
export function generateStaticParams() {
  return CATEGORIES.map((c) => ({ category: c.slug }));
}

export default async function Page({ params, searchParams }: PageProps<"/products/category/[category]">) {
  const category = categoryFromSlug((await params).category);
  if (!category) notFound();
  return <ProductCatalog category={category} searchParams={searchParams} />;
}
