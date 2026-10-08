import { getImageProps } from "next/image";
import Link from "next/link";
import { Button } from "@/shared/ui/button";

/*
 * 메인 배너 (Figma: Home Hero) — 데스크톱은 가로형 이미지에 왼쪽 글자, 모바일은 세로형 이미지에 왼쪽 위 글자.
 * <picture> + <source media>로 화면 폭에 맞는 이미지 한 장만 내려받는다 (CSS로 숨기지 않음).
 */
const DESKTOP_MEDIA = "(min-width: 1024px)";

export function HomeHero() {
  const common = { alt: "아침 햇살 아래 갓 구운 빵이 놓인 베이커리 작업대", sizes: "100vw", priority: true };
  const {
    props: { srcSet: desktopSrcSet },
  } = getImageProps({ ...common, src: "/images/hero/hero-desktop.jpg", width: 1584, height: 672 });
  const {
    props: { srcSet: mobileSrcSet, ...imgProps },
  } = getImageProps({ ...common, src: "/images/hero/hero-mobile.jpg", width: 848, height: 1264 });

  return (
    <section className="relative h-[600px] overflow-hidden bg-inverse lg:h-[640px]">
      <picture>
        <source media={DESKTOP_MEDIA} srcSet={desktopSrcSet} />
        <img
          {...imgProps}
          alt={common.alt}
          srcSet={mobileSrcSet}
          className="absolute inset-0 size-full object-cover"
        />
      </picture>

      <div className="relative mx-auto flex h-full max-w-[1440px] flex-col items-start px-5 pt-10 lg:justify-center lg:px-20 lg:pt-0">
        <p className="type-label text-on-inverse">Freshly baked every morning</p>
        <h1 className="mt-4 type-h1 text-on-inverse lg:mt-5 lg:type-display">
          갓 구운 빵 냄새로
          <br />
          시작하는 아침
        </h1>
        <p className="mt-3 type-body-md text-on-inverse lg:mt-5 lg:type-body-lg">
          새벽 다섯 시, 천천히 발효한 반죽을 오븐에 넣습니다.
          <span className="hidden lg:inline">
            <br />
            버터 향 가득한 크루아상부터 담백한 식사빵까지, 오늘 구운 빵을 만나보세요.
          </span>
        </p>
        <div className="mt-6 flex gap-3 lg:mt-10">
          <Button asChild className="lg:hidden">
            <Link href="/products">전체 상품 보기</Link>
          </Button>
          <Button asChild className="hidden lg:inline-flex">
            <Link href="/products?category=bread">오늘의 빵 보기</Link>
          </Button>
          <Button asChild variant="inverse" className="hidden lg:inline-flex">
            <Link href="/products">전체 상품</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
