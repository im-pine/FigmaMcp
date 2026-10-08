import Link from "next/link";
import { Check } from "lucide-react";
import { getOrderCompletion } from "@/server/services/order/create";
import { formatPrice } from "@/shared/lib/format";
import { Button } from "@/shared/ui/button";

/** 주문 완료 (Figma: 데스크톱 8:1015 · 모바일 12:1397) — 주문번호로 DB에서 읽는다 (캐시하지 않음) */
export async function OrderComplete({ orderNo }: { orderNo: string | undefined }) {
  const order = orderNo ? await getOrderCompletion(orderNo) : null;

  if (!order) {
    return (
      <Shell label="ORDER" title="주문을 찾을 수 없어요" message="주문번호를 다시 확인해 주세요.">
        <Actions />
      </Shell>
    );
  }

  const [first, ...rest] = order.items;
  const itemSummary = first
    ? rest.length > 0
      ? `${first.productName} 외 ${rest.length}건`
      : first.productName
    : "-";

  return (
    <Shell
      label="THANK YOU"
      title="주문이 완료되었어요"
      message="갓 구운 빵을 정성껏 포장해 보내 드릴게요."
      icon
    >
      <dl className="mt-8 flex w-full max-w-[480px] flex-col gap-3 rounded-card bg-card px-5 py-5 type-body-sm lg:mt-10 lg:gap-4 lg:px-8 lg:py-7 lg:type-body-md">
        <Row label="주문 번호" value={order.orderNo} />
        <Row label="주문 상품" value={itemSummary} />
        <Row label="결제 금액" value={formatPrice(order.total)} />
      </dl>
      <Actions />
    </Shell>
  );
}

function Shell({
  label,
  title,
  message,
  icon = false,
  children,
}: {
  label: string;
  title: string;
  message: string;
  icon?: boolean;
  children: React.ReactNode;
}) {
  return (
    <section className="mx-auto flex max-w-[1440px] flex-col items-center px-5 pt-14 pb-16 text-center lg:px-20 lg:pt-30 lg:pb-40">
      {icon && (
        <span className="mb-5 flex size-14 items-center justify-center rounded-full bg-badge text-on-badge lg:mb-7 lg:size-20">
          <Check className="size-6 lg:size-8" strokeWidth={1.5} />
        </span>
      )}
      <p className="type-label text-link">{label}</p>
      <h1 className="mt-3 type-h2 text-heading lg:mt-5 lg:type-h1">{title}</h1>
      <p className="mt-3 type-body-md text-body lg:mt-4 lg:type-body-lg">{message}</p>
      {children}
    </section>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-caption">{label}</dt>
      <dd className="text-right text-heading">{value}</dd>
    </div>
  );
}

function Actions() {
  return (
    <div className="mt-6 flex w-full flex-col gap-3 lg:mt-10 lg:w-auto lg:flex-row">
      <Button asChild>
        <Link href="/products">쇼핑 계속하기</Link>
      </Button>
      <Button asChild variant="secondary">
        <Link href="/">홈으로</Link>
      </Button>
    </div>
  );
}

export function OrderCompleteSkeleton() {
  return (
    <section
      aria-busy="true"
      className="mx-auto flex max-w-[1440px] flex-col items-center px-5 pt-14 pb-16 lg:pt-30 lg:pb-40"
    >
      <div className="size-14 animate-pulse rounded-full bg-section lg:size-20" />
      <div className="mt-6 h-10 w-64 animate-pulse rounded bg-section" />
      <div className="mt-10 h-40 w-full max-w-[480px] animate-pulse rounded-card bg-card" />
    </section>
  );
}
