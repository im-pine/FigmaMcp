"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Product } from "@/generated/prisma/client";
import { useCartStore } from "@/features/shop/cart/store";
import { GIFT_WRAP_FEE } from "@/shared/constants/catalog";
import { formatPrice } from "@/shared/lib/format";
import { Button } from "@/shared/ui/button";
import { Chip } from "@/shared/ui/Chip";
import { QuantityStepper } from "@/shared/ui/QuantityStepper";

/** 포장 옵션 · 수량 · 합계 · 장바구니 담기 / 바로 구매 (Figma: Product Detail) */
type PurchasePanelProps = {
  product: Pick<Product, "id" | "slug" | "name" | "nameEn" | "price" | "imagePath">;
};

export function PurchasePanel({ product }: PurchasePanelProps) {
  const router = useRouter();
  const addItem = useCartStore((s) => s.addItem);
  const [giftWrap, setGiftWrap] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  const total = (product.price + (giftWrap ? GIFT_WRAP_FEE : 0)) * quantity;

  const addToCart = () => {
    addItem(product, quantity, giftWrap);
    setAdded(true);
  };

  return (
    <div className="flex flex-col">
      <p className="type-body-sm text-body">포장 옵션</p>
      <div className="mt-3 flex gap-2" role="group" aria-label="포장 옵션">
        <Chip selected={!giftWrap} onClick={() => setGiftWrap(false)}>
          기본 포장
        </Chip>
        <Chip selected={giftWrap} onClick={() => setGiftWrap(true)}>
          선물 포장 (+{formatPrice(GIFT_WRAP_FEE)})
        </Chip>
      </div>

      <div className="mt-6 flex items-center justify-between rounded-card bg-card px-4 py-4 lg:px-5">
        <QuantityStepper
          value={quantity}
          onChange={(v) => {
            setQuantity(v);
            setAdded(false);
          }}
        />
        <p className="flex items-baseline gap-2">
          <span className="type-body-sm text-caption">합계</span>
          <span className="type-price text-heading" aria-live="polite">
            {formatPrice(total)}
          </span>
        </p>
      </div>

      <div className="mt-6 flex flex-col gap-3 lg:flex-row">
        <Button className="lg:flex-1" onClick={addToCart}>
          장바구니 담기
        </Button>
        <Button
          variant="secondary"
          className="lg:flex-1"
          onClick={() => {
            addItem(product, quantity, giftWrap);
            router.push("/checkout");
          }}
        >
          바로 구매
        </Button>
      </div>
      <p role="status" className="mt-3 min-h-5 type-body-sm text-caption">
        {added && (
          <>
            장바구니에 담았어요.{" "}
            <Link href="/cart" className="text-link underline-offset-4 hover:underline">
              장바구니 보기
            </Link>
          </>
        )}
      </p>
    </div>
  );
}
