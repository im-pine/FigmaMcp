"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { CATEGORY_LINKS } from "./nav";

/** 데스크톱 헤더 카테고리 메뉴 — 지금 보고 있는 카테고리에 aria-current를 단다 */
export function HeaderNav() {
  const pathname = usePathname();
  const category = useSearchParams().get("category") ?? "all";
  return <HeaderNavLinks current={pathname === "/products" ? category : undefined} />;
}

/** Suspense fallback — 현재 위치 없이 같은 메뉴 */
export function HeaderNavLinks({ current }: { current?: string }) {
  return (
    <nav aria-label="카테고리" className="flex gap-10">
      {CATEGORY_LINKS.map((c) => (
        <Link
          key={c.slug}
          href={c.href}
          aria-current={c.slug === current ? "page" : undefined}
          className="type-body-md text-body hover:text-heading aria-[current=page]:font-medium aria-[current=page]:text-link"
        >
          {c.label}
        </Link>
      ))}
    </nav>
  );
}
