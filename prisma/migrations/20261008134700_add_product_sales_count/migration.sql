-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "salesCount" INTEGER NOT NULL DEFAULT 0;

-- 기존 주문으로 판매수 채우기 (취소된 주문 제외). 이후에는 applySalesDelta가 주문마다 갱신한다.
UPDATE "Product" p
SET "salesCount" = s.qty
FROM (
  SELECT oi."productId", SUM(oi."quantity")::INTEGER AS qty
  FROM "OrderItem" oi
  JOIN "Order" o ON o."id" = oi."orderId"
  WHERE o."status" <> 'CANCELED' AND oi."productId" IS NOT NULL
  GROUP BY oi."productId"
) s
WHERE p."id" = s."productId";
