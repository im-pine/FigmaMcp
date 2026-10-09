import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { db } from "@/server/db";

/*
 * 임시 로그인(데모 회원) 주문 내역.
 * 카카오 로그인을 붙이기 전까지, 시드가 만든 데모 주문(주문자 이름 "데모고객NN")을 한 회원의 주문으로 보여 준다.
 * 목록에는 개인정보(이름 · 연락처 · 주소)를 내려보내지 않는다.
 */
export const DEMO_MEMBER_NAME = "데모 회원";
const DEMO_ORDERER_PREFIX = "데모고객";

/**
 * 데모 회원 주문 목록 — 최근 주문 순.
 * 'orders' 태그로 캐시한다. 주문이 생기거나 상태가 바뀌면 그 Server Action에서 updateTag('orders')로 갱신한다.
 * (개인정보가 없는 목록이고 데모 회원 한 명의 데이터라 사용자별로 나누지 않는다)
 */
export async function getDemoMemberOrders() {
  "use cache";
  cacheLife("minutes");
  cacheTag("orders");
  return db.order.findMany({
    where: { ordererName: { startsWith: DEMO_ORDERER_PREFIX } },
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    select: {
      orderNo: true,
      createdAt: true,
      status: true,
      total: true,
      items: { select: { productName: true }, orderBy: { id: "asc" } },
    },
  });
}

/** 데모 회원 주문이면 상세 접근에 쓸 주문자 연락처를 돌려준다 (아니면 null) — Server Action 안에서만 쓴다 */
export async function getDemoMemberOrderPhone(orderNo: string) {
  const order = await db.order.findFirst({
    where: { orderNo, ordererName: { startsWith: DEMO_ORDERER_PREFIX } },
    select: { ordererPhone: true },
  });
  return order?.ordererPhone ?? null;
}
