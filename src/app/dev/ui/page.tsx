import { notFound } from "next/navigation";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Chip } from "@/shared/ui/Chip";
import { Input } from "@/shared/ui/input";
import { SearchBar } from "@/shared/ui/SearchBar";
import { formatPrice } from "@/shared/lib/format";
import { StepperDemo } from "./_components/StepperDemo";

/** 개발용 디자인 시스템 미리보기 — 프로덕션에서는 404 */
export default function UiPreviewPage() {
  if (process.env.NODE_ENV === "production") notFound();

  const swatches = [
    ["bg-page", "bg-page"],
    ["bg-card", "bg-card"],
    ["bg-section", "bg-section"],
    ["bg-inverse", "bg-inverse"],
    ["bg-action", "action"],
    ["bg-badge", "badge"],
    ["bg-category-all", "category/all"],
    ["bg-category-bread", "category/bread"],
    ["bg-category-cake", "category/cake"],
    ["bg-category-cookie", "category/cookie"],
    ["bg-category-beverage", "category/beverage"],
  ];

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-12 px-6 py-16">
      <h1 className="type-h1 text-heading">Design System Preview</h1>

      <section className="flex flex-col gap-4">
        <h2 className="type-label text-link">Colors</h2>
        <div className="grid grid-cols-4 gap-3 sm:grid-cols-6">
          {swatches.map(([cls, name]) => (
            <div key={name} className="flex flex-col gap-1">
              <div className={`h-14 rounded-input border border-line ${cls}`} />
              <span className="type-body-sm text-caption">{name}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="type-label text-link">Typography</h2>
        <p className="type-display text-heading">갓 구운 빵 냄새</p>
        <p className="type-h1 text-heading">오늘의 첫 반죽</p>
        <p className="type-h2 text-heading">가장 많이 찾는 빵</p>
        <p className="type-h3 text-heading">페이스트리</p>
        <p className="type-title text-heading">버터 크루아상</p>
        <p className="type-body-lg text-body">저온에서 하룻밤 숙성한 반죽으로 굽습니다.</p>
        <p className="type-body-md text-body">저온에서 하룻밤 숙성한 반죽으로 굽습니다.</p>
        <p className="type-body-sm text-caption">저온에서 하룻밤 숙성한 반죽으로 굽습니다.</p>
        <p className="type-label text-caption">Freshly baked</p>
        <p className="type-price text-heading">{formatPrice(4500)}</p>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="type-label text-link">Button · Badge · Chip</h2>
        <div className="flex flex-wrap items-center gap-3">
          <Button>장바구니 담기</Button>
          <Button variant="secondary">바로 구매</Button>
          <Button disabled>카카오 로그인</Button>
          <Button size="sm" variant="secondary">
            관리자 페이지
          </Button>
          <div className="rounded-card bg-inverse p-4">
            <Button variant="inverse">전체 상품</Button>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Badge>BEST</Badge>
          <Badge>배송 준비중</Badge>
          <Chip selected>All</Chip>
          <Chip>Bread</Chip>
          <Chip>Cake</Chip>
        </div>
      </section>

      <section className="flex max-w-xl flex-col gap-4">
        <h2 className="type-label text-link">Form</h2>
        <Input placeholder="홍길동" />
        <SearchBar placeholder="찾으시는 빵 이름을 입력하세요" />
        <StepperDemo />
      </section>
    </main>
  );
}
