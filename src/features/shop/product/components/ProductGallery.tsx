"use client";

import Image from "next/image";
import { useState } from "react";
import { cn } from "@/shared/lib/utils";

/*
 * 상품 이미지 (Figma: Product Detail 8:390) — 큰 사진 + 데스크톱 썸네일 4개.
 * 상품당 사진이 한 장이라 썸네일은 같은 사진의 확대 · 구도 보기로 쓴다.
 */
const VIEWS = [
  { label: "전체", className: "scale-100" },
  { label: "가까이", className: "scale-[1.35] origin-center" },
  { label: "왼쪽 위", className: "scale-[1.6] origin-[35%_35%]" },
  { label: "오른쪽 아래", className: "scale-[1.6] origin-[65%_65%]" },
];

export function ProductGallery({ src, alt }: { src: string; alt: string }) {
  const [active, setActive] = useState(0);

  return (
    <div className="flex flex-col gap-4">
      <div className="relative aspect-square w-full overflow-hidden bg-section lg:rounded-card">
        <Image
          src={src}
          alt={alt}
          fill
          priority
          sizes="(min-width: 1024px) 640px, 100vw"
          className={cn("object-cover transition-transform duration-300", VIEWS[active].className)}
        />
      </div>
      <div className="hidden grid-cols-4 gap-4 lg:grid">
        {VIEWS.map((v, i) => (
          <button
            key={v.label}
            type="button"
            aria-label={`${v.label} 보기`}
            aria-pressed={i === active}
            onClick={() => setActive(i)}
            className={cn(
              "relative aspect-square overflow-hidden rounded-input border-2 transition-colors",
              i === active ? "border-action" : "border-transparent hover:border-line",
            )}
          >
            <Image src={src} alt="" fill sizes="148px" className={cn("object-cover", v.className)} />
          </button>
        ))}
      </div>
    </div>
  );
}
