import { BottomTabBar } from "./BottomTabBar";
import { CartHydrator } from "./CartHydrator";
import { FooterGate } from "./FooterGate";
import { MobileHeader } from "./MobileHeader";
import { ShopHeader } from "./ShopHeader";

/** 쇼핑몰 공통 틀: 데스크톱(lg↑) 헤더 · 푸터 / 모바일 헤더 · 하단 탭 바 (모바일 푸터는 홈에서만) */
export function ShopShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <CartHydrator />
      <ShopHeader />
      <MobileHeader />
      <main className="flex-1">{children}</main>
      <FooterGate />
      {/* 모바일: 하단 고정 탭 바에 가리지 않도록 높이만큼 여백 (푸터가 없는 화면도 동일) */}
      <div aria-hidden className="h-[calc(60px+env(safe-area-inset-bottom))] lg:hidden" />
      <BottomTabBar />
    </>
  );
}
