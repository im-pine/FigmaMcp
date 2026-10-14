import productImages from "@/generated/product-images.json";
import { cn } from "@/shared/lib/utils";

/*
 * 상품 이미지 — 미리 만든 썸네일(scripts/images/build-product-thumbnails.mjs)을 크기별로 고르고,
 * 받는 동안 흐린 미리보기(16px)를 배경으로 깐다.
 * next/image의 요청 때 변환은 캐시가 없으면 장당 약 1.1초 걸려, 상품 이미지는 정적 썸네일로 CDN에서 바로 준다.
 * AVIF를 먼저 주고(<source>), 지원하지 않는 브라우저는 WebP를 받는다.
 * 썸네일이 없는 이미지(목록에 없는 경로)는 원본을 그대로 쓴다.
 */
type Manifest = Record<string, { widths: number[]; blur: string }>;
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
  const srcSet = (ext: string) => entry?.widths.map((w) => `${base}-${w}.${ext} ${w}w`).join(", ");
  const sizes = size.sizes ?? `${size.width}px`;
  const loading = {
    loading: priority ? ("eager" as const) : lazyOrEager,
    fetchPriority: priority ? ("high" as const) : undefined,
  };
  const fillClass = size.fill ? "absolute inset-0 size-full" : undefined;

  if (!entry) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- 썸네일 목록에 없는 경로는 원본을 그대로 쓴다
      <img
        src={src}
        alt={alt}
        width={size.width}
        height={size.height}
        decoding="async"
        {...loading}
        className={cn(fillClass, className)}
      />
    );
  }

  const fallbackWidth = entry.widths.find((w) => w >= 384) ?? entry.widths.at(-1);
  // WebP만 쓴다: AVIF는 전송량이 약 30% 작지만 해독이 느려 LCP가 늘었다 (실험: 상품 상세 모바일 LCP 2.71 → 3.69–3.74s).
  // <picture> 없이 <img>로 두면 priority 이미지는 React가 자동으로 preload한다
  return (
    // eslint-disable-next-line @next/next/no-img-element -- 미리 만든 썸네일을 srcSet으로 직접 고른다 (next/image 변환을 쓰지 않음)
    <img
      src={`${base}-${fallbackWidth}.webp`}
      srcSet={srcSet("webp")}
      sizes={sizes}
      alt={alt}
      width={size.width}
      height={size.height}
      decoding="async"
      {...loading}
      className={cn(fillClass, className)}
    />
  );
}
