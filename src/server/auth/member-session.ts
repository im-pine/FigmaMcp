import "server-only";
import { cookies } from "next/headers";

/*
 * 임시 로그인(데모 회원) 상태 — 카카오 로그인 전까지 쓰는 데모용 세션.
 * httpOnly 쿠키라 새로고침 · 탭을 다시 열어도 유지되고(7일), 브라우저 코드로는 읽거나 바꿀 수 없다.
 * 데모 회원이 볼 수 있는 것은 시드의 데모 주문뿐이고, 개인정보는 서버에서 가린 값만 내려간다.
 */
const COOKIE_NAME = "member_session";
const MAX_AGE_SECONDS = 7 * 24 * 60 * 60;

export async function isMemberLoggedIn(): Promise<boolean> {
  return (await cookies()).get(COOKIE_NAME)?.value === "demo";
}

/** Server Action 안에서만 호출한다 (쿠키 설정) */
export async function startMemberSession() {
  (await cookies()).set(COOKIE_NAME, "demo", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE_SECONDS,
  });
}

/** Server Action 안에서만 호출한다 (쿠키 삭제) */
export async function endMemberSession() {
  (await cookies()).delete(COOKIE_NAME);
}
