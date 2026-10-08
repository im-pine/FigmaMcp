import { BottomTabBar } from "./BottomTabBar";
import { CartHydrator } from "./CartHydrator";
import { MobileHeader } from "./MobileHeader";
import { ShopFooter } from "./ShopFooter";
import { ShopHeader } from "./ShopHeader";

/** 쇼핑몰 공통 틀: 데스크톱(lg↑) 헤더 · 푸터 / 모바일 헤더 · 하단 탭 바 */
export function ShopShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <CartHydrator />
      <ShopHeader />
      <MobileHeader />
      <main className="flex-1">{children}</main>
      {/* 모바일은 하단 고정 탭 바 높이만큼 여백 */}
      <div className="pb-[calc(60px+env(safe-area-inset-bottom))] lg:pb-0">
        <ShopFooter />
      </div>
      <BottomTabBar />
    </>
  );
}
