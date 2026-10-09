"use server";

import { updateTag } from "next/cache";
import * as z from "zod";
import { PASSWORD_ERROR, type AdminActionResult } from "@/features/admin/common/action-result";
import { verifyAdminPassword } from "@/server/auth/admin-password";
import * as service from "@/server/services/product-admin";
import { ProductInputSchema } from "./schema";

const IdSchema = z.number().int().positive();

/** Server Action은 화면을 거치지 않고도 호출되므로 비밀번호 타입부터 확인한다 (문자열이 아니면 거부) */
function isAdminPassword(password: unknown): boolean {
  return typeof password === "string" && verifyAdminPassword(password);
}

function invalid(error: z.ZodError): AdminActionResult {
  return { ok: false, error: "invalid", fieldErrors: z.flattenError(error).fieldErrors };
}

/** 상품 등록 — slug는 영문 이름으로 만든다 */
export async function createProduct(password: unknown, input: unknown): Promise<AdminActionResult> {
  if (!isAdminPassword(password)) return PASSWORD_ERROR;
  const parsed = ProductInputSchema.safeParse(input);
  if (!parsed.success) return invalid(parsed.error);

  await service.createProduct(parsed.data);
  updateTag("products");
  return { ok: true };
}

/** 상품 수정 */
export async function updateProduct(
  password: unknown,
  input: { id: unknown; data: unknown },
): Promise<AdminActionResult> {
  if (!isAdminPassword(password)) return PASSWORD_ERROR;
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
export async function deleteProduct(password: unknown, input: { id: unknown }): Promise<AdminActionResult> {
  if (!isAdminPassword(password)) return PASSWORD_ERROR;
  const id = IdSchema.safeParse(input?.id);
  if (!id.success) return { ok: false, error: "not-found", message: "상품을 찾을 수 없어요." };

  const product = await service.deleteProduct(id.data);
  if (!product) return { ok: false, error: "not-found", message: "이미 삭제된 상품이에요." };
  updateTag("products");
  updateTag(`product:${product.slug}`);
  return { ok: true };
}
