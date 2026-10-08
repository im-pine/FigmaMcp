import { Suspense } from "react";
import { OrderList } from "@/features/admin/order/components/OrderList";
import { parseStatus } from "@/features/admin/order/status";
import { getAdminOrders } from "@/server/services/order/admin";
import { getOrderStatusCounts } from "@/server/services/order/counts";

/** 관리자 주문 목록 — ?status=RECEIVED|PREPARING|SHIPPING|DELIVERED|CANCELED, 없으면 전체 */
export default function AdminOrdersPage({ searchParams }: PageProps<"/admin/orders">) {
  return (
    <Suspense fallback={<OrdersSkeleton />}>
      <Orders searchParams={searchParams} />
    </Suspense>
  );
}

async function Orders({ searchParams }: Pick<PageProps<"/admin/orders">, "searchParams">) {
  const status = parseStatus((await searchParams).status);
  const [rows, counts] = await Promise.all([getAdminOrders(status), getOrderStatusCounts()]);
  return <OrderList rows={rows} counts={counts} status={status} />;
}

function OrdersSkeleton() {
  return (
    <div className="flex flex-col gap-4 p-4 lg:p-8">
      <div className="h-8 w-40 animate-pulse rounded-input bg-section" />
      <div className="h-10 animate-pulse rounded-pill bg-section" />
      <div className="h-96 animate-pulse rounded-card bg-section" />
    </div>
  );
}
