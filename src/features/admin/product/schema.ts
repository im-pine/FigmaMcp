import * as z from "zod";
import { ProductSchema } from "@/generated/zod/schemas";

/** 고를 수 있는 상품 이미지 — public/images/products/의 고정 이미지 12장 (업로드 없음). 순서는 Figma 이미지 선택 영역과 같다 */
export const PRODUCT_IMAGES = [
  "/images/products/butter-croissant.jpg",
  "/images/products/campagne.jpg",
  "/images/products/salt-bread.jpg",
  "/images/products/baguette.jpg",
  "/images/products/strawberry-cake.jpg",
  "/images/products/basque-cheesecake.jpg",
  "/images/products/chocolate-brownie.jpg",
  "/images/products/chocolate-chip-cookie.jpg",
  "/images/products/earl-grey-scone.jpg",
  "/images/products/butter-cookie.jpg",
  "/images/products/americano.jpg",
  "/images/products/royal-milk-tea.jpg",
] as const;

const text = (max: number, required?: string) =>
  required
    ? z.string().trim().min(1, required).max(max, `${max}자 이내로 입력해 주세요.`)
    : z.string().trim().max(max, `${max}자 이내로 입력해 주세요.`);

/** 상품 등록 · 수정 입력 — 생성된 ProductSchema에서 사용자가 고칠 수 있는 필드만 골라 안내 문구를 붙인다 */
export const ProductInputSchema = ProductSchema.pick({
  name: true,
  nameEn: true,
  description: true,
  price: true,
  category: true,
  imagePath: true,
  isBest: true,
  ingredients: true,
  allergens: true,
  storageGuide: true,
}).extend({
  name: text(40, "상품명을 입력해 주세요."),
  nameEn: text(60, "영문 이름을 입력해 주세요."),
  description: text(300, "설명을 입력해 주세요."),
  price: z
    .number({ error: "가격을 입력해 주세요." })
    .int("가격은 원 단위 숫자로 입력해 주세요.")
    .positive("가격을 입력해 주세요.")
    .max(10_000_000, "가격이 너무 커요."),
  imagePath: z.enum(PRODUCT_IMAGES, { error: "이미지를 골라 주세요." }),
  ingredients: text(200, "원재료를 입력해 주세요."),
  allergens: text(100),
  storageGuide: text(200, "보관 방법을 입력해 주세요."),
});

export type ProductInput = z.infer<typeof ProductInputSchema>;
