/** @jest-environment jsdom */
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { catalogHref } from "@/features/shop/product/catalog-href";
import { CatalogFilterBar } from "@/features/shop/product/components/CatalogFilterBar";

const push = jest.fn();
jest.mock("next/navigation", () => ({ useRouter: () => ({ push }) }));

beforeEach(() => push.mockClear());

// #test/필수 #test/회귀 #test/단위 — PR #10: 카테고리 칩을 누르면 정렬(최신순)이 풀리던 버그
describe("상품 목록 필터", () => {
  test("최신순일 때 카테고리 칩을 눌러도 정렬이 유지된다", async () => {
    render(<CatalogFilterBar sort="latest" />);
    await userEvent.click(screen.getByRole("button", { name: "Cake" }));
    expect(push).toHaveBeenCalledWith("/products/category/cake?sort=latest", { scroll: false });
  });

  test("검색어를 지워도 카테고리와 정렬은 유지된다", async () => {
    render(<CatalogFilterBar category="bread" q="버터" sort="latest" />);
    await userEvent.click(screen.getByRole("button", { name: "검색어 '버터' 지우기" }));
    expect(push).toHaveBeenCalledWith("/products/category/bread?sort=latest", { scroll: false });
  });
});

// #test/필수 #test/핵심흐름 #test/단위 — 상품 목록 주소: 카테고리는 경로(미리 만든 화면), 검색은 /products/search
describe("상품 목록 주소", () => {
  test.each([
    [{}, "/products"],
    [{ sort: "latest" }, "/products?sort=latest"],
    [{ category: "bread" }, "/products/category/bread"],
    [{ category: "cake", sort: "latest" }, "/products/category/cake?sort=latest"],
    [{ q: "버터" }, "/products/search?q=%EB%B2%84%ED%84%B0"],
    [
      { q: "버터", category: "bread", sort: "latest" },
      "/products/search?q=%EB%B2%84%ED%84%B0&category=bread&sort=latest",
    ],
  ])("%j → %s", (input, expected) => {
    expect(catalogHref(input)).toBe(expected);
  });

  test("검색 중 카테고리 칩을 누르면 검색어를 유지한 채 검색 결과 주소로 간다", async () => {
    render(<CatalogFilterBar q="버터" />);
    await userEvent.click(screen.getByRole("button", { name: "Bread" }));
    expect(push).toHaveBeenCalledWith("/products/search?q=%EB%B2%84%ED%84%B0&category=bread", {
      scroll: false,
    });
  });
});
