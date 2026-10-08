import { Suspense } from "react";
import type { Metadata } from "next";
import { OrderDetail, OrderDetailSkeleton } from "@/features/shop/mypage/components/OrderDetail";

export const metadata: Metadata = { title: "주문 상세 | Pine Bakery" };

/** 주문 데이터는 캐시하지 않는다: 쿠키 확인 + DB 조회를 Suspense 안에서 요청마다 실행 */
export default function Page({ params }: PageProps<"/mypage/orders/[orderNo]">) {
  return (
    <Suspense fallback={<OrderDetailSkeleton />}>
      <OrderDetail params={params} />
    </Suspense>
  );
}
