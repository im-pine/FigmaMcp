/** @jest-environment jsdom */
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CatalogFilterBar } from "@/features/shop/product/components/CatalogFilterBar";

const push = jest.fn();
jest.mock("next/navigation", () => ({ useRouter: () => ({ push }) }));

beforeEach(() => push.mockClear());

// #test/필수 #test/회귀 #test/단위 — PR #10: 카테고리 칩을 누르면 정렬(최신순)이 풀리던 버그
describe("상품 목록 필터", () => {
  test("최신순일 때 카테고리 칩을 눌러도 정렬이 유지된다", async () => {
    render(<CatalogFilterBar sort="latest" />);
    await userEvent.click(screen.getByRole("button", { name: "Cake" }));
    expect(push).toHaveBeenCalledWith("/products?category=cake&sort=latest", { scroll: false });
  });

  test("검색어를 지워도 카테고리와 정렬은 유지된다", async () => {
    render(<CatalogFilterBar category="bread" q="버터" sort="latest" />);
    await userEvent.click(screen.getByRole("button", { name: "검색어 '버터' 지우기" }));
    expect(push).toHaveBeenCalledWith("/products?category=bread&sort=latest", { scroll: false });
  });
});
