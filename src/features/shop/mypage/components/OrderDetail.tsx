import { cache, Suspense } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getAccessibleOrder } from "@/server/services/order/lookup";
import { isMemberLoggedIn } from "@/server/auth/member-session";
import { formatPrice } from "@/shared/lib/format";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { formatOrderDate, ORDER_STATUS_LABEL, PAYMENT_METHOD_LABEL } from "../labels";
import { OrderItemRow } from "./OrderItemRow";
import { OrderProgress } from "./OrderProgress";

type Params = Promise<{ orderNo: string }>;

/** 한 요청 안에서 배지 · 주문 정보 · 본문이 같은 조회 결과를 쓴다 (DB · 쿠키 확인 1번) */
const loadOrder = cache(async (params: Params) =>
  getAccessibleOrder(decodeURIComponent((await params).orderNo)),
);

/*
 * 주문 상세 (Figma: OrderDetail 21:1955 / Mobile 22:2022)
 * 주문번호 + 연락처 조회를 통과한 경우에만 내용이 보인다. 개인정보는 서비스에서 가린 값만 받는다.
 *
 * 고정된 틀(돌아가기 줄 자리 · "주문 상세" 제목)은 바로 그리고, 데이터가 필요한 곳만 각각 <Suspense>로 채운다.
 * - 돌아가기 링크(로그인 상태에 따라 목적지가 다름) · 상태 뱃지 · 주문번호/일시 · 본문
 * 페이지 전체를 Suspense 하나로 감싸면 들어올 때마다 제목까지 스켈레톤으로 바뀐다 (Wiki: Troubleshooting).
 */
export function OrderDetail({ params }: { params: Params }) {
  return (
    <div className="mx-auto max-w-[1440px] px-5 pt-6 pb-12 lg:px-20 lg:pt-12 lg:pb-30">
      <Suspense fallback={<div aria-hidden className="h-5" />}>
        <BackLink />
      </Suspense>
      <div className="mt-6 lg:mt-8">
        <header className="flex flex-col gap-2 lg:gap-3">
          <div className="flex items-center gap-4">
            <h1 className="type-h2 text-heading lg:type-h1 lg:text-[44px]">주문 상세</h1>
            <Suspense>
              <StatusBadge params={params} />
            </Suspense>
          </div>
          <Suspense fallback={<div aria-hidden className="h-10 lg:h-6" />}>
            <OrderMeta params={params} />
          </Suspense>
        </header>
        <Suspense fallback={<OrderBodySkeleton />}>
          <OrderBody params={params} />
        </Suspense>
      </div>
    </div>
  );
}

/*
 * 돌아가기 링크 — 회원(임시 로그인)은 주문 내역으로 바로 간다.
 * /mypage로 보내면 로그인 상태라 다시 /mypage/orders로 이동(redirect)해 화면을 두 번 거친다.
 */
async function BackLink() {
  const back = (await isMemberLoggedIn())
    ? { href: "/mypage/orders", label: "주문 내역으로" }
    : { href: "/mypage", label: "마이페이지로" };
  return (
    <Link
      href={back.href}
      className="inline-flex h-5 items-center gap-1 type-body-sm text-link hover:underline"
    >
      <ArrowLeft className="size-4" strokeWidth={1.5} aria-hidden />
      {back.label}
    </Link>
  );
}

async function StatusBadge({ params }: { params: Params }) {
  const order = await loadOrder(params);
  return order ? <Badge>{ORDER_STATUS_LABEL[order.status]}</Badge> : null;
}

async function OrderMeta({ params }: { params: Params }) {
  const order = await loadOrder(params);
  if (!order) return null;
  return (
    <p className="flex flex-col type-body-sm text-caption lg:flex-row lg:type-body-md">
      <span>주문번호 {order.orderNo}</span>
      <span className="hidden lg:inline">&nbsp;·&nbsp;</span>
      <span>{formatOrderDate(order.createdAt)} 주문</span>
    </p>
  );
}

