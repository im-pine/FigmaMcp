import { expect, test } from "./fixtures";

const PASSWORD = process.env.ADMIN_PASSWORD ?? "";

// #test/조건부 #test/반응형 #test/E2E — 관리자 모바일은 카드 · 하단 시트 구조라 상태 변경을 한 번 더 확인한다
test("관리자 모바일: 접수 탭에서 주문 상태를 배송 준비중으로 바꾸면 접수 목록에서 빠진다", async ({
  page,
}) => {
  await page.goto("/admin/products");
  await page
    .getByRole("navigation", { name: "관리자 하단 메뉴" })
    .getByRole("link", { name: /접수/ })
    .click();
  await page.waitForURL("**/admin/orders?status=RECEIVED");

  const orderNo = "20261007-0003"; // 시드의 주문 접수 주문
  await expect(page.getByText(orderNo).filter({ visible: true })).toBeVisible();

  await page
    .getByRole("button", { name: `주문 ${orderNo} 상태 변경` })
    .filter({ visible: true })
    .click();
  await page.getByRole("radio", { name: "배송 준비중" }).click();

  await page.getByLabel("비밀번호", { exact: true }).fill(PASSWORD);
  await page.getByRole("button", { name: "확인" }).click();

  await expect(page.getByText(orderNo).filter({ visible: true })).toHaveCount(0);
});
