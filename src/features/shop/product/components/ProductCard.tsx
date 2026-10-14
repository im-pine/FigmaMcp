import Image from "next/image";
import { thumbnailOf } from "@/shared/lib/product-image";
import Link from "next/link";
import type { Product } from "@/generated/prisma/client";
import { formatPrice } from "@/shared/lib/format";

/** Figma: ProductCard — 테두리 없이 정사각 사진 · 상품명 · 영문 부제 · 가격 */
type ProductCardProps = {
  product: Pick<Product, "slug" | "name" | "nameEn" | "price" | "imagePath">;
  /** 이미지 sizes 힌트 (기본: 모바일 2열 · 데스크톱 4열) */
  sizes?: string;
  /** LCP 후보(목록 첫 줄의 첫 1–2장)만 true — 바로 · 높은 우선순위로 받는다 (기본: lazy) */
  highPriorityImage?: boolean;
};

export function ProductCard({
  product,
  sizes = "(min-width: 1024px) 300px, 50vw",
  highPriorityImage = false,
}: ProductCardProps) {
  return (
    <Link href={`/products/${product.slug}`} className="group flex flex-col items-center text-center">
      <div className="relative aspect-square w-full overflow-hidden rounded-card bg-section">
        <Image
          src={thumbnailOf(product.imagePath)}
          alt={product.name}
          fill
          sizes={sizes}
          loading={highPriorityImage ? "eager" : undefined}
          fetchPriority={highPriorityImage ? "high" : undefined}
          className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
        />
      </div>
      <p className="mt-4 type-title text-heading lg:mt-5">{product.name}</p>
      <p className="mt-0.5 type-label text-caption">{product.nameEn}</p>
      <p className="mt-1.5 type-price text-heading">{formatPrice(product.price)}</p>
    </Link>
  );
}
