import { Suspense } from "react";
import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { SearchDialog } from "@/features/shop/search/components/SearchDialog";
import { Button } from "@/shared/ui/button";
import { BrandLogo } from "@/shared/ui/BrandLogo";
import { AccountEntry } from "./AccountEntry";
import { CartCountBadge } from "./CartCountBadge";
import { HeaderNav, HeaderNavLinks } from "./HeaderNav";
import { SHOP_INFO } from "./nav";

/** 데스크톱 헤더 (Figma: Header) — lg 이상에서만 표시 */
export function ShopHeader() {
  return (
    <header className="sticky top-0 z-30 hidden border-b border-line bg-page lg:block">
      <div className="mx-auto flex h-20 max-w-[1440px] items-center justify-between px-20">
        <Link href="/" aria-label={SHOP_INFO.name}>
          <BrandLogo height={56} />
        </Link>

        <Suspense fallback={<HeaderNavLinks />}>
          <HeaderNav />
        </Suspense>

        <div className="flex items-center gap-5 text-heading">
          <SearchDialog />
          <Link href="/cart" aria-label="장바구니" className="relative">
            <ShoppingBag className="size-6" strokeWidth={1.5} />
            <CartCountBadge />
          </Link>
          <AccountEntry variant="header" />
          <Button asChild variant="secondary" size="sm">
            <Link href="/admin/products">관리자 페이지</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
