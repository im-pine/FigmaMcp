import { shippingFeeFor } from "@/shared/constants/catalog";

// #test/필수 #test/금액 #test/단위
describe("배송비", () => {
  test("29,999원이면 배송비 3,000원이다", () => {
    expect(shippingFeeFor(29_999)).toBe(3000);
  });

  test("30,000원이면 배송비가 무료다", () => {
    expect(shippingFeeFor(30_000)).toBe(0);
  });

  test("30,001원이면 배송비가 무료다", () => {
    expect(shippingFeeFor(30_001)).toBe(0);
  });
});
