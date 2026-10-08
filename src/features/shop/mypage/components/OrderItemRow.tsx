import Image from "next/image";
import { formatPrice } from "@/shared/lib/format";
import type { AccessibleOrder } from "@/server/services/order/lookup";

type Item = AccessibleOrder["items"][number];

/** 주문 상품 한 줄: 이미지 · 이름 · "단가 · 수량" · 금액 */
export function OrderItemRow({ item }: { item: Item }) {
  return (
    <li className="flex items-center gap-4 border-b border-line py-2 lg:py-2">
      {item.product ? (
        <Image
          src={item.product.imagePath}
          alt=""
          width={64}
          height={64}
          className="size-14 shrink-0 rounded-input object-cover lg:size-16"
        />
      ) : (
        <span aria-hidden className="size-14 shrink-0 rounded-input bg-section lg:size-16" />
      )}
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <p className="truncate type-body-lg text-heading">{item.productName}</p>
        <p className="type-body-sm text-caption">
          {formatPrice(item.unitPrice)} · {item.quantity}개{item.giftWrap && " · 선물 포장"}
        </p>
      </div>
      <p className="shrink-0 type-price text-heading">{formatPrice(item.lineTotal)}</p>
    </li>
  );
}
