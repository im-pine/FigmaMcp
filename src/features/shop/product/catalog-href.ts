/*
 * 상품 목록 주소
 * - 전체: /products · 카테고리: /products/category/bread → 제목이 고정 문구라 미리 만든 화면에 들어간다 (스켈레톤 없음)
 * - 검색: /products/search?q=버터&category=bread → 제목에 결과 건수가 들어가므로 요청 때 그린다
 * - 정렬(sort)은 어느 쪽이든 주소 값으로 붙는다. 기본(인기순)은 넣지 않으므로 "latest"일 때만 받는다
 * 예전 주소(/products?category= · ?q=)는 next.config.ts의 redirects가 새 주소로 보낸다.
 */
export function catalogHref({ category, q, sort }: { category?: string; q?: string; sort?: string }) {
  const params = new URLSearchParams();
  if (q) params.set("q", q);
  if (q && category) params.set("category", category);
  if (sort) params.set("sort", sort);
  const query = params.toString();
  const path = q ? "/products/search" : category ? `/products/category/${category}` : "/products";
  return query ? `${path}?${query}` : path;
}
