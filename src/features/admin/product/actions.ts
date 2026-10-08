"use server";

import { updateTag } from "next/cache";
import * as z from "zod";
import { PASSWORD_ERROR, type AdminActionResult } from "@/features/admin/common/action-result";
import { verifyAdminPassword } from "@/server/auth/admin-password";
import * as service from "@/server/services/product-admin";
import { ProductInputSchema } from "./schema";

const IdSchema = z.number().int().positive();

function invalid(error: z.ZodError): AdminActionResult {
  return { ok: false, error: "invalid", fieldErrors: z.flattenError(error).fieldErrors };
}

/** 상품 등록 — slug는 영문 이름으로 만든다 */
export async function createProduct(password: string, input: unknown): Promise<AdminActionResult> {
  if (!verifyAdminPassword(password)) return PASSWORD_ERROR;
  const parsed = ProductInputSchema.safeParse(input);
  if (!parsed.success) return invalid(parsed.error);

  await service.createProduct(parsed.data);
  updateTag("products");
  return { ok: true };
}

/** 상품 수정 */
export async function updateProduct(
  password: string,
  input: { id: unknown; data: unknown },
): Promise<AdminActionResult> {
  if (!verifyAdminPassword(password)) return PASSWORD_ERROR;
  const id = IdSchema.safeParse(input?.id);
  if (!id.success) return { ok: false, error: "not-found", message: "상품을 찾을 수 없어요." };
  const parsed = ProductInputSchema.safeParse(input?.data);
  if (!parsed.success) return invalid(parsed.error);

  const product = await service.updateProduct(id.data, parsed.data);
  if (!product) return { ok: false, error: "not-found", message: "이미 삭제된 상품이에요." };
  updateTag("products");
  updateTag(`product:${product.slug}`);
  return { ok: true };
}

/** 상품 삭제 — 되돌릴 수 없다 */
export async function deleteProduct(password: string, input: { id: unknown }): Promise<AdminActionResult> {
  if (!verifyAdminPassword(password)) return PASSWORD_ERROR;
  const id = IdSchema.safeParse(input?.id);
  if (!id.success) return { ok: false, error: "not-found", message: "상품을 찾을 수 없어요." };

  const product = await service.deleteProduct(id.data);
  if (!product) return { ok: false, error: "not-found", message: "이미 삭제된 상품이에요." };
  updateTag("products");
  updateTag(`product:${product.slug}`);
  return { ok: true };
}
