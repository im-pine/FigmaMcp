import type { Category } from "@/generated/prisma/enums";
import { getProducts } from "@/server/services/product";
import { CATEGORIES } from "@/shared/constants/catalog";
import { ProductManager } from "./ProductManager";

/*
 * 관리자 상품 목록 — searchParams(요청 시점 값)를 읽으므로 페이지에서 <Suspense>로 감싼다.
 * 조회는 쇼핑몰과 같은 캐시(products 태그)를 쓰고, 변경 후 Server Action이 updateTag로 갱신한다.
 */
type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

const MAX_QUERY_LENGTH = 50;

export async function ProductAdmin({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const category = CATEGORIES.find((c) => c.value === params.category)?.value as Category | undefined;
  const q =
    typeof params.q === "string" ? params.q.trim().slice(0, MAX_QUERY_LENGTH) || undefined : undefined;

  const [all, products] = await Promise.all([getProducts(), getProducts({ category, q })]);

  return <ProductManager products={products} total={all.length} category={category} q={q} />;
}

/** Suspense fallback — 제목과 목록 자리 */
export function ProductAdminSkeleton() {
  return (
    <div aria-busy="true" aria-label="상품을 불러오는 중" className="flex flex-col gap-6 px-4 py-5 lg:p-8">
      <div className="h-14 w-60 rounded-card bg-section" />
      <div className="h-[480px] rounded-card bg-section" />
    </div>
  );
}
