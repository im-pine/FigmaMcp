import "server-only";
import { Prisma, type Product } from "@/generated/prisma/client";
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

const MAX_SLUG_RETRY = 3;

/** Prisma 오류 코드 확인 (P2002: unique 충돌, P2025: 대상 없음) */
const isPrismaError = (error: unknown, code: string) =>
  error instanceof Prisma.PrismaClientKnownRequestError && error.code === code;

/** 등록. 같은 영문 이름으로 동시에 등록돼 slug가 겹치면(unique 충돌) slug를 다시 만들어 몇 번 더 시도한다 */
export async function createProduct(data: ProductData): Promise<Product> {
  for (let attempt = 1; ; attempt++) {
    try {
      return await db.product.create({ data: { ...data, slug: await uniqueSlug(data.nameEn) } });
    } catch (error) {
      if (!isPrismaError(error, "P2002") || attempt >= MAX_SLUG_RETRY) throw error;
    }
  }
}

/** 수정. 없으면 null. slug는 바꾸지 않는다 (쇼핑몰 주소 유지) */
export async function updateProduct(id: number, data: ProductData): Promise<Product | null> {
  // 확인과 수정 사이에 다른 관리자가 지웠을 수 있으므로 "대상 없음"(P2025)도 null로 돌려준다
  try {
    return await db.product.update({ where: { id }, data });
  } catch (error) {
    if (isPrismaError(error, "P2025")) return null;
    throw error;
  }
}

/** 삭제. 없으면 null. 주문 상품(OrderItem)은 productId만 비워지고 주문 기록은 남는다 */
export async function deleteProduct(id: number): Promise<Product | null> {
  // 동시에 두 번 지우면 두 번째는 "대상 없음"(P2025) → 이미 삭제된 상품으로 안내한다
  try {
    return await db.product.delete({ where: { id } });
  } catch (error) {
    if (isPrismaError(error, "P2025")) return null;
    throw error;
  }
}
