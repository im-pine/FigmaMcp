import { Suspense } from "react";
import { ProductCatalog, ProductCatalogSkeleton } from "@/features/shop/product/components/ProductCatalog";

export default function Page({ searchParams }: PageProps<"/products">) {
  return (
    <Suspense fallback={<ProductCatalogSkeleton />}>
      <ProductCatalog searchParams={searchParams} />
    </Suspense>
  );
}
