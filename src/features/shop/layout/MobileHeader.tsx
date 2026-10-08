import Link from "next/link";
import { BrandLogo } from "./BrandLogo";
import { SHOP_INFO } from "./nav";

/** 모바일 헤더 (Figma: MobileHeader) — 로고만 표시. 메뉴는 하단 탭 바가 담당 */
export function MobileHeader() {
  return (
    <header className="sticky top-0 z-30 flex h-[60px] items-center justify-center border-b border-line bg-page lg:hidden">
      <Link href="/" aria-label={SHOP_INFO.name}>
        <BrandLogo height={40} />
      </Link>
    </header>
  );
}
