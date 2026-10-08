"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense, useState } from "react";
import { LayoutGrid, Lock, Search, ShoppingBag, User, X, type LucideIcon } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { CartCountBadge } from "./CartCountBadge";
import { ProductsBubbleMenu } from "./ProductsBubbleMenu";

/** 모바일 하단 고정 탭 바 (Figma: BottomTabBar) — lg 미만에서만 표시 */
type Tab = { href: string; label: string; icon: LucideIcon; match: (path: string) => boolean };

const LEFT: Tab[] = [
  { href: "/search", label: "검색", icon: Search, match: (p) => p.startsWith("/search") },
  {
    href: "/cart",
    label: "장바구니",
    icon: ShoppingBag,
    match: (p) => p.startsWith("/cart") || p.startsWith("/checkout"),
  },
];
const RIGHT: Tab[] = [
  { href: "/mypage", label: "마이페이지", icon: User, match: (p) => p.startsWith("/mypage") },
  { href: "/admin", label: "관리자", icon: Lock, match: (p) => p.startsWith("/admin") },
];

/*
 * usePathname은 동적 라우트에서 <Suspense> 안에 있어야 한다 (Cache Components).
 * fallback은 활성 탭 없이 같은 바를 그려, 바가 늦게 나타나지 않게 한다.
 */
export function BottomTabBar() {
  return (
    <Suspense fallback={<BottomTabBarView pathname="" />}>
      <BottomTabBarWithPath />
    </Suspense>
  );
}

function BottomTabBarWithPath() {
  return <BottomTabBarView pathname={usePathname()} />;
}

function BottomTabBarView({ pathname }: { pathname: string }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <ProductsBubbleMenu open={open} onClose={() => setOpen(false)} />
      <nav
        aria-label="하단 메뉴"
        className="fixed inset-x-0 bottom-0 z-50 border-t border-line bg-card pb-[env(safe-area-inset-bottom)] shadow-card lg:hidden"
      >
        <ul className="mx-auto flex h-[60px] max-w-md items-end pb-2">
          {LEFT.map((t) => (
            <TabLink key={t.href} tab={t} active={t.match(pathname)} />
          ))}
          <li className="flex flex-1 flex-col items-center gap-1">
            <button
              type="button"
              aria-expanded={open}
              aria-label={open ? "카테고리 닫기" : "상품 카테고리 열기"}
              onClick={() => setOpen((v) => !v)}
              className={cn(
                "-mt-7 flex size-14 items-center justify-center rounded-full text-on-action outline-4 outline-card transition-colors duration-180",
                open ? "bg-inverse" : "bg-action",
              )}
            >
              {open ? <X className="size-6" /> : <LayoutGrid className="size-6" />}
            </button>
            <span className={cn("type-label tracking-normal", open ? "text-heading" : "text-link")}>
              상품
            </span>
          </li>
          {RIGHT.map((t) => (
            <TabLink key={t.href} tab={t} active={t.match(pathname)} />
          ))}
        </ul>
      </nav>
    </>
  );
}

function TabLink({ tab, active }: { tab: Tab; active: boolean }) {
  const Icon = tab.icon;
  return (
    <li className="flex flex-1 justify-center">
      <Link
        href={tab.href}
        aria-current={active ? "page" : undefined}
        className={cn("flex flex-col items-center gap-1", active ? "text-link" : "text-caption")}
      >
        <span className="relative">
          <Icon className="size-6" strokeWidth={1.5} />
          {tab.href === "/cart" && <CartCountBadge />}
        </span>
        <span className={cn("text-[11px]", active && "font-medium")}>{tab.label}</span>
      </Link>
    </li>
  );
}
