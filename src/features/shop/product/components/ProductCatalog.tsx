import { Suspense } from "react";
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

/** 주소 값(카테고리 · 검색어 · 정렬)을 검증해 읽는다 */
async function readCatalogParams(searchParams: SearchParams) {
  const params = await searchParams;
  const rawQ = typeof params.q === "string" ? params.q.trim().slice(0, MAX_QUERY_LENGTH) : "";
  return {
    category: categoryFromSlug(params.category),
    q: rawQ || undefined,
    sort: sortFromParam(params.sort),
  };
}

/*
 * 상품 목록 · 검색 결과 페이지.
 * 제목 띠와 목록 영역의 틀(배경 · 여백)은 바로 그리고, 주소 값 · 데이터가 필요한 곳만 <Suspense>로 채운다.
 * - 제목 · 설명 → <CatalogTitle /> / 필터 · 건수 · 정렬 · 카드 → <CatalogBody />
 * (상품 조회는 'use cache'라 두 곳에서 불러도 같은 결과를 한 번만 계산한다)
 */
export function ProductCatalog({ searchParams }: { searchParams: SearchParams }) {
  return (
    <>
      <header className="bg-section">
        <div className="mx-auto max-w-[1440px] px-5 py-6 lg:px-20 lg:pt-[38px] lg:pb-[42px]">
          <Suspense fallback={<CatalogTitleSkeleton />}>
            <CatalogTitle searchParams={searchParams} />
          </Suspense>
        </div>
      </header>

      <section className="mx-auto max-w-[1440px] px-5 pt-6 pb-16 lg:px-20 lg:pt-10 lg:pb-24">
        <Suspense fallback={<CatalogBodySkeleton />}>
          <CatalogBody searchParams={searchParams} />
        </Suspense>
      </section>
    </>
  );
}

async function CatalogTitle({ searchParams }: { searchParams: SearchParams }) {
  const { category, q, sort } = await readCatalogParams(searchParams);
  const count = q ? (await getProducts({ category: category?.value, q, sort })).length : 0;
  return (
    <>
      <h1 className="type-h2 text-heading lg:type-h1">
        {q ? `'${q}' 검색 결과` : (category?.label ?? "All Products")}
      </h1>
      <p className="mt-3 hidden type-body-md text-body lg:block">
        {q
          ? `${count}개의 상품을 찾았어요.`
          : category
            ? CATEGORY_DISPLAY[category.value].description
            : "오늘 구운 빵과 디저트, 음료를 한 곳에서 만나보세요."}
      </p>
    </>
  );
}

async function CatalogBody({ searchParams }: { searchParams: SearchParams }) {
  const { category, q, sort } = await readCatalogParams(searchParams);
  const products = await getProducts({ category: category?.value, q, sort });

  return (
    <>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <CatalogFilterBar category={category?.slug} q={q} sort={sort === "latest" ? sort : undefined} />
        <div className="flex shrink-0 items-center justify-between gap-4 type-body-sm text-caption lg:justify-end">
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
    </>
  );
}

/** 제목 자리 — 실제 제목 · 설명과 같은 높이 */
function CatalogTitleSkeleton() {
  return (
    <div aria-hidden className="animate-pulse">
      <div className="h-[41.6px] w-48 rounded bg-line/50 lg:h-[50px] lg:w-72" />
      <div className="mt-3 hidden h-6 w-80 rounded bg-line/50 lg:block" />
    </div>
  );
}

/** 필터 · 카드 자리 */
function CatalogBodySkeleton() {
  return (
    <div aria-busy="true" aria-label="상품을 불러오는 중" className="animate-pulse">
      <div className="flex gap-2 lg:gap-3">
        {Array.from({ length: 5 }, (_, i) => (
          <div key={i} className="h-10 w-20 shrink-0 rounded-pill bg-section" />
        ))}
      </div>
      <div className="mt-5 grid grid-cols-2 gap-x-4 gap-y-8 lg:mt-10 lg:grid-cols-4 lg:gap-x-6 lg:gap-y-12">
        {Array.from({ length: 8 }, (_, i) => (
          <div key={i} className="aspect-square rounded-card bg-section" />
        ))}
      </div>
    </div>
  );
}
