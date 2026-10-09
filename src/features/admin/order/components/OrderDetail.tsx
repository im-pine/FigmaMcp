import { ArrowLeft, Check } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Fragment } from "react";
import type { OrderStatus } from "@/generated/prisma/enums";
import { StatusBadge } from "@/shared/ui/StatusBadge";
import type { AdminOrder } from "@/server/services/order/admin";
import {
  ORDER_PROGRESS,
  ORDER_STATUS_LABEL,
  PAYMENT_METHOD_LABEL,
  formatOrderDate,
} from "@/shared/constants/order";
import { formatPrice } from "@/shared/lib/format";
import { cn } from "@/shared/lib/utils";
import { NextStepButton, StatusChangeTrigger } from "./StatusChange";

const CARD = "rounded-card border border-line bg-card p-6";

/**
 * 관리자 주문 상세 (Figma: Admin Order Detail 76:5308 / Mobile 77:5364).
 * 데스크톱: 상태 변경 버튼 + 진행 단계 + 두 단. 모바일: 상단 바 + 세로 카드 + 하단 고정 버튼.
 */
export function OrderDetail({ order }: { order: AdminOrder }) {
  const quantity = order.items.reduce((sum, i) => sum + i.quantity, 0);
  const date = formatOrderDate(order.createdAt);

  const orderer = (
    <InfoCard
      title="주문자 정보"
      rows={[
        ["주문자", order.ordererName],
        ["연락처", order.ordererPhone],
        ["이메일", order.ordererEmail],
        ["결제 수단", PAYMENT_METHOD_LABEL[order.paymentMethod]],
      ]}
    />
  );
  const recipientRows: [string, string][] = [
    ["받는 분", order.recipientName],
    ["연락처", order.recipientPhone],
    ["주소", order.address],
    ["요청사항", order.requestNote || "없음"],
  ];

  return (
    <>
      {/* ───────── 데스크톱 ───────── */}
      <div className="hidden flex-col gap-6 p-8 lg:flex">
        <Link
          href="/admin/orders"
          className="flex w-fit items-center gap-1 type-body-sm text-link hover:underline"
        >
          <ArrowLeft className="size-4" strokeWidth={1.5} aria-hidden />
          주문 목록
        </Link>
        <div className="flex items-end justify-between gap-6">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-3">
              <h1 className="type-h2 text-heading">주문 {order.orderNo}</h1>
              <StatusBadge status={order.status} />
            </div>
            <p className="type-body-sm text-caption">
              {date} 주문 · 상품 {quantity}개 · {formatPrice(order.total)}
            </p>
          </div>
          <div className="flex gap-3">
            <StatusChangeTrigger
              orderNo={order.orderNo}
              status={order.status}
              mode="menu"
              className="inline-flex h-12 items-center rounded-pill border border-line-strong px-7 type-button text-heading outline-none hover:bg-section focus-visible:ring-[3px] focus-visible:ring-ring/50 data-[state=open]:bg-section"
            >
              다른 상태로 변경
            </StatusChangeTrigger>
            <NextStepButton orderNo={order.orderNo} status={order.status} />
          </div>
        </div>

        <Progress status={order.status} />

        <div className="flex items-start gap-6">
          <div className="flex min-w-0 flex-1 flex-col gap-6">
            <ItemsCard order={order} quantity={quantity} />
            <PaymentCard order={order} />
          </div>
          <div className="flex w-[380px] shrink-0 flex-col gap-6">
            {orderer}
            <InfoCard
              title="받는 분 정보"
              rows={recipientRows}
              note="개인정보 보호를 위해 관리자 화면에서도 일부를 가려서 보여 줍니다."
            />
          </div>
        </div>
      </div>

      {/* ───────── 모바일 ───────── */}
      <div className="flex flex-col pb-24 lg:hidden">
        <div className="sticky top-0 z-[35] grid h-14 grid-cols-[48px_1fr_48px] items-center border-b border-line bg-page px-1">
          <Link
            href="/admin/orders"
            aria-label="주문 목록"
            className="flex size-12 items-center justify-center text-heading"
          >
            <ArrowLeft className="size-6" strokeWidth={1.5} />
          </Link>
          <h1 className="text-center type-body-lg font-medium text-heading">주문 상세</h1>
        </div>
        <div className="flex flex-col gap-4 px-4 py-5">
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between gap-3">
              <p className="type-h3 text-heading">{order.orderNo}</p>
              <StatusBadge status={order.status} />
            </div>
            <p className="type-body-sm text-caption">
              {date} 주문 · {formatPrice(order.total)}
            </p>
          </div>
          <Progress status={order.status} compact />
          <ItemsCard order={order} quantity={quantity} compact />
          {orderer}
          <InfoCard title="받는 분 정보" rows={recipientRows} />
          <PaymentCard order={order} />
        </div>

        {/* 하단 고정 버튼 — 탭 바(z-40)를 덮는다 */}
        <div className="fixed inset-x-0 bottom-0 z-50 border-t border-line bg-card pb-[env(safe-area-inset-bottom)]">
          <div className="flex h-[76px] items-center gap-3 px-4">
            <StatusChangeTrigger
              orderNo={order.orderNo}
              status={order.status}
              mode="sheet"
              className={cn(
                "inline-flex h-12 items-center justify-center rounded-pill border border-line-strong px-6 type-button whitespace-nowrap text-heading",
                !NEXT_EXISTS(order.status) && "flex-1",
              )}
            >
              {NEXT_EXISTS(order.status) ? "다른 상태" : "상태 변경"}
            </StatusChangeTrigger>
            <NextStepButton orderNo={order.orderNo} status={order.status} className="flex-1" />
          </div>
        </div>
      </div>
    </>
  );
}

