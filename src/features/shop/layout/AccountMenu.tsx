"use client";

import { startTransition } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { User } from "lucide-react";
import { memberLogout } from "@/features/shop/mypage/actions";
import { cn } from "@/shared/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";

/*
 * 마이페이지 아이콘 — 로그인 전에는 마이페이지 링크, 로그인 후에는 드롭 메뉴(주문 내역 · 로그아웃).
 * variant: header = 데스크톱 헤더 아이콘, tab = 모바일 하단 탭(아이콘 + 글자, 메뉴는 위로 열림)
 */
type Variant = "header" | "tab";

export function AccountMenu({ variant, loggedIn }: { variant: Variant; loggedIn: boolean }) {
  const active = usePathname().startsWith("/mypage");
  const face = <AccountFace variant={variant} active={active} />;

  if (!loggedIn) {
    return (
      <Link
        href="/mypage"
        aria-label="마이페이지"
        aria-current={active ? "page" : undefined}
        className={triggerClass(variant, active)}
      >
        {face}
      </Link>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label="마이페이지 메뉴"
        className={cn(triggerClass(variant, active), "outline-none")}
      >
        {face}
      </DropdownMenuTrigger>
      <DropdownMenuContent
        side={variant === "tab" ? "top" : "bottom"}
        align={variant === "tab" ? "center" : "end"}
        sideOffset={variant === "tab" ? 28 : 8}
        className="min-w-[160px] rounded-input border-line bg-card p-1.5 shadow-card"
      >
        <p className="px-3 pt-1.5 pb-2 type-body-sm text-caption">데모 회원</p>
        <DropdownMenuItem
          asChild
          className="rounded-input px-3 py-2.5 type-body-md text-body focus:bg-section"
        >
          <Link href="/mypage/orders">주문 내역</Link>
        </DropdownMenuItem>
        <DropdownMenuItem
          onSelect={() => startTransition(() => memberLogout())}
          className="rounded-input px-3 py-2.5 type-body-md text-body focus:bg-section"
        >
          로그아웃
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/** 로그인 상태를 읽기 전 자리 표시 (Suspense fallback) — usePathname을 쓰지 않는다 */
export function AccountMenuFallback({ variant }: { variant: Variant }) {
  return (
    <Link href="/mypage" aria-label="마이페이지" className={triggerClass(variant, false)}>
      <AccountFace variant={variant} active={false} />
    </Link>
  );
}

function triggerClass(variant: Variant, active: boolean) {
  return variant === "tab"
    ? cn("flex min-h-11 w-full flex-col items-center gap-1", active ? "text-link" : "text-caption")
    : "flex items-center";
}

function AccountFace({ variant, active }: { variant: Variant; active: boolean }) {
  if (variant === "header") return <User className="size-6" strokeWidth={1.5} />;
  return (
    <>
      <User className="size-6" strokeWidth={1.5} />
      <span className={cn("text-[11px]", active && "font-medium")}>마이페이지</span>
    </>
  );
}
