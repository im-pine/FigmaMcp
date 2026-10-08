import { SearchPanel } from "@/features/shop/search/components/SearchPanel";

/** 모바일 전체 화면 검색 (Figma: Mobile Search 17:1758). 데스크톱은 헤더의 검색 모달을 쓴다. */
export default function Page() {
  return (
    <section className="mx-auto w-full max-w-[760px] px-5 pt-8 pb-16 lg:pt-16">
      <h1 className="mb-6 type-h2 text-heading">검색</h1>
      <SearchPanel autoFocus hint="검색하면 상품 목록에서 결과를 필터링해 보여 드려요." />
    </section>
  );
}
