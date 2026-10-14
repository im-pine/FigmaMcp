import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/generated/prisma/client";
import { formatPrice } from "@/shared/lib/format";

/** Figma: ProductCard — 테두리 없이 정사각 사진 · 세리프 상품명 · 영문 부제 · 가격 */
type ProductCardProps = {
  product: Pick<Product, "slug" | "name" | "nameEn" | "price" | "imagePath">;
  /** 이미지 sizes 힌트 (기본: 모바일 2열 · 데스크톱 4열) */
  sizes?: string;
  /**
   * 첫 화면에 보이는 카드의 이미지 로딩 (기본: lazy).
   * "eager"는 바로 받기, "high"는 바로 받기 + 높은 우선순위 — LCP가 되는 첫 1–2장에만 쓴다.
   */
  imagePriority?: "eager" | "high";
};

export function ProductCard({
  product,
  sizes = "(min-width: 1024px) 300px, 50vw",
  imagePriority,
}: ProductCardProps) {
  return (
    <Link href={`/products/${product.slug}`} className="group flex flex-col items-center text-center">
      <div className="relative aspect-square w-full overflow-hidden rounded-card bg-section">
        <Image
          src={product.imagePath}
          alt={product.name}
          fill
          sizes={sizes}
          loading={imagePriority ? "eager" : undefined}
          fetchPriority={imagePriority === "high" ? "high" : undefined}
          className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
        />
      </div>
      <p className="mt-4 type-title text-heading lg:mt-5">{product.name}</p>
      <p className="mt-0.5 type-label text-caption">{product.nameEn}</p>
      <p className="mt-1.5 type-price text-heading">{formatPrice(product.price)}</p>
    </Link>
  );
}
