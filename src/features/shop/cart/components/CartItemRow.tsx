"use client";

import Image from "next/image";
import Link from "next/link";
import { X } from "lucide-react";
import { GIFT_WRAP_FEE } from "@/shared/constants/catalog";
import { formatPrice } from "@/shared/lib/format";
import { QuantityStepper } from "@/shared/ui/QuantityStepper";
import { lineTotalOf, useCartStore, type CartItem } from "../store";

/** Figma: CartItem(데스크톱 한 줄) · MobileCartItem(모바일 두 줄) */
export function CartItemRow({ item }: { item: CartItem }) {
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);

  const href = `/products/${item.slug}`;
  const unitLabel = item.giftWrap
    ? `${formatPrice(item.price)} · 선물 포장 +${formatPrice(GIFT_WRAP_FEE)}`
    : formatPrice(item.price);
  const stepper = (
    <QuantityStepper value={item.quantity} onChange={(q) => updateQuantity(item.id, item.giftWrap, q)} />
  );
  const removeButton = (
    <button
      type="button"
      aria-label={`${item.name} 삭제`}
      onClick={() => removeItem(item.id, item.giftWrap)}
      className="relative flex size-8 shrink-0 items-center justify-center text-heading before:absolute before:top-1/2 before:left-1/2 before:size-11 before:-translate-1/2 before:content-[''] hover:text-caption"
    >
      <X className="size-5" strokeWidth={1.5} />
    </button>
  );

  return (
    <li className="border-b border-line py-6 lg:py-6">
      {/* 데스크톱 */}
      <div className="hidden items-center gap-6 lg:flex">
        <Link href={href} className="shrink-0">
          <Image
            src={item.imagePath}
            alt={item.name}
            width={96}
            height={96}
            loading="eager"
            className="size-24 rounded-input object-cover"
          />
        </Link>
        <div className="flex min-w-0 flex-1 flex-col">
          <Link href={href} className="type-title text-heading hover:underline">
            {item.name}
          </Link>
          <span className="mt-0.5 type-label text-caption">{item.nameEn}</span>
          <span className="mt-1.5 type-body-sm text-body">{unitLabel}</span>
        </div>
        {stepper}
        <span className="w-28 text-right type-price text-heading">{formatPrice(lineTotalOf(item))}</span>
        {removeButton}
      </div>

      {/* 모바일 */}
      <div className="flex gap-4 lg:hidden">
        <Link href={href} className="shrink-0">
          <Image
            src={item.imagePath}
            alt={item.name}
            width={80}
            height={80}
            loading="eager"
            className="size-20 rounded-input object-cover"
          />
        </Link>
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex items-start justify-between gap-2">
            <Link href={href} className="type-body-lg font-medium text-heading">
              {item.name}
            </Link>
            <span className="-mt-1 -mr-1.5">{removeButton}</span>
          </div>
          <span className="type-body-sm text-caption">{unitLabel}</span>
          <div className="mt-3 flex items-center justify-between gap-2">
            {stepper}
            <span className="type-price text-heading">{formatPrice(lineTotalOf(item))}</span>
          </div>
        </div>
      </div>
    </li>
  );
}
