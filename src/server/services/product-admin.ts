import "server-only";
import type { Prisma, Product } from "@/generated/prisma/client";
import { db } from "@/server/db";

/*
 * 관리자 상품 등록 · 수정 · 삭제.
 * 조회는 쇼핑몰과 같은 getProducts(@/server/services/product)를 쓴다.
 * 캐시 갱신(updateTag)은 호출한 Server Action에서 한다.
 */

type ProductData = Omit<Prisma.ProductCreateInput, "slug" | "salesCount" | "orderItems">;

/** 영문 이름으로 slug를 만든다: "Butter Croissant" → butter-croissant. 이미 있으면 -2, -3을 붙인다 */
async function uniqueSlug(nameEn: string): Promise<string> {
  const base =
    nameEn
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60) || "product";
  const taken = new Set(
    (await db.product.findMany({ where: { slug: { startsWith: base } }, select: { slug: true } })).map(
      (p) => p.slug,
    ),
  );
  if (!taken.has(base)) return base;
  let n = 2;
  while (taken.has(`${base}-${n}`)) n++;
  return `${base}-${n}`;
}

export async function createProduct(data: ProductData): Promise<Product> {
  return db.product.create({ data: { ...data, slug: await uniqueSlug(data.nameEn) } });
}

/** 수정. 없으면 null. slug는 바꾸지 않는다 (쇼핑몰 주소 유지) */
export async function updateProduct(id: number, data: ProductData): Promise<Product | null> {
  const found = await db.product.findUnique({ where: { id }, select: { id: true } });
  if (!found) return null;
  return db.product.update({ where: { id }, data });
}

/** 삭제. 없으면 null. 주문 상품(OrderItem)은 productId만 비워지고 주문 기록은 남는다 */
export async function deleteProduct(id: number): Promise<Product | null> {
  const found = await db.product.findUnique({ where: { id }, select: { id: true } });
  if (!found) return null;
  return db.product.delete({ where: { id } });
}
