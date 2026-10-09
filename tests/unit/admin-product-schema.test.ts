import { describe, expect, test } from "@jest/globals";
import { ProductInputSchema } from "@/features/admin/product/schema";

const valid = {
  name: "버터 크루아상",
  nameEn: "Butter Croissant",
  description: "겹겹이 구운 크루아상",
  price: 4500,
  category: "BREAD",
  imagePath: "/images/products/butter-croissant.jpg",
  isBest: false,
  ingredients: "밀가루, 버터",
  allergens: "",
  storageGuide: "실온 보관",
};

// #test/필수 #test/입력검증 #test/단위
describe("관리자 상품 입력 검증", () => {
  test("정상값은 통과하고, 알레르기는 비워도 된다", () => {
    expect(ProductInputSchema.safeParse(valid).success).toBe(true);
  });

  test("필수값(상품명 · 원재료)이 비면 해당 필드 오류로 거부한다", () => {
    const r = ProductInputSchema.safeParse({ ...valid, name: "  ", ingredients: "" });
    expect(r.success).toBe(false);
    const fields = r.error!.issues.map((i) => i.path[0]);
    expect(fields).toEqual(expect.arrayContaining(["name", "ingredients"]));
  });

  test("가격이 0 · 음수 · 소수면 거부한다", () => {
    for (const price of [0, -100, 4500.5]) {
      expect(ProductInputSchema.safeParse({ ...valid, price }).success).toBe(false);
    }
  });

  test("고정 이미지 목록에 없는 경로는 거부한다 (업로드 · 외부 주소 불가)", () => {
    for (const imagePath of ["/images/products/hack.jpg", "https://example.com/a.jpg"]) {
      expect(ProductInputSchema.safeParse({ ...valid, imagePath }).success).toBe(false);
    }
  });

  test("없는 카테고리는 거부한다", () => {
    expect(ProductInputSchema.safeParse({ ...valid, category: "PIZZA" }).success).toBe(false);
  });
});
