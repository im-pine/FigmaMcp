import Link from "next/link";
import { BrandLogo } from "@/shared/ui/BrandLogo";

/** 모바일 헤더 (Figma: AdminMobileHeader) — 로고만, 메뉴는 하단 탭 바 */
export function AdminMobileHeader() {
  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-center gap-2 border-b border-line bg-page lg:hidden">
      <Link href="/admin/products" aria-label="Pine Bakery 관리자">
        <BrandLogo height={36} />
      </Link>
      <span className="rounded-pill bg-section px-2 py-0.5 type-label text-caption">ADMIN</span>
    </header>
  );
}
