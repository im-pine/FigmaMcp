import { expect, test as base, type Page } from "@playwright/test";

/** 모든 E2E 테스트에서 브라우저 콘솔 에러 · 예외가 없는지 마지막에 확인한다 (#test/핵심흐름) */
export const test = base.extend<{ consoleErrors: string[] }>({
  consoleErrors: [
    async ({ page }, use) => {
      const errors: string[] = [];
      page.on("console", (msg) => {
        if (msg.type() === "error") errors.push(msg.text());
      });
      page.on("pageerror", (err) => errors.push(err.message));
      await use(errors);
      expect(errors, "브라우저 콘솔 에러").toEqual([]);
    },
    { auto: true },
  ],
});

export { expect };

export const ORDERER = { name: "홍길동", phone: "010-1234-5678", email: "e2e@example.com" };
export const RECIPIENT = { name: "김철수", phone: "010-9876-5432", address: "서울시 성동구 베이커리로 12" };

/** 주문서 채우기 — 라벨로 입력칸을 찾는다 (연락처 라벨은 두 개라 순서로 구분) */
export async function fillCheckout(page: Page) {
  await page.getByLabel("이름", { exact: true }).fill(ORDERER.name);
  await page.getByLabel("연락처", { exact: true }).nth(0).fill(ORDERER.phone);
  await page.getByLabel("이메일", { exact: true }).fill(ORDERER.email);
  await page.getByLabel("받는 분", { exact: true }).fill(RECIPIENT.name);
  await page.getByLabel("연락처", { exact: true }).nth(1).fill(RECIPIENT.phone);
  await page.getByLabel("주소", { exact: true }).fill(RECIPIENT.address);
  await page.getByLabel("상세 주소", { exact: true }).fill("101호");
}

/** 결제창에서 결제하고 주문 완료 화면의 주문번호를 돌려준다 */
export async function payAndGetOrderNo(page: Page) {
  await page
    .getByRole("button", { name: /결제하기$/ })
    .first()
    .click();
  const dialog = page.getByRole("dialog");
  await dialog.getByRole("button", { name: /결제하기$/ }).click();
  await page.waitForURL(/\/orders\/complete\?orderNo=/);
  return new URL(page.url()).searchParams.get("orderNo")!;
}
