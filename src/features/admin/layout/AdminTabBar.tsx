"use client";

import { ArrowLeft, Inbox, type LucideIcon } from "lucide-react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { cn } from "@/shared/lib/utils";
import { ADMIN_NAV } from "./nav";

type Tab = { href: string; label: string; icon: LucideIcon; badge?: number; active: boolean };

/**
 * 모바일 하단 고정 탭 바 (Figma: AdminTabBar) — 상품 · 주문 · 접수 · 쇼핑몰.
 * 접수는 주문 접수 상태만 걸러 보여 주는 바로가기로, 새 주문 건수 배지를 붙인다.
 */
export function AdminTabBar({ receivedCount }: { receivedCount: number }) {
  return (
    <Suspense fallback={<TabBarView pathname="" status={null} receivedCount={receivedCount} />}>
      <TabBarWithPath receivedCount={receivedCount} />
    </Suspense>
  );
}

function TabBarWithPath({ receivedCount }: { receivedCount: number }) {
  return (
    <TabBarView
      pathname={usePathname()}
      status={useSearchParams().get("status")}
      receivedCount={receivedCount}
    />
  );
}

function TabBarView({
  pathname,
  status,
  receivedCount,
}: {
  pathname: string;
  status: string | null;
  receivedCount: number;
}) {
  const received = pathname === "/admin/orders" && status === "RECEIVED";
  const tabs: Tab[] = [
    ...ADMIN_NAV.map((n) => ({
      ...n,
      active:
        n.href === "/admin/orders" ? pathname.startsWith(n.href) && !received : pathname.startsWith(n.href),
    })),
    {
      href: "/admin/orders?status=RECEIVED",
      label: "접수",
      icon: Inbox,
      badge: receivedCount,
      active: received,
    },
    { href: "/", label: "쇼핑몰", icon: ArrowLeft, active: false },
  ];
  return (
    <nav
      aria-label="관리자 하단 메뉴"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-card pb-[env(safe-area-inset-bottom)] lg:hidden"
    >
      <ul className="mx-auto flex h-16 max-w-md px-4">
        {tabs.map(({ href, label, icon: Icon, badge, active }) => (
          <li key={label} className="flex-1">
            <Link
              href={href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex h-full flex-col items-center justify-center gap-1 type-body-sm",
                active ? "font-medium text-link" : "text-caption",
              )}
            >
              <span className="relative">
                <Icon className="size-6" strokeWidth={1.5} />
                {badge ? (
                  <span className="absolute -top-1.5 -right-2.5 flex min-w-[18px] items-center justify-center rounded-full bg-badge px-1 text-[11px] leading-[18px] font-bold text-on-badge">
                    {badge}
                  </span>
                ) : null}
              </span>
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
