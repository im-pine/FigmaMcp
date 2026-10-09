"use server";

import * as z from "zod";
import { redirect } from "next/navigation";
import { OrderSchema } from "@/generated/zod/schemas";
import { grantOrderAccess } from "@/server/services/order/lookup";
import { getDemoMemberOrderPhone } from "@/server/services/order/member";
import { endMemberSession, isMemberLoggedIn, startMemberSession } from "@/server/auth/member-session";

export type LookupState = {
  errors?: { orderNo?: string[]; ordererPhone?: string[]; form?: string[] };
  /** 실패 후에도 입력값을 유지하기 위해 돌려준다 (사용자가 방금 입력한 값) */
  values?: { orderNo: string; ordererPhone: string };
};

/** 조회 실패 메시지 — 주문번호와 연락처 중 무엇이 틀렸는지 드러내지 않는다 */
const LOOKUP_FAILED = "주문 정보를 찾을 수 없어요. 주문번호와 연락처를 다시 확인해 주세요.";

const LookupSchema = z.object({
  orderNo: OrderSchema.shape.orderNo.trim().min(1, "주문번호를 입력해 주세요."),
  ordererPhone: z
    .string()
    .transform((v) => v.replace(/\D/g, ""))
    .pipe(z.string().min(9, "연락처를 숫자로 정확히 입력해 주세요.")),
});

export async function lookupOrder(_prev: LookupState, formData: FormData): Promise<LookupState> {
  const values = {
    orderNo: String(formData.get("orderNo") ?? ""),
    ordererPhone: String(formData.get("ordererPhone") ?? ""),
  };
  const parsed = LookupSchema.safeParse(values);
  if (!parsed.success) {
    return { errors: z.flattenError(parsed.error).fieldErrors, values };
  }

  const granted = await grantOrderAccess(parsed.data);
  if (!granted) return { errors: { form: [LOOKUP_FAILED] }, values };

  redirect(`/mypage/orders/${encodeURIComponent(parsed.data.orderNo)}`);
}

/** 임시 로그인 주문 내역 → 상세 보기. 데모 회원 주문일 때만 접근 쿠키를 주고 상세로 이동한다 */
export async function openMemberOrder(formData: FormData) {
  if (!(await isMemberLoggedIn())) redirect("/mypage");
  const parsed = OrderSchema.shape.orderNo.trim().min(1).safeParse(formData.get("orderNo"));
  if (!parsed.success) redirect("/mypage/orders");

  const phone = await getDemoMemberOrderPhone(parsed.data);
  if (!phone || !(await grantOrderAccess({ orderNo: parsed.data, ordererPhone: phone }))) {
    redirect("/mypage/orders");
  }
  redirect(`/mypage/orders/${encodeURIComponent(parsed.data)}`);
}

/** 임시 로그인 — 로그인 상태를 쿠키에 남기고 주문 내역으로 이동한다 */
export async function memberLogin() {
  await startMemberSession();
  redirect("/mypage/orders");
}

/** 로그아웃 — 로그인 상태를 지우고 마이페이지(로그인 화면)로 이동한다 */
export async function memberLogout() {
  await endMemberSession();
  redirect("/mypage");
}
