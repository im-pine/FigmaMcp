import Link from "next/link";
import { ShoppingBag, User } from "lucide-react";
import { SearchDialog } from "@/features/shop/search/components/SearchDialog";
import { Button } from "@/shared/ui/button";
import { CartCountBadge } from "./CartCountBadge";
import { CATEGORY_LINKS, SHOP_INFO } from "./nav";

/** 데스크톱 헤더 (Figma: Header) — lg 이상에서만 표시 */
export function ShopHeader() {
  return (
    <header className="sticky top-0 z-30 hidden border-b border-line bg-page lg:block">
      <div className="mx-auto flex h-20 max-w-[1440px] items-center justify-between px-20">
        <Link href="/" className="flex flex-col">
          <span className="type-h3 text-heading">{SHOP_INFO.name}</span>
          <span className="type-label text-caption">{SHOP_INFO.tagline}</span>
        </Link>

        <nav aria-label="카테고리" className="flex gap-10">
          {CATEGORY_LINKS.map((c) => (
            <Link key={c.slug} href={c.href} className="type-body-md text-body hover:text-heading">
              {c.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-5 text-heading">
          <SearchDialog />
          <Link href="/cart" aria-label="장바구니" className="relative">
            <ShoppingBag className="size-6" strokeWidth={1.5} />
            <CartCountBadge />
          </Link>
          <Link href="/mypage" aria-label="마이페이지">
            <User className="size-6" strokeWidth={1.5} />
          </Link>
          <Button asChild variant="secondary" size="sm">
            <Link href="/admin">관리자 페이지</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
