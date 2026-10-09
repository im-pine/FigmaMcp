import { Suspense } from "react";
import { ProductAdmin, ProductAdminSkeleton } from "@/features/admin/product/components/ProductAdmin";

/** 관리자 상품 목록 (Figma Admin: 61:2280 · 67:4075) — ?q= 검색어, ?category= 카테고리 */
export default function AdminProductsPage({ searchParams }: PageProps<"/admin/products">) {
  return (
    <Suspense fallback={<ProductAdminSkeleton />}>
      <ProductAdmin searchParams={searchParams} />
    </Suspense>
  );
}
