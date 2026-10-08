import Image from "next/image";
import { SHOP_INFO } from "./nav";

/*
 * 브랜드 로고 (Figma: Components > Brand). 투명 PNG(짙은 그린)라 어두운 푸터에서는 잘 안 보인다.
 * 푸터용 밝은 로고는 디자인 디테일 정리 때 정한다.
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
