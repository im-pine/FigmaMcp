"use client";

import { Suspense } from "react";
import { usePathname } from "next/navigation";
import { cn } from "@/shared/lib/utils";
import { ShopFooter } from "./ShopFooter";

/*
 * 푸터 노출 규칙: 데스크톱(lg↑)은 모든 화면, 모바일은 홈(/)에서만 보인다.
 * usePathname은 동적 라우트에서 <Suspense> 안에 있어야 한다 (Cache Components).
 * fallback은 "홈이 아닌 화면"과 같은 모양(모바일 숨김)이라, 홈이 아닌 동적 화면에서 깜빡이지 않는다.
 */
export function FooterGate() {
  return (
    <Suspense fallback={<FooterBox homeOnly={false} />}>
      <FooterByPath />
    </Suspense>
  );
}

function FooterByPath() {
  return <FooterBox homeOnly={usePathname() === "/"} />;
}

function FooterBox({ homeOnly }: { homeOnly: boolean }) {
  return (
    <div className={cn(!homeOnly && "hidden lg:block")}>
      <ShopFooter />
    </div>
  );
}
