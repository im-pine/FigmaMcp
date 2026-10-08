import Link from "next/link";
import { getProducts } from "@/server/services/product";
import { categoryFromSlug, CATEGORY_DISPLAY } from "../categories";
import { CatalogFilterBar } from "./CatalogFilterBar";
import { sortFromParam } from "../sort";
import { ProductCard } from "./ProductCard";
import { SortSelect } from "./SortSelect";

/*
 * 상품 목록 · 검색 결과 (Figma: Product List 7:171 / 9:995, Search Result 7:603 / 9:1159)
 * searchParams(요청 시점 값)를 읽으므로 페이지에서 <Suspense>로 감싼다.
 */
type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

const MAX_QUERY_LENGTH = 50;

export async function ProductCatalog({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const category = categoryFromSlug(params.category);
  const rawQ = typeof params.q === "string" ? params.q.trim().slice(0, MAX_QUERY_LENGTH) : "";
  const q = rawQ || undefined;

  const sort = sortFromParam(params.sort);

  const products = await getProducts({ category: category?.value, q, sort });

  return (
    <>
      <header className="bg-section">
        <div className="mx-auto max-w-[1440px] px-5 py-8 lg:px-20 lg:py-[72px]">
          <p className="type-label text-link">{q ? "Search" : "Shop"}</p>
          <h1 className="mt-2 type-h2 text-heading lg:mt-3 lg:type-h1">
            {q ? `'${q}' 검색 결과` : (category?.label ?? "All Products")}
          </h1>
          <p className="mt-3 hidden type-body-md text-body lg:block">
            {q
              ? `${products.length}개의 상품을 찾았어요.`
              : category
                ? CATEGORY_DISPLAY[category.value].description
                : "오늘 구운 빵과 디저트, 음료를 한 곳에서 만나보세요."}
          </p>
        </div>
      </header>

      <section className="mx-auto max-w-[1440px] px-5 pt-6 pb-16 lg:px-20 lg:pt-10 lg:pb-24">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <CatalogFilterBar category={category?.slug} q={q} sort={sort === "latest" ? sort : undefined} />
          <div className="flex shrink-0 items-center gap-4 type-body-sm text-caption">
            <span>{q ? `${products.length}개의 상품` : `총 ${products.length}개`}</span>
            <SortSelect value={sort} />
          </div>
        </div>

        {products.length > 0 ? (
          <ul className="mt-5 grid grid-cols-2 gap-x-4 gap-y-8 lg:mt-10 lg:grid-cols-4 lg:gap-x-6 lg:gap-y-12">
            {products.map((p) => (
              <li key={p.id}>
                <ProductCard product={p} />
              </li>
            ))}
          </ul>
        ) : (
          <div className="mt-10 flex flex-col items-center gap-4 rounded-card bg-card px-5 py-16 text-center">
            <p className="type-title text-heading">찾는 상품이 없어요</p>
            <p className="type-body-sm text-caption">다른 검색어나 카테고리로 다시 찾아보세요.</p>
            <Link href="/products" className="type-body-sm text-link underline-offset-4 hover:underline">
              전체 상품 보기
            </Link>
          </div>
        )}
      </section>
    </>
  );
}

/** Suspense fallback — 헤더 띠와 상품 카드 자리 */
export function ProductCatalogSkeleton() {
  return (
    <div aria-busy="true" aria-label="상품을 불러오는 중">
      <div className="h-[132px] bg-section lg:h-[244px]" />
      <div className="mx-auto grid max-w-[1440px] grid-cols-2 gap-x-4 gap-y-8 px-5 pt-[88px] pb-16 lg:grid-cols-4 lg:gap-x-6 lg:px-20 lg:pt-[120px]">
        {Array.from({ length: 8 }, (_, i) => (
          <div key={i} className="aspect-square animate-pulse rounded-card bg-section" />
        ))}
      </div>
    </div>
  );
}
