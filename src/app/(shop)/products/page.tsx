import { ProductCatalog } from "@/features/shop/product/components/ProductCatalog";

/** 틀은 바로 그리고, 주소 값 · 상품 데이터가 필요한 부분만 ProductCatalog 안의 Suspense가 채운다 */
export default function Page({ searchParams }: PageProps<"/products">) {
  return <ProductCatalog searchParams={searchParams} />;
}
