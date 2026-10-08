import Image from "next/image";
import { SHOP_INFO } from "./nav";

/*
 * 브랜드 로고 (Figma: Components > Brand). 투명 PNG라 밝은 배경(헤더)에서만 쓴다.
 * 어두운 배경인 푸터는 짙은 그린 로고가 보이지 않아 텍스트 로고를 그대로 쓴다.
 */
export function BrandLogo({ height }: { height: number }) {
  return (
    <Image
      src="/brand/pine-bakery-logo.png"
      alt={SHOP_INFO.name}
      width={Math.round(height * (720 / 392))}
      height={height}
      priority
    />
  );
}