async function OrderBody({ params }: { params: Params }) {
  const order = await loadOrder(params);
  if (!order) return <OrderAccessRequired />;

  const shipping = [
    { label: "받는 분", value: order.recipientName },
    { label: "연락처", value: order.recipientPhone },
    { label: "주소", value: order.address },
    ...(order.requestNote ? [{ label: "요청사항", value: order.requestNote }] : []),
  ];

  return (
    <>
      <div className="mt-6 lg:mt-8">
        <OrderProgress status={order.status} />
      </div>

      <div className="mt-8 flex flex-col gap-8 lg:grid lg:grid-cols-[minmax(0,1fr)_396px] lg:items-start lg:gap-15">
        <div className="flex flex-col gap-8 lg:gap-12">
          <section aria-labelledby="items-title">
            <h2 id="items-title" className="type-h3 text-heading">
              주문 상품 {order.items.length}개
            </h2>
            <ul className="mt-1">
              {order.items.map((item) => (
                <OrderItemRow key={item.id} item={item} />
              ))}
            </ul>
          </section>

          <section aria-labelledby="shipping-title" className="flex flex-col gap-3 lg:gap-4">
            <h2 id="shipping-title" className="type-h3 text-heading">
              배송 정보
            </h2>
            <dl className="grid grid-cols-[72px_1fr] gap-x-4 gap-y-3 type-body-sm lg:grid-cols-[100px_1fr] lg:gap-y-4 lg:type-body-md">
              {shipping.map((row) => (
                <div key={row.label} className="contents">
                  <dt className="text-caption">{row.label}</dt>
                  <dd className="text-heading">{row.value}</dd>
                </div>
              ))}
            </dl>
            <p className="type-body-sm text-caption">개인정보 보호를 위해 일부 정보는 가려서 보여 드려요.</p>
          </section>
        </div>

        <aside
          aria-labelledby="payment-title"
          className="flex flex-col gap-6 lg:rounded-card lg:bg-card lg:p-8 lg:shadow-card"
        >
          <section className="flex flex-col gap-4 rounded-card bg-card p-5 lg:rounded-none lg:bg-transparent lg:p-0">
            <h2 id="payment-title" className="type-h3 text-heading">
              결제 정보
            </h2>
            <dl className="flex flex-col gap-4 type-body-sm lg:type-body-md">
              <Row label="상품 금액" value={formatPrice(order.subtotal)} />
              <Row label="배송비" value={order.shippingFee === 0 ? "무료" : formatPrice(order.shippingFee)} />
              <div className="flex items-center justify-between border-t border-line pt-4">
                <dt className="type-body-md text-heading lg:type-body-lg">총 결제 금액</dt>
                <dd className="type-h3 text-heading">{formatPrice(order.total)}</dd>
              </div>
              <Row label="결제 수단" value={PAYMENT_METHOD_LABEL[order.paymentMethod]} />
            </dl>
          </section>

          <div className="flex flex-col gap-3 lg:gap-4">
            <Button asChild className="w-full">
              <Link href="/products">쇼핑 계속하기</Link>
            </Button>
            <Button asChild variant="secondary" className="w-full">
              <Link href="/mypage">다른 주문 조회</Link>
            </Button>
          </div>
        </aside>
      </div>
    </>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-caption">{label}</dt>
      <dd className="text-body">{value}</dd>
    </div>
  );
}

/**
 * 조회를 거치지 않았거나(주소 직접 입력) 확인 시간이 지난 경우.
 * 주문이 존재하는지 여부도 드러내지 않도록 항상 같은 안내를 보여 준다.
 */
function OrderAccessRequired() {
  return (
    <section className="mx-auto mt-6 flex max-w-[440px] flex-col items-center gap-4 rounded-card bg-card p-8 text-center lg:mt-8 lg:shadow-card">
      <h2 className="type-h3 text-heading">주문 조회가 필요해요</h2>
      <p className="type-body-md text-body">
        주문 상세는 주문번호와 주문자 연락처로 조회한 뒤 확인할 수 있어요. 조회 후 10분이 지나면 다시 조회해
        주세요.
      </p>
      <Button asChild className="w-full">
        <Link href="/mypage">주문 조회하기</Link>
      </Button>
    </section>
  );
}

/** 본문(진행 단계 · 주문 상품 · 배송 · 결제)을 불러오는 동안 보여 줄 자리 */
function OrderBodySkeleton() {
  return (
    <div
      aria-busy="true"
      aria-label="주문 정보를 불러오는 중"
      className="mt-6 flex animate-pulse flex-col gap-8 lg:mt-8"
    >
      <div className="h-24 rounded-card bg-section" />
      <div className="flex flex-col gap-8 lg:grid lg:grid-cols-[minmax(0,1fr)_396px] lg:gap-15">
        <div className="h-64 rounded-card bg-section" />
        <div className="h-64 rounded-card bg-section" />
      </div>
    </div>
  );
}