const NEXT_EXISTS = (status: OrderStatus) => status !== "DELIVERED" && status !== "CANCELED";

/** 배송 진행 단계: 완료 = 채운 원 + 체크, 현재 = 링, 이후 = 빈 원 */
function Progress({ status, compact = false }: { status: OrderStatus; compact?: boolean }) {
  if (status === "CANCELED") {
    return (
      <p className={cn("rounded-card bg-card type-body-md text-body", compact ? "px-4 py-4" : "px-8 py-6")}>
        취소된 주문이에요. 배송이 진행되지 않습니다.
      </p>
    );
  }
  const current = ORDER_PROGRESS.indexOf(status);
  return (
    <ol
      aria-label="배송 진행 단계"
      className={cn("flex items-start rounded-card bg-card", compact ? "px-3 py-4" : "px-8 py-6")}
    >
      {ORDER_PROGRESS.map((step, i) => {
        const state = i < current ? "done" : i === current ? "current" : "upcoming";
        return (
          <Fragment key={step}>
            {i > 0 && (
              <li
                aria-hidden
                className={cn(
                  "h-0.5 flex-1",
                  compact ? "mx-1.5 mt-[11px]" : "mx-2 mt-[15px]",
                  i <= current ? "bg-action" : "bg-line",
                )}
              />
            )}
            <li
              className={cn("flex flex-col items-center", compact ? "gap-1.5" : "gap-2")}
              aria-current={state === "current" ? "step" : undefined}
            >
              <span
                className={cn(
                  "flex items-center justify-center rounded-full",
                  compact ? "size-6" : "size-8",
                  state === "done" && "bg-action text-on-action",
                  state === "current" && "border-2 border-action",
                  state === "upcoming" && "border-2 border-line",
                )}
              >
                {state === "done" && <Check className={compact ? "size-3.5" : "size-4"} strokeWidth={3} />}
                {state === "current" && (
                  <span className={cn("rounded-full bg-action", compact ? "size-2.5" : "size-3")} />
                )}
              </span>
              <span
                className={cn(
                  "whitespace-nowrap",
                  compact ? "text-[11px] leading-tight" : "type-body-sm",
                  state === "upcoming" ? "text-caption" : "font-medium text-heading",
                )}
              >
                {ORDER_STATUS_LABEL[step]}
                <span className="sr-only">
                  {state === "done" ? " (완료)" : state === "current" ? " (현재 단계)" : ""}
                </span>
              </span>
            </li>
          </Fragment>
        );
      })}
    </ol>
  );
}

function ItemsCard({
  order,
  quantity,
  compact = false,
}: {
  order: AdminOrder;
  quantity: number;
  compact?: boolean;
}) {
  return (
    <section className={cn(CARD, "flex flex-col gap-4", compact && "p-5")}>
      <h2 className="type-title text-heading">주문 상품 {quantity}개</h2>
      <ul className="flex flex-col">
        {order.items.map((item) => (
          <li key={item.id} className="flex items-center gap-4 border-b border-line py-3 first:pt-0">
            {item.product ? (
              <Image
                src={item.product.imagePath}
                alt=""
                width={52}
                height={52}
                className={cn(
                  "size-[52px] shrink-0 object-cover",
                  compact ? "rounded-full" : "rounded-input",
                )}
              />
            ) : (
              <span
                aria-hidden
                className={cn("size-[52px] shrink-0 bg-section", compact ? "rounded-full" : "rounded-input")}
              />
            )}
            <div className="flex min-w-0 flex-1 flex-col gap-0.5">
              <p className="truncate type-body-md text-heading">{item.productName}</p>
              <p className="type-body-sm text-caption">
                {formatPrice(item.unitPrice)} · {item.quantity}개{item.giftWrap && " · 선물 포장"}
              </p>
            </div>
            <p className="shrink-0 type-body-lg font-bold text-heading">{formatPrice(item.lineTotal)}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}

function PaymentCard({ order }: { order: AdminOrder }) {
  return (
    <section className={cn(CARD, "flex flex-col gap-3")}>
      <h2 className="type-title text-heading">결제 정보</h2>
      <Row label="상품 금액" value={formatPrice(order.subtotal)} />
      <Row label="배송비" value={order.shippingFee === 0 ? "무료" : formatPrice(order.shippingFee)} />
      <div className="flex items-center justify-between border-t border-line pt-3">
        <span className="type-body-sm text-body">총 결제 금액</span>
        <span className="type-body-lg font-bold text-heading">{formatPrice(order.total)}</span>
      </div>
    </section>
  );
}

function InfoCard({ title, rows, note }: { title: string; rows: [string, string][]; note?: string }) {
  return (
    <section className={cn(CARD, "flex flex-col gap-3")}>
      <h2 className="type-title text-heading">{title}</h2>
      {rows.map(([label, value]) => (
        <Row key={label} label={label} value={value} />
      ))}
      {note && <p className="pt-1 type-body-sm break-keep text-caption">{note}</p>}
    </section>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 type-body-sm">
      <span className="shrink-0 text-body">{label}</span>
      <span className="text-right break-keep text-heading">{value}</span>
    </div>
  );
}

/** 상세 로딩 중 자리 */
export function OrderDetailSkeleton() {
  return (
    <div className="flex flex-col gap-4 p-4 lg:p-8">
      <div className="h-8 w-60 animate-pulse rounded-input bg-section" />
      <div className="h-24 animate-pulse rounded-card bg-section" />
      <div className="h-64 animate-pulse rounded-card bg-section" />
    </div>
  );
}
