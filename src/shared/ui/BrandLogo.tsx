import Image from "next/image";

/*
 * 브랜드 로고 (Figma: Components > Brand) — 쇼핑몰 · 관리자 공용. 투명 PNG.
 * tone="outline"은 어두운 배경(푸터)용 — 원본 윤곽을 따라 베이지(brown-200) 테두리를 두른 버전.
 */
const LOGOS = {
  dark: { src: "/brand/pine-bakery-logo.png", width: 720, height: 392 },
  outline: { src: "/brand/pine-bakery-logo-outline.png", width: 772, height: 444 },
} as const;

export function BrandLogo({ height, tone = "dark" }: { height: number; tone?: keyof typeof LOGOS }) {
  const logo = LOGOS[tone];
  return (
    <Image
      src={logo.src}
      alt="Pine Bakery"
      width={Math.round(height * (logo.width / logo.height))}
      height={height}
      // 헤더 로고는 첫 화면에 보이므로 바로 받되, preload(높은 우선순위)는 하지 않는다 — LCP 이미지와 대역폭을 다투지 않게
      loading={tone === "dark" ? "eager" : undefined}
    />
  );
}
