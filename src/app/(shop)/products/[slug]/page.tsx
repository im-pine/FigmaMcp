import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ProductDetail, ProductDetailSkeleton } from "@/features/shop/product/components/ProductDetail";
import { getProductBySlug, getProducts } from "@/server/services/product";

/**
 * 등록된 상품은 빌드 때 미리 만든다. 이후 추가된 상품은 첫 요청 때 만든다.
 * Cache Components는 이 목록이 비면 빌드를 거부한다. 상품이 아직 없는 새 DB(시드 전)에서도 첫 배포가
 * 되도록, 비어 있을 때는 존재하지 않는 자리표시 주소 하나를 돌려준다 (그 주소는 404가 되고 실제 상품에는 영향 없음).
 */
export async function generateStaticParams() {
  const products = await getProducts();
  return products.length > 0 ? products.map((p) => ({ slug: p.slug })) : [{ slug: "_" }];
}

/** params(URL 값)는 <Suspense> 안에서 읽어 공유 App Shell이 특정 상품에 묶이지 않게 한다. */
export default function Page({ params }: PageProps<"/products/[slug]">) {
  return (
    <Suspense fallback={<ProductDetailSkeleton />}>
      <ProductBySlug params={params} />
    </Suspense>
  );
}

async function ProductBySlug({ params }: Pick<PageProps<"/products/[slug]">, "params">) {
  const product = await getProductBySlug((await params).slug);
  if (!product) notFound();
  return <ProductDetail product={product} />;
}
