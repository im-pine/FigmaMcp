import "@/generated/product-images.css";
import productImages from "@/generated/product-images.json";
import { cn } from "@/shared/lib/utils";

/*
 * 상품 이미지 — 미리 만든 WebP 썸네일(scripts/images/build-product-thumbnails.mjs)을 srcSet으로 고른다.
 * next/image의 요청 때 변환은 캐시가 없으면 장당 약 1.1초 걸려, 상품 이미지는 정적 썸네일로 CDN에서 바로 준다.
 * <picture> 없이 <img>로 두어 priority 이미지는 React가 자동으로 preload한다.
 *
 * 흐린 미리보기(fill일 때): 원본을 3×3으로 줄인 색의 그라데이션(생성된 CSS 클래스)에 blur를 걸어 이미지 뒤에 깐다.
 * 이미지(data URL)나 HTML style로 넣지 않는다 — 측정에서 둘 다 Lighthouse 모바일 LCP를 늦췄다 (빌드 스크립트 설명 참고).
 *
 * 썸네일 목록에 없는 경로는 원본을 그대로 쓴다.
 */
type Manifest = Record<string, { widths: number[]; lqip: string }>;
const MANIFEST = productImages as Manifest;

type ProductImageProps = {
  src: string;
  alt: string;
  className?: string;
  /** 첫 화면의 LCP 후보만 true — 바로 · 높은 우선순위로 받는다 */
  priority?: boolean;
  /** priority가 아닐 때의 로딩 (기본: lazy) */
  loading?: "lazy" | "eager";
} & (
  | { fill: true; sizes: string; width?: never; height?: never }
  | { fill?: false; width: number; height: number; sizes?: string }
);

export function ProductImage({
  src,
  alt,
  className,
  priority = false,
  loading: lazyOrEager = "lazy",
  ...size
}: ProductImageProps) {
  const entry = MANIFEST[src];
  const base = src.replace(/^\/images\/products\//, "/images/products/thumbs/").replace(/\.[a-z]+$/i, "");
  const common = {
    width: size.width,
    height: size.height,
    decoding: "async" as const,
    loading: priority ? ("eager" as const) : lazyOrEager,
    fetchPriority: priority ? ("high" as const) : undefined,
    className: cn(size.fill && "absolute inset-0 size-full", className),
  };

  // eslint-disable-next-line @next/next/no-img-element -- 썸네일 목록에 없는 경로는 원본을 그대로 쓴다
  if (!entry) return <img src={src} alt={alt} {...common} />;

  const fallbackWidth = entry.widths.find((w) => w >= 384) ?? entry.widths.at(-1);
  const image = (
    // eslint-disable-next-line @next/next/no-img-element -- 미리 만든 썸네일을 srcSet으로 직접 고른다 (next/image 변환을 쓰지 않음)
    <img
      src={`${base}-${fallbackWidth}.webp`}
      srcSet={entry.widths.map((w) => `${base}-${w}.webp ${w}w`).join(", ")}
      sizes={size.sizes ?? `${size.width}px`}
      alt={alt}
      {...common}
    />
  );
  if (!size.fill) return image;

  return (
    <>
      <span aria-hidden className={cn("product-lqip absolute inset-0 scale-110 blur-xl", entry.lqip)} />
      {image}
    </>
  );
}
