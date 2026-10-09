import { Suspense } from "react";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { MyPage } from "@/features/shop/mypage/components/MyPage";
import { isMemberLoggedIn } from "@/server/auth/member-session";

export const metadata: Metadata = { title: "마이페이지 | Pine Bakery" };

/**
 * 로그인 · 비회원 조회 화면은 데이터가 없어 바로 그린다.
 * 로그인 상태 확인(쿠키)만 Suspense 안에서 따로 하고, 로그인 상태면 주문 내역으로 보낸다.
 */
export default function Page() {
  return (
    <>
      <MyPage />
      <Suspense>
        <RedirectIfMember />
      </Suspense>
    </>
  );
}

async function RedirectIfMember() {
  if (await isMemberLoggedIn()) redirect("/mypage/orders");
  return null;
}
