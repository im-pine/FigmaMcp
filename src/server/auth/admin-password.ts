import "server-only";
import { timingSafeEqual } from "node:crypto";

/** 관리자 데이터 변경 전 비밀번호 확인. 반드시 서버(Server Action 안)에서 호출한다. */
export function verifyAdminPassword(input: string): boolean {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) return false;
  const a = Buffer.from(input);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}
