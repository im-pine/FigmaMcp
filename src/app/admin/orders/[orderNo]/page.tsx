import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { OrderDetail, OrderDetailSkeleton } from "@/features/admin/order/components/OrderDetail";
import { getAdminOrder } from "@/server/services/order/admin";

export async function generateMetadata({ params }: PageProps<"/admin/orders/[orderNo]">): Promise<Metadata> {
  const { orderNo } = await params;
  return { title: `주문 ${decodeURIComponent(orderNo)} · 관리자 · Pine Bakery` };
}

/** 관리자 주문 상세 — params는 <Suspense> 안에서 읽는다 */
export default function AdminOrderDetailPage({ params }: PageProps<"/admin/orders/[orderNo]">) {
  return (
    <Suspense fallback={<OrderDetailSkeleton />}>
      <OrderByNo params={params} />
    </Suspense>
  );
}

async function OrderByNo({ params }: Pick<PageProps<"/admin/orders/[orderNo]">, "params">) {
  const order = await getAdminOrder(decodeURIComponent((await params).orderNo));
  if (!order) notFound();
  return <OrderDetail order={order} />;
}
