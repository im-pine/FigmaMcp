"use client";

import Link from "next/link";
import { ArrowLeft, ShoppingBag } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/ui/button";
import { summarizeCart, useCartHydrated, useCartStore } from "../store";
import { CartItemRow } from "./CartItemRow";
import { OrderSummary } from "./OrderSummary";

/** 장바구니 화면 (Figma: 장바구니 데스크톱 8:616 · 모바일 11:1212) */
export function CartView() {
  const hydrated = useCartHydrated();
  const items = useCartStore((s) => s.items);

  return (
    <section className="mx-auto max-w-[1440px] px-5 pt-6 pb-16 lg:px-20 lg:pt-16 lg:pb-32">
      <div className="mb-6 flex items-baseline gap-3 lg:mb-10 lg:gap-4">
        <h1 className="type-h2 text-heading lg:type-h1">장바구니</h1>
        {hydrated && items.length > 0 && (
          <span className="type-body-sm text-caption lg:type-body-md">{items.length}개 상품</span>
        )}
      </div>
      {!hydrated ? <CartSkeleton /> : items.length === 0 ? <CartEmpty /> : <CartContent />}
    </section>
  );
}

function CartContent() {
  const items = useCartStore((s) => s.items);
  const clear = useCartStore((s) => s.clear);
  const { subtotal, shippingFee, total } = summarizeCart(items);

  return (
    <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_400px] lg:items-start lg:gap-15">
      <div>
        <div className="hidden items-center justify-between border-b border-line-strong pb-4 lg:flex">
          <span className="type-body-sm text-heading">상품 정보</span>
          <button type="button" onClick={clear} className="type-body-sm text-caption hover:text-heading">
            전체 삭제
          </button>
        </div>
        <ul className="border-t border-line lg:border-t-0">
          {items.map((item) => (
            <CartItemRow key={`${item.id}-${item.giftWrap}`} item={item} />
          ))}
        </ul>
        <ContinueLink className="mt-8 hidden lg:inline-flex" />
      </div>

      <OrderSummary
        subtotal={subtotal}
        shippingFee={shippingFee}
        total={total}
        className="mt-8 lg:sticky lg:top-28 lg:mt-0"
        action={
          <Button asChild>
            <Link href="/checkout">주문하기</Link>
          </Button>
        }
      />
      <ContinueLink className="mt-8 inline-flex lg:hidden" />
    </div>
  );
}

function ContinueLink({ className }: { className?: string }) {
  return (
    <Link
      href="/products"
      className={cn("items-center gap-1.5 type-body-md text-link hover:underline", className)}
    >
      <ArrowLeft className="size-4" strokeWidth={1.5} />
      쇼핑 계속하기
    </Link>
  );
}

function CartEmpty() {
  return (
    <div className="flex flex-col items-center gap-4 rounded-card bg-card px-6 py-20 text-center">
      <span className="flex size-16 items-center justify-center rounded-full bg-section text-caption">
        <ShoppingBag className="size-7" strokeWidth={1.5} />
      </span>
      <p className="type-title text-heading">장바구니가 비어 있어요</p>
      <p className="type-body-md text-caption">갓 구운 빵과 디저트를 담아 보세요.</p>
      <Button asChild className="mt-2">
        <Link href="/products">상품 보러 가기</Link>
      </Button>
    </div>
  );
}

/** localStorage를 불러오기 전 자리 표시 — 빈 장바구니 화면이 잠깐 보이지 않게 한다 */
export function CartSkeleton() {
  return (
    <div aria-busy="true" className="lg:grid lg:grid-cols-[minmax(0,1fr)_400px] lg:gap-15">
      <div className="flex flex-col gap-6">
        {[0, 1].map((i) => (
          <div key={i} className="flex animate-pulse gap-6">
            <div className="size-20 rounded-input bg-section lg:size-24" />
            <div className="flex flex-1 flex-col gap-3 pt-2">
              <div className="h-5 w-1/3 rounded bg-section" />
              <div className="h-4 w-1/4 rounded bg-section" />
            </div>
          </div>
        ))}
      </div>
      <div className="mt-8 h-72 animate-pulse rounded-card bg-card lg:mt-0" />
    </div>
  );
}
