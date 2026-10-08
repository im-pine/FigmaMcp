import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getBestProducts, getProducts } from "@/server/services/product";
import { ProductCard } from "@/features/shop/product/components/ProductCard";
import { CategoryCardGrid } from "./CategoryCard";
import { CategoryTabs } from "./CategoryTabs";
import { HomeHero } from "./HomeHero";
import { SectionHeading } from "./SectionHeading";
import { StorySection } from "./StorySection";

/** 홈 (Figma: Home 3:105 / Mobile Home 9:872) */
export async function HomePage() {
  const [products, bestProducts] = await Promise.all([getProducts(), getBestProducts(4)]);

  return (
    <>
      <HomeHero />

      <section className="mx-auto max-w-[1440px] px-5 pt-14 pb-16 lg:px-20 lg:py-24">
        <SectionHeading
          label="Category"
          title={
            <>
              오늘은 어떤 빵이 <br className="lg:hidden" />
              끌리나요
            </>
          }
        />
        <div className="mt-6 lg:hidden">
          <CategoryTabs products={products} />
        </div>
        <div className="mt-10 hidden lg:block">
          <CategoryCardGrid />
        </div>
      </section>

      {/* 모바일은 카테고리 탭 목록이 추천 상품 역할을 하므로 데스크톱에서만 보여준다 (Figma 모바일 홈) */}
      <section className="mx-auto hidden max-w-[1440px] px-20 pb-24 lg:block">
        <div className="flex items-end justify-between">
          <SectionHeading label="Best seller" title="가장 많이 찾는 빵" />
          <Link href="/products" className="flex items-center gap-1 type-body-sm text-link">
            전체 보기 <ArrowRight className="size-4" aria-hidden />
          </Link>
        </div>
        <div className="mt-10 grid grid-cols-4 gap-6">
          {bestProducts.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      <StorySection />
    </>
  );
}
