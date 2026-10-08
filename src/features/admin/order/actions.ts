"use server";

import { updateTag } from "next/cache";
import * as z from "zod";
import { OrderSchema, OrderStatusSchema } from "@/generated/zod/schemas";
import { PASSWORD_ERROR, type AdminActionResult } from "@/features/admin/common/action-result";
import { verifyAdminPassword } from "@/server/auth/admin-password";
import { updateOrderStatuses } from "@/server/services/order/admin";

const ChangeStatusSchema = z.object({
  orderNos: z.array(OrderSchema.shape.orderNo.min(1)).min(1).max(500),
  status: OrderStatusSchema,
});

/** 주문 상태 변경 (1건 · 일괄 공용). 상태만 바꾼다 */
export async function changeOrderStatus(
  password: string,
  orderNos: string[],
  status: string,
): Promise<AdminActionResult> {
  if (typeof password !== "string" || !verifyAdminPassword(password)) return PASSWORD_ERROR;

  const parsed = ChangeStatusSchema.safeParse({ orderNos, status });
  if (!parsed.success) {
    return { ok: false, error: "invalid", fieldErrors: z.flattenError(parsed.error).fieldErrors };
  }

  const { updated, salesChanged } = await updateOrderStatuses(
    [...new Set(parsed.data.orderNos)],
    parsed.data.status,
  );
  if (updated > 0) updateTag("orders");
  if (salesChanged) updateTag("product-sales"); // 판매수가 바뀌었으니 인기순 목록 캐시 갱신
  return { ok: true };
}
