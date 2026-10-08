import type { Metadata } from "next";
import { Suspense } from "react";
import { OrderComplete, OrderCompleteSkeleton } from "@/features/shop/checkout/components/OrderComplete";

export const metadata: Metadata = { title: "주문 완료 | Pine Bakery" };

export default function OrderCompletePage({ searchParams }: PageProps<"/orders/complete">) {
  return (
    <Suspense fallback={<OrderCompleteSkeleton />}>
      <CompleteContent searchParams={searchParams} />
    </Suspense>
  );
}

async function CompleteContent({ searchParams }: Pick<PageProps<"/orders/complete">, "searchParams">) {
  const { orderNo } = await searchParams;
  return <OrderComplete orderNo={typeof orderNo === "string" ? orderNo : undefined} />;
}
