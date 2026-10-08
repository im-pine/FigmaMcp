import "server-only";
import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { connection } from "next/server";
import { db } from "@/server/db";
import { maskAddress, maskName, maskPhone } from "@/shared/lib/mask";

/*
 * 비회원 주문 조회 — 주문번호와 주문자 연락처가 모두 맞아야 상세를 볼 수 있다.
 *
 * 접근 확인 방식
 * 1. Server Action이 grantOrderAccess()로 주문번호 + 연락처를 DB와 대조한다.
 * 2. 맞으면 그 주문 상세 경로(/mypage/orders/{orderNo})에만 실리는 httpOnly 쿠키에
 *    서명된 토큰(`만료시각.서명`)을 10분 동안 둔다.
 * 3. 상세 화면은 getAccessibleOrder()로 쿠키 토큰을 다시 검증한 뒤 마스킹된 주문만 돌려준다.
 *
 * 서명 키는 "주문번호 + DB에 저장된 연락처"에서 만든다. 연락처를 모르면 토큰을 만들 수 없으므로
 * 주문번호만 알거나 쿠키 값을 지어내서는 상세에 들어갈 수 없다(별도 비밀 환경 변수 없이 동작).
 */

const ACCESS_TTL_SECONDS = 10 * 60;
const COOKIE_NAME = "order_access";

const digits = (value: string) => value.replace(/\D/g, "");

function orderPath(orderNo: string) {
  return `/mypage/orders/${encodeURIComponent(orderNo)}`;
}

function sign(orderNo: string, phoneDigits: string, expiresAt: number): Buffer {
  const key = createHash("sha256").update(`order-access:${orderNo}:${phoneDigits}`).digest();
  return createHmac("sha256", key).update(`${orderNo}.${expiresAt}`).digest();
}

function safeEqual(a: Buffer, b: Buffer) {
  return a.length === b.length && timingSafeEqual(a, b);
}

/**
 * 주문번호와 주문자 연락처를 대조해, 맞으면 접근 쿠키를 설정하고 true를 돌려준다.
 * 어느 쪽이 틀렸는지는 구분하지 않는다. Server Action 안에서만 호출한다(쿠키 설정).
 */
export async function grantOrderAccess(input: { orderNo: string; ordererPhone: string }): Promise<boolean> {
  const order = await db.order.findUnique({
    where: { orderNo: input.orderNo },
    select: { orderNo: true, ordererPhone: true },
  });

  // 주문이 없을 때도 같은 비교를 거쳐 응답 시간으로 존재 여부가 드러나지 않게 한다.
  const expected = createHash("sha256")
    .update(digits(order?.ordererPhone ?? "no-order"))
    .digest();
  const given = createHash("sha256").update(digits(input.ordererPhone)).digest();
  if (!safeEqual(expected, given) || !order) return false;

  const expiresAt = Math.floor(Date.now() / 1000) + ACCESS_TTL_SECONDS;
  const token = `${expiresAt}.${sign(order.orderNo, digits(order.ordererPhone), expiresAt).toString("base64url")}`;

  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: orderPath(order.orderNo),
    maxAge: ACCESS_TTL_SECONDS,
  });
  return true;
}

/**
 * 접근 쿠키가 유효할 때만 주문 상세를 돌려준다. 이름 · 연락처 · 주소는 여기서 가린다.
 * 주문이 없거나 쿠키가 없거나 만료 · 위조된 경우 모두 null (구분하지 않음).
 */
export async function getAccessibleOrder(orderNo: string) {
  // 만료 확인에 현재 시각을 쓰므로 프리렌더 대상에서 빼고 요청 시점에만 실행한다.
  await connection();
  const token = (await cookies()).get(COOKIE_NAME)?.value;
  if (!token) return null;

  const [expiresRaw, signature] = token.split(".");
  const expiresAt = Number(expiresRaw);
  if (!signature || !Number.isInteger(expiresAt) || expiresAt < Date.now() / 1000) return null;

  const order = await db.order.findUnique({
    where: { orderNo },
    select: {
      orderNo: true,
      ordererPhone: true,
      recipientName: true,
      recipientPhone: true,
      address: true,
      requestNote: true,
      paymentMethod: true,
      status: true,
      subtotal: true,
      shippingFee: true,
      total: true,
      createdAt: true,
      items: {
        orderBy: { id: "asc" },
        select: {
          id: true,
          productName: true,
          unitPrice: true,
          quantity: true,
          giftWrap: true,
          lineTotal: true,
          product: { select: { imagePath: true } },
        },
      },
    },
  });
  if (!order) return null;

  const expected = sign(order.orderNo, digits(order.ordererPhone), expiresAt);
  if (!safeEqual(expected, Buffer.from(signature, "base64url"))) return null;

  // 연락처 원문(ordererPhone)은 검증에만 쓰고 내려보내지 않는다.
  const { ordererPhone: _verifiedOnly, ...rest } = order;
  void _verifiedOnly;
  return {
    ...rest,
    recipientName: maskName(order.recipientName),
    recipientPhone: maskPhone(order.recipientPhone),
    address: maskAddress(order.address),
  };
}

export type AccessibleOrder = NonNullable<Awaited<ReturnType<typeof getAccessibleOrder>>>;
