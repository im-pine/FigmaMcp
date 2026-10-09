import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ProductDetail, ProductDetailSkeleton } from "@/features/shop/product/components/ProductDetail";
import { getProductBySlug, getProducts } from "@/server/services/product";

/** 등록된 상품은 빌드 때 미리 만든다. 이후 추가된 상품은 첫 요청 때 만든다. */
export async function generateStaticParams() {
  const products = await getProducts();
  return products.map((p) => ({ slug: p.slug }));
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
