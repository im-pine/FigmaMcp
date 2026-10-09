import { CheckoutItemSchema, CheckoutItemsSchema, parseCheckout } from "@/features/shop/checkout/schema";

const valid = {
  ordererName: " 홍길동 ",
  ordererPhone: "010-1234-5678",
  ordererEmail: "test@example.com",
  recipientName: "김철수",
  recipientPhone: "01098765432",
  address: "서울시 성동구 베이커리로 12",
  addressDetail: "101호",
  requestNote: "",
  paymentMethod: "CARD",
  items: [{ productId: 1, quantity: 2, giftWrap: false }],
};

// #test/필수 #test/금액 #test/단위
describe("주문 수량", () => {
  test("수량 0개는 거부한다", () => {
    expect(CheckoutItemSchema.safeParse({ productId: 1, quantity: 0, giftWrap: false }).success).toBe(false);
  });

  test("수량 99개까지 허용하고 100개는 거부한다", () => {
    expect(CheckoutItemSchema.safeParse({ productId: 1, quantity: 99, giftWrap: false }).success).toBe(true);
    expect(CheckoutItemSchema.safeParse({ productId: 1, quantity: 100, giftWrap: false }).success).toBe(
      false,
    );
  });

  test("빈 장바구니는 거부한다", () => {
    expect(CheckoutItemsSchema.safeParse([]).success).toBe(false);
  });
});

// #test/필수 #test/입력검증 #test/단위
describe("주문서 입력 검증", () => {
  test("필수 항목이 비면 필드별 안내 문구를 돌려준다", () => {
    const result = parseCheckout({ ...valid, ordererName: "", address: "  " });
    expect(result.success).toBe(false);
    if (result.success) return;
    expect(result.errors.ordererName).toEqual(["주문자 이름을 입력하세요."]);
    expect(result.errors.address).toEqual(["주소를 입력하세요."]);
    expect(result.errors.ordererPhone).toBeUndefined();
  });

  test("전화번호 형식이 틀리면 거부한다", () => {
    const result = parseCheckout({ ...valid, ordererPhone: "1234" });
    expect(result.success).toBe(false);
    if (result.success) return;
    expect(result.errors.ordererPhone).toEqual(["연락처를 010-0000-0000 형식으로 입력하세요."]);
  });

  test("이메일 형식이 틀리면 거부한다", () => {
    const result = parseCheckout({ ...valid, ordererEmail: "not-an-email" });
    expect(result.success).toBe(false);
    if (result.success) return;
    expect(result.errors.ordererEmail).toEqual(["이메일 주소를 확인하세요."]);
  });

  test("정상값은 앞뒤 공백을 지운 뒤 통과하고, 빈 요청사항은 null이다", () => {
    const result = parseCheckout(valid);
    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data.ordererName).toBe("홍길동");
    expect(result.data.requestNote).toBeNull();
  });
});
