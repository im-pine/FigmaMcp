import { Suspense } from "react";
import { isMemberLoggedIn } from "@/server/auth/member-session";
import { AccountMenu, AccountMenuFallback } from "./AccountMenu";

/*
 * 마이페이지 아이콘 자리 (서버) — 로그인 쿠키를 읽어 AccountMenu에 넘긴다.
 * 쿠키는 요청 시점 값이라 <Suspense>로 감싸고, 그동안은 로그인 전 모양(링크)을 보여 준다.
 * fallback은 Suspense 바깥에서 그려지므로 usePathname을 쓰는 AccountMenu 대신 AccountMenuFallback을 쓴다.
 */
export function AccountEntry({ variant }: { variant: "header" | "tab" }) {
  return (
    <Suspense fallback={<AccountMenuFallback variant={variant} />}>
      <AccountEntryWithSession variant={variant} />
    </Suspense>
  );
}

async function AccountEntryWithSession({ variant }: { variant: "header" | "tab" }) {
  return <AccountMenu variant={variant} loggedIn={await isMemberLoggedIn()} />;
}
