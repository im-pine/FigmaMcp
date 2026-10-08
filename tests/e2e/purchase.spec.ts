import { expect, fillCheckout, payAndGetOrderNo, RECIPIENT, ORDERER, test } from "./fixtures";

// #test/필수 #test/핵심흐름 #test/E2E · #test/조건부 #test/클라이언트상태 #test/E2E
test("상세 → 담기 → 장바구니 → 주문서 → 결제 → 주문 완료, 완료 후 장바구니가 비워진다", async ({ page }) => {
  await page.goto("/products/butter-croissant");
  await page.getByRole("button", { name: /선물 포장/ }).click();
  await page.getByRole("button", { name: "수량 늘리기" }).click();
  await page.getByRole("button", { name: "장바구니 담기" }).click();
  await expect(page.getByText("장바구니에 담았어요.")).toBeVisible();

  // 새로고침해도 장바구니가 유지된다
  await page.goto("/cart");
  await page.reload();
  // 장바구니는 데스크톱 · 모바일 마크업이 함께 있어 화면에 보이는 것만 센다
  const croissantInCart = page
    .getByRole("main")
    .getByRole("link", { name: "버터 크루아상" })
    .filter({ visible: true });
  await expect(croissantInCart.first()).toBeVisible();

  await page.getByRole("link", { name: "주문하기" }).click();
  await page.waitForURL("**/checkout");
  await fillCheckout(page);
  const orderNo = await payAndGetOrderNo(page);
  expect(orderNo).toMatch(/^\d{8}-\d{4}$/);
  await expect(page.getByText(orderNo)).toBeVisible();

  await page.goto("/cart");
  await expect(croissantInCart).toHaveCount(0);
});

// #test/필수 #test/핵심흐름 #test/E2E · #test/필수 #test/개인정보
test("주문 완료 번호와 연락처로 조회하면 주문 상세가 마스킹돼 보인다", async ({ page }) => {
  await page.goto("/products/campagne");
  await page.getByRole("button", { name: "장바구니 담기" }).click();
  await page.goto("/checkout");
  await fillCheckout(page);
  const orderNo = await payAndGetOrderNo(page);

  await page.goto("/mypage");
  await page.getByLabel("주문번호").fill(orderNo);
  await page.getByLabel("주문자 연락처").fill(ORDERER.phone);
  await page.getByRole("button", { name: "주문 조회" }).click();
  await page.waitForURL(`**/mypage/orders/${orderNo}`);

  const main = page.getByRole("main");
  await expect(main.getByText("김*수")).toBeVisible();
  await expect(main.getByText("010-****-5432")).toBeVisible();
  await expect(main).not.toContainText(RECIPIENT.name);
  await expect(main).not.toContainText(RECIPIENT.address);
});

// #test/필수 #test/핵심흐름 #test/E2E · #test/필수 #test/입력검증
test("빈 주문서를 제출하면 필드별 오류가 보이고, 채우면 주문된다", async ({ page }) => {
  await page.goto("/products/salt-bread");
  await page.getByRole("button", { name: "장바구니 담기" }).click();
  await page.goto("/checkout");

  await page
    .getByRole("button", { name: /결제하기$/ })
    .first()
    .click();
  await expect(page.getByText("주문자 이름을 입력하세요.")).toBeVisible();
  await expect(page.getByText("주소를 입력하세요.")).toBeVisible();
  await expect(page.getByRole("dialog")).toHaveCount(0);

  await fillCheckout(page);
  const orderNo = await payAndGetOrderNo(page);
  expect(orderNo).toMatch(/^\d{8}-\d{4}$/);
});
