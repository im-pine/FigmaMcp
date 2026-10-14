import { ProductCatalog } from "@/features/shop/product/components/ProductCatalog";

/** 전체 상품 — 제목은 바로 그리고, 정렬 · 상품 데이터가 필요한 목록만 ProductCatalog 안의 Suspense가 채운다 */
export default function Page({ searchParams }: PageProps<"/products">) {
  return <ProductCatalog searchParams={searchParams} />;
}
