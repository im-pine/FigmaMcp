"use client";

import Image from "next/image";
import Link from "next/link";
import { cn } from "@/shared/lib/utils";
import { CATEGORY_LINKS } from "./nav";

/*
 * 상품 버블 메뉴 (Figma: Mobile / Products Menu (Open), 모션 사양: Wiki Design)
 * - 가운데 상품 버튼 중심에서 부채꼴(150°→30°)로 퍼진다
 * - 열기: All → Beverage 순으로 40ms 간격, 각 260ms ease-out(spring) / 닫기: 180ms ease-in
 */
const RADIUS = 160;
const ANGLES = [150, 120, 90, 60, 30];
const CATEGORY_BG: Record<string, string> = {
  all: "bg-category-all",
  bread: "bg-category-bread",
  cake: "bg-category-cake",
  cookie: "bg-category-cookie",
  beverage: "bg-category-beverage",
};

export function ProductsBubbleMenu({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <>
      <div
        aria-hidden
        onClick={onClose}
        className={cn(
          "fixed inset-0 z-40 bg-inverse/60 transition-opacity duration-200 lg:hidden",
          open ? "opacity-100" : "pointer-events-none opacity-0",
        )}
      />
      {/* 버블 기준점 = 상품 버튼 중심 */}
      <nav
        aria-label="카테고리"
        aria-hidden={!open}
        className="pointer-events-none fixed bottom-[calc(54px+env(safe-area-inset-bottom))] left-1/2 z-50 size-0 lg:hidden"
      >
        {CATEGORY_LINKS.map((c, i) => {
          const rad = (ANGLES[i] * Math.PI) / 180;
          const x = Math.round(RADIUS * Math.cos(rad));
          const y = Math.round(-RADIUS * Math.sin(rad));
          return (
            <Link
              key={c.slug}
              href={c.href}
              onClick={onClose}
              tabIndex={open ? 0 : -1}
              style={{
                transform: open
                  ? `translate(calc(${x}px - 50%), calc(${y}px - 50%)) scale(1)`
                  : "translate(-50%, -50%) scale(0.6)",
                transitionDelay: open ? `${i * 40}ms` : "0ms",
                transitionDuration: open ? "260ms" : "180ms",
                transitionTimingFunction: open ? "cubic-bezier(0.34, 1.56, 0.64, 1)" : "ease-in",
              }}
              className={cn(
                "absolute top-0 left-0 flex w-[62px] flex-col items-center gap-1.5 transition-[transform,opacity]",
                open ? "pointer-events-auto opacity-100" : "opacity-0",
              )}
            >
              <span
                className={cn(
                  "relative size-[62px] overflow-hidden rounded-full border-2 border-card shadow-card",
                  CATEGORY_BG[c.slug],
                )}
              >
                <Image
                  src={`/images/categories/${c.slug}.png`}
                  alt=""
                  fill
                  sizes="62px"
                  className="object-contain p-1.5"
                />
              </span>
              <span className="text-[13px] text-on-inverse">{c.label}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
