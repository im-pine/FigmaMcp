import { ProductCatalog } from "@/features/shop/product/components/ProductCatalog";

/** 상품 검색 결과 — 제목에 결과 건수가 들어가므로 제목까지 요청 때 채운다 (?q= 없으면 목록으로 이동) */
export default function Page({ searchParams }: PageProps<"/products/search">) {
  return <ProductCatalog search searchParams={searchParams} />;
}
