"use client";

import { Lock } from "lucide-react";
import { usePathname } from "next/navigation";
import { Suspense } from "react";
import { adminTitle } from "./nav";

/** 데스크톱 상단 헤더 (Figma: AdminHeader) — 경로 + 접근 안내 */
export function AdminHeader() {
  return (
    <header className="sticky top-0 z-30 hidden h-16 items-center justify-between border-b border-line bg-page px-8 lg:flex">
      <p className="flex items-center gap-2 type-body-sm text-caption">
        관리자
        <span aria-hidden>/</span>
        <Suspense fallback={null}>
          <HeaderTitle />
        </Suspense>
      </p>
      <p className="flex items-center gap-1.5 rounded-pill bg-section px-3 py-1.5 type-body-sm text-caption">
        <Lock className="size-4" strokeWidth={1.5} />
        조회는 누구나 가능 · 변경은 비밀번호 확인 후 실행
      </p>
    </header>
  );
}

function HeaderTitle() {
  return <span className="font-medium text-heading">{adminTitle(usePathname())}</span>;
}
