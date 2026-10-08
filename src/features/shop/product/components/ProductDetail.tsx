import Link from "next/link";
import type { Product } from "@/generated/prisma/client";
import { getRelatedProducts } from "@/server/services/product";
import { formatPrice } from "@/shared/lib/format";
import { Badge } from "@/shared/ui/badge";
import { categoryOf } from "../categories";
import { ProductCard } from "./ProductCard";
import { ProductGallery } from "./ProductGallery";
import { PurchasePanel } from "./PurchasePanel";

/** 상품 상세 (Figma: Product Detail 8:390 / Mobile 11:1087) */
export async function ProductDetail({ product }: { product: Product }) {
  const category = categoryOf(product.category);
  const related = await getRelatedProducts({ id: product.id, category: product.category });
  const { id, slug, name, nameEn, price, imagePath } = product;

  return (
    <>
      <section className="mx-auto max-w-[1440px] lg:px-20 lg:pt-8 lg:pb-24">
        <nav aria-label="현재 위치" className="hidden type-body-sm text-caption lg:block">
          <ol className="flex gap-1.5">
            <li>
              <Link href="/products" className="hover:text-heading">
                Shop
              </Link>
            </li>
            <li aria-hidden>/</li>
            <li>
              <Link href={`/products?category=${category.slug}`} className="hover:text-heading">
                {category.label}
              </Link>
            </li>
            <li aria-hidden>/</li>
            <li aria-current="page" className="text-body">
              {name}
            </li>
          </ol>
        </nav>

        <div className="flex flex-col gap-6 lg:mt-6 lg:flex-row lg:items-start lg:gap-20">
          <div className="lg:w-[640px] lg:shrink-0">
            <ProductGallery src={imagePath} alt={name} />
          </div>

          <div className="flex flex-1 flex-col px-5 pb-12 lg:px-0 lg:pb-0">
            {product.isBest && <Badge className="mb-3">Best</Badge>}
            <p className="type-label text-caption">{nameEn}</p>
            <h1 className="mt-2 type-h2 text-heading lg:type-h1">{name}</h1>
            <p className="mt-4 type-body-md text-body lg:mt-5">{product.description}</p>
            <p className="mt-6 type-h2 text-heading">{formatPrice(price)}</p>

            <hr className="my-6 border-line" />
            <PurchasePanel product={{ id, slug, name, nameEn, price, imagePath }} />
            <hr className="mt-3 mb-6 border-line" />

            <dl className="grid gap-3 type-body-sm lg:grid-cols-[96px_1fr] lg:gap-x-4">
              <dt className="text-caption">원재료</dt>
              <dd className="-mt-2.5 text-body lg:mt-0">{product.ingredients}</dd>
              <dt className="text-caption">보관 방법</dt>
              <dd className="-mt-2.5 text-body lg:mt-0">{product.storageGuide}</dd>
              <dt className="text-caption">알레르기</dt>
              <dd className="-mt-2.5 text-body lg:mt-0">{product.allergens} 함유</dd>
            </dl>
          </div>
        </div>
      </section>

      {related.length > 0 && (
        <section className="bg-card">
          <div className="mx-auto max-w-[1440px] px-5 py-14 lg:px-20 lg:py-24">
            <p className="type-label text-link">Pair with</p>
            <h2 className="mt-2 type-h2 text-heading lg:mt-3">함께 먹으면 좋은</h2>
            <ul className="mt-6 grid grid-cols-2 gap-x-4 gap-y-8 lg:mt-10 lg:grid-cols-4 lg:gap-x-6">
              {related.map((p) => (
                <li key={p.id}>
                  <ProductCard product={p} />
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}
    </>
  );
}

/** Suspense fallback — 사진과 정보 자리 */
export function ProductDetailSkeleton() {
  return (
    <div
      aria-busy="true"
      aria-label="상품 정보를 불러오는 중"
      className="mx-auto flex max-w-[1440px] flex-col gap-6 pb-12 lg:flex-row lg:gap-20 lg:px-20 lg:pt-[62px] lg:pb-24"
    >
      <div className="aspect-square w-full animate-pulse bg-section lg:w-[640px] lg:rounded-card" />
      <div className="flex flex-1 flex-col gap-4 px-5 lg:px-0">
        <div className="h-4 w-32 animate-pulse rounded-pill bg-section" />
        <div className="h-10 w-2/3 animate-pulse rounded-pill bg-section" />
        <div className="h-16 w-full animate-pulse rounded-card bg-section" />
      </div>
    </div>
  );
}
