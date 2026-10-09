import { expect, test } from "./fixtures";

const PASSWORD = process.env.ADMIN_PASSWORD ?? "";

// #test/필수 #test/핵심흐름 #test/E2E · #test/필수 #test/권한 #test/E2E
test("관리자: 주문 2건을 골라 상태를 일괄 변경한다 — 틀린 비밀번호는 막히고, 맞으면 반영된다", async ({
  page,
}) => {
  await page.goto("/admin/orders");
  const table = page.getByRole("table");
  // 시드의 배송 준비중 주문 2건
  for (const orderNo of ["20261005-0001", "20261006-0003"]) {
    await table.getByRole("checkbox", { name: `주문 ${orderNo} 선택` }).click();
  }
  await expect(page.getByText("2건 선택됨")).toBeVisible();

  await page.getByRole("button", { name: "상태 일괄 변경" }).click();
  await page.getByRole("menuitem", { name: "배송중" }).click();

  const dialog = page.getByRole("dialog", { name: "상태 일괄 변경" });
  await dialog.getByLabel("비밀번호").fill("wrong-password");
  await dialog.getByRole("button", { name: "확인" }).click();
  await expect(dialog.getByRole("alert")).toHaveText("비밀번호가 맞지 않아요.");

  await dialog.getByLabel("비밀번호").fill(PASSWORD);
  await dialog.getByRole("button", { name: "확인" }).click();
  await expect(dialog).toBeHidden();

  // 새로고침 없이 두 주문 모두 배송중으로 바뀌고 선택이 풀린다
  for (const orderNo of ["20261005-0001", "20261006-0003"]) {
    const row = table.getByRole("row").filter({ hasText: orderNo });
    await expect(row.getByText("배송중", { exact: true })).toBeVisible();
  }
  await expect(page.getByText("2건 선택됨")).toBeHidden();
});
