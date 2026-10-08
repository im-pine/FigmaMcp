import "server-only";
import type { Prisma } from "@/generated/prisma/client";

/*
 * 상품 판매수(Product.salesCount) 갱신 — 판매수를 바꾸는 유일한 곳.
 *
 * - 원본은 OrderItem이고 salesCount는 인기순 정렬용 파생값이다. 어긋나면 `pnpm db:recount`로 바로잡는다.
 * - 주문을 만들거나 취소하는 트랜잭션 안에서 호출한다. 주문 저장과 같은 트랜잭션이라 판매수만 빠지는 일이 없다.
 * - Prisma update 대신 SQL 한 줄을 쓴다. Prisma update는 @updatedAt을 갱신해서, 상품이 팔릴 때마다
 *   「상품 정보 수정일」이 바뀌어 버린다. `SET n = n + x`는 DB가 원자적으로 처리해 동시 주문에도 값이 틀리지 않는다.
 */
export type SalesLine = { productId: number | null; quantity: number };

/** sign = 1: 판매 반영(주문 생성 · 취소 해제), sign = -1: 판매 취소 */
export async function applySalesDelta(tx: Prisma.TransactionClient, lines: SalesLine[], sign: 1 | -1) {
  // 같은 상품이 여러 줄이면 합친다
  const totals = new Map<number, number>();
  for (const line of lines) {
    if (line.productId == null) continue; // 삭제된 상품은 건너뜀
    totals.set(line.productId, (totals.get(line.productId) ?? 0) + line.quantity);
  }

  // 상품 번호순으로 갱신한다. 순서가 제각각이면 여러 상품이 든 주문 둘이 동시에 들어올 때
  // 서로의 행 락을 기다리다 교착(데드락)에 빠질 수 있다.
  for (const [productId, quantity] of [...totals].sort((a, b) => a[0] - b[0])) {
    await tx.$executeRaw`
      UPDATE "Product"
      SET "salesCount" = GREATEST("salesCount" + ${sign * quantity}, 0)
      WHERE "id" = ${productId}`;
  }
}
