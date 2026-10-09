/*
 * 관리자 Server Action 공통 결과.
 * - 비밀번호가 틀리면 { ok: false, error: "password" } — PasswordConfirm이 입력칸 아래에 안내를 띄운다.
 * - 입력 검증 실패는 { ok: false, error: "invalid", fieldErrors } — 폼이 필드별 안내를 띄운다.
 */
export type AdminActionResult =
  | { ok: true }
  | { ok: false; error: "password" }
  | { ok: false; error: "invalid"; fieldErrors: Record<string, string[] | undefined> }
  | { ok: false; error: "not-found" | "failed"; message?: string };

export const PASSWORD_ERROR = { ok: false, error: "password" } as const satisfies AdminActionResult;
