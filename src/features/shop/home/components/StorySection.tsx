import Image from "next/image";
import Link from "next/link";
import { Button } from "@/shared/ui/button";

/** Figma: Story — 사진 + 브랜드 이야기 */
export function StorySection() {
  return (
    <section className="bg-card">
      <div className="mx-auto flex max-w-[1440px] flex-col gap-8 px-5 py-16 lg:flex-row lg:items-center lg:gap-20 lg:px-20 lg:py-24">
        <div className="relative aspect-[4/3] w-full overflow-hidden rounded-card lg:w-[560px] lg:shrink-0">
          <Image
            src="/images/hero/story.jpg"
            alt="새벽에 반죽을 빚는 제빵사의 손"
            fill
            sizes="(min-width: 1024px) 560px, 100vw"
            className="object-cover"
          />
        </div>
        <div className="flex flex-col items-start">
          <p className="type-label text-caption">Our story</p>
          <h2 className="mt-3 type-h2 text-heading lg:type-h1">
            새벽 다섯 시,
            <br />
            오늘의 첫 반죽
          </h2>
          <span aria-hidden className="mt-6 hidden h-px w-12 bg-decor lg:block" />
          <p className="mt-5 max-w-[400px] type-body-md text-body lg:mt-6">
            Pine Bakery는 매일 그날 팔 만큼만 굽습니다. 저온에서 하룻밤 숙성한 반죽, 좋은 버터와 밀가루로 집
            앞 빵집 같은 따뜻한 맛을 지킵니다.
          </p>
          <Button asChild variant="secondary" className="mt-8">
            <Link href="/products">빵 둘러보기</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
