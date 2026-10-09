import { Suspense } from "react";
import { redirect } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { isMemberLoggedIn } from "@/server/auth/member-session";
import type { OrderStatus } from "@/generated/prisma/enums";
import { DEMO_MEMBER_NAME, getDemoMemberOrders } from "@/server/services/order/member";
import { formatPrice } from "@/shared/lib/format";
import { StatusBadge } from "@/shared/ui/StatusBadge";
import { openMemberOrder } from "../actions";
import { ORDER_STATUS_LABEL, formatOrderDay } from "../labels";
import { OrderStatusFilter } from "./OrderStatusFilter";

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

/** ?status= 값 검증 — 모르는 값은 전체 */
function statusFromParam(param: string | string[] | undefined): OrderStatus | undefined {
  const value = typeof param === "string" ? param.toUpperCase() : "";
  return value in ORDER_STATUS_LABEL ? (value as OrderStatus) : undefined;
}

/*
 * 회원 주문 내역 (Figma: Order List (Member) 24:2146 / Mobile 24:2236) — 임시 로그인용 데모 회원.
 *
 * 화면 틀(제목 · "님의 주문 …건" 문구)은 데이터 없이 바로 그리고, 데이터가 필요한 곳만 <Suspense>로 나눈다.
 * - 주문 건수 숫자 → <OrderCount />
 * - 상태 필터 + 주문 카드 → <OrdersBody />
 * 화면 전체를 하나의 Suspense로 감싸면 다시 들어올 때마다 제목까지 스켈레톤으로 바뀌었다가 그려져,
 * 화면이 멈추고 깨지는 것처럼 보인다 (Wiki: 문제 해결 기록).
 */
export function MemberOrderList({ searchParams }: { searchParams: SearchParams }) {
  return (
    <>
      <section className="lg:bg-section">
        <div className="mx-auto flex max-w-[1440px] flex-col gap-1 px-5 pt-8 pb-5 lg:gap-3 lg:px-20 lg:py-16">
          <p className="hidden type-label text-link lg:block">My orders · Member</p>
          <h1 className="type-h2 text-heading lg:type-h1 lg:text-[44px]">주문 내역</h1>
          <p className="type-body-sm text-body lg:type-body-md">
            {DEMO_MEMBER_NAME}님의 주문{" "}
            <Suspense
              fallback={<span className="inline-block w-4 animate-pulse rounded bg-line">&nbsp;</span>}
            >
              <OrderCount />
            </Suspense>
            건
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-[1440px] px-5 pb-12 lg:px-20 lg:pt-12 lg:pb-30">
        <Suspense fallback={<OrdersBodySkeleton />}>
          <OrdersBody searchParams={searchParams} />
        </Suspense>
      </div>
    </>
  );
}

async function OrderCount() {
  return (await getDemoMemberOrders()).length;
}

async function OrdersBody({ searchParams }: { searchParams: SearchParams }) {
  if (!(await isMemberLoggedIn())) redirect("/mypage");
  const status = statusFromParam((await searchParams).status);
  const allOrders = await getDemoMemberOrders();
  const orders = status ? allOrders.filter((o) => o.status === status) : allOrders;

  const counts: { all: number } & Partial<Record<OrderStatus, number>> = { all: allOrders.length };
  for (const o of allOrders) counts[o.status] = (counts[o.status] ?? 0) + 1;

  return (
    <>
      <OrderStatusFilter current={status} counts={counts} />
      <p className="mt-6 mb-4 hidden type-body-sm text-caption lg:block">최근 주문 순</p>
      {orders.length === 0 ? (
        <p className="mt-5 rounded-card bg-card px-5 py-16 text-center type-body-md text-caption">
          {status ? `${ORDER_STATUS_LABEL[status]} 상태인 주문이 없어요.` : "주문 내역이 없어요."}
        </p>
      ) : (
        <ul className="mt-5 grid gap-4 lg:mt-0 lg:grid-cols-3">
          {orders.map((o) => {
            const [first, ...rest] = o.items;
            return (
              <li key={o.orderNo}>
                <article className="flex flex-col rounded-card bg-card p-5">
                  <div className="flex items-center justify-between">
                    <time dateTime={o.createdAt.toISOString()} className="type-body-sm text-caption">
                      {formatOrderDay(o.createdAt)}
                    </time>
                    <StatusBadge status={o.status} />
                  </div>
                  <h2 className="mt-3 type-title text-heading">
                    {first?.productName}
                    {rest.length > 0 && ` 외 ${rest.length}건`}
                  </h2>
                  <p className="mt-2 type-body-sm text-caption">주문번호 {o.orderNo}</p>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="type-price text-heading">{formatPrice(o.total)}</span>
                    <form action={openMemberOrder}>
                      <input type="hidden" name="orderNo" value={o.orderNo} />
                      <button
                        type="submit"
                        className="inline-flex min-h-10 items-center gap-1 type-body-sm text-link hover:underline"
                      >
                        상세 보기 <ArrowRight aria-hidden className="size-4" />
                      </button>
                    </form>
                  </div>
                </article>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}

/** 상태 필터 + 카드 자리 (OrdersBody fallback) — 실제와 같은 높이로 두어 화면이 밀리지 않게 한다 */
function OrdersBodySkeleton() {
  return (
    <div aria-busy="true" aria-label="주문 내역을 불러오는 중" className="animate-pulse">
      <div className="flex gap-2">
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="h-10 w-24 shrink-0 rounded-pill bg-section" />
        ))}
      </div>
      <div className="mt-6 mb-4 hidden h-5 lg:block" />
      <div className="mt-5 grid gap-4 lg:mt-0 lg:grid-cols-3">
        {Array.from({ length: 3 }, (_, i) => (
          <div key={i} className="h-[189px] rounded-card bg-section" />
        ))}
      </div>
    </div>
  );
}
