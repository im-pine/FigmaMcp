import { SHIPPING } from "@/shared/constants/catalog";
import { formatPrice } from "@/shared/lib/format";
import { cn } from "@/shared/lib/utils";

/** Figma: OrderSummary — 장바구니 · 주문서 오른쪽(모바일은 아래) 주문 요약 카드 */
type OrderSummaryProps = {
  subtotal: number;
  shippingFee: number;
  total: number;
  /** 카드 맨 아래 주요 버튼 (주문하기 · N원 결제하기) */
  action: React.ReactNode;
  className?: string;
};

export function OrderSummary({ subtotal, shippingFee, total, action, className }: OrderSummaryProps) {
  return (
    <section
      aria-labelledby="order-summary-title"
      className={cn("flex flex-col rounded-card bg-card p-6 shadow-card lg:p-8", className)}
    >
      <h2 id="order-summary-title" className="type-h3 text-heading">
        주문 요약
      </h2>
      <dl className="mt-5 flex flex-col gap-4 type-body-md text-body">
        <div className="flex justify-between">
          <dt>상품 금액</dt>
          <dd>{formatPrice(subtotal)}</dd>
        </div>
        <div className="flex justify-between">
          <dt>배송비</dt>
          <dd>{shippingFee === 0 ? "무료" : formatPrice(shippingFee)}</dd>
        </div>
        <div className="mt-1 flex items-center justify-between border-t border-line pt-5">
          <dt className="type-body-lg text-heading">총 결제 금액</dt>
          <dd className="type-h3 text-heading">{formatPrice(total)}</dd>
        </div>
      </dl>
      <p className="mt-3 type-body-sm text-link">
        {shippingFee === 0 && subtotal > 0
          ? "무료 배송이 적용되었어요"
          : `${formatPrice(SHIPPING.freeThreshold)} 이상 구매 시 무료 배송`}
      </p>
      <div className="mt-5 flex flex-col">{action}</div>
    </section>
  );
}
