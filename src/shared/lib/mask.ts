/*
 * 개인정보 마스킹 — 반드시 서버(조회 단계)에서 적용한 뒤 클라이언트로 내려보낸다.
 */

/** 홍길동 → 홍*동, 김철 → 김* */
export function maskName(name: string): string {
  if (name.length <= 1) return "*";
  if (name.length === 2) return `${name[0]}*`;
  return `${name[0]}${"*".repeat(name.length - 2)}${name[name.length - 1]}`;
}

/** 010-1234-5678 → 010-****-5678 */
export function maskPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.length < 8) return "*".repeat(digits.length);
  return `${digits.slice(0, 3)}-****-${digits.slice(-4)}`;
}

/** 서울시 성동구 베이커리로 12 → 서울시 성동구 ******** (앞 두 단어만 남김) */
export function maskAddress(address: string): string {
  const words = address.trim().split(/\s+/);
  return [...words.slice(0, 2), "********"].join(" ");
}
