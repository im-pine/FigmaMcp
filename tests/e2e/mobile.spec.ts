import { expect, fillCheckout, payAndGetOrderNo, test } from "./fixtures";

// #test/조건부 #test/반응형 #test/E2E — 모바일(390px)은 하단 탭 바 구조라 핵심 흐름을 한 번 더 확인한다
test("모바일: 상세에서 담고 하단 탭 바로 장바구니에 가서 주문을 끝낸다", async ({ page }) => {
  await page.goto("/products/butter-croissant");
  await page.getByRole("button", { name: "장바구니 담기" }).click();

  await page
    .getByRole("navigation", { name: "하단 메뉴" })
    .getByRole("link", { name: /장바구니/ })
    .click();
  await page.waitForURL("**/cart");
  await page.getByRole("link", { name: "주문하기" }).click();
  await page.waitForURL("**/checkout");

  await fillCheckout(page);
  const orderNo = await payAndGetOrderNo(page);
  await expect(page.getByText(orderNo)).toBeVisible();
});
