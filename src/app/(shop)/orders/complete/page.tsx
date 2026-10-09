import type { Metadata } from "next";
import { Suspense } from "react";
import {
  OrderComplete,
  OrderCompleteActions,
  OrderCompleteSkeleton,
} from "@/features/shop/checkout/components/OrderComplete";

export const metadata: Metadata = { title: "주문 완료 | Pine Bakery" };

/** 주문 결과(완료 · 찾을 수 없음)는 데이터라 Suspense 안에서, 아래 버튼은 고정이라 바깥에서 바로 그린다 */
export default function OrderCompletePage({ searchParams }: PageProps<"/orders/complete">) {
  return (
    <section className="mx-auto flex max-w-[1440px] flex-col items-center px-5 pt-14 pb-16 text-center lg:px-20 lg:pt-30 lg:pb-40">
      <Suspense fallback={<OrderCompleteSkeleton />}>
        <CompleteContent searchParams={searchParams} />
      </Suspense>
      <OrderCompleteActions />
    </section>
  );
}

async function CompleteContent({ searchParams }: Pick<PageProps<"/orders/complete">, "searchParams">) {
  const { orderNo } = await searchParams;
  return <OrderComplete orderNo={typeof orderNo === "string" ? orderNo : undefined} />;
}
