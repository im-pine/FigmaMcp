"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense } from "react";
import { cn } from "@/shared/lib/utils";
import { ADMIN_NAV } from "./nav";
import { BrandLogo } from "@/shared/ui/BrandLogo";

/** 데스크톱 사이드바 (Figma: AdminSidebar) — lg 이상에서만 표시 */
export function AdminSidebar() {
  return (
    <aside className="sticky top-0 hidden h-dvh w-60 shrink-0 flex-col border-r border-line bg-card px-4 py-6 lg:flex">
      <Link
        href="/admin/products"
        aria-label="Pine Bakery 관리자"
        className="flex items-center gap-2.5 px-3 pb-7"
      >
        <BrandLogo height={44} />
        <span className="rounded-pill bg-section px-2 py-0.5 type-label text-caption">ADMIN</span>
      </Link>
      <p className="px-3 pb-2 type-label text-caption">메뉴</p>
      <Suspense fallback={<SidebarNav pathname="" />}>
        <SidebarNavWithPath />
      </Suspense>
      <Link
        href="/"
        className="mt-auto flex items-center gap-2 px-3 py-2.5 type-body-sm text-link hover:underline"
      >
        <ArrowLeft className="size-[18px]" strokeWidth={1.5} />
        쇼핑몰로 돌아가기
      </Link>
    </aside>
  );
}

function SidebarNavWithPath() {
  return <SidebarNav pathname={usePathname()} />;
}

function SidebarNav({ pathname }: { pathname: string }) {
  return (
    <nav aria-label="관리자 메뉴">
      <ul className="flex flex-col gap-1">
        {ADMIN_NAV.map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href);
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex h-11 items-center gap-3 rounded-input px-3 type-body-md transition-colors",
                  active ? "bg-primary-200 font-medium text-primary-800" : "text-body hover:bg-section",
                )}
              >
                <Icon
                  className={cn("size-5", active ? "text-primary-800" : "text-caption")}
                  strokeWidth={1.5}
                />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
