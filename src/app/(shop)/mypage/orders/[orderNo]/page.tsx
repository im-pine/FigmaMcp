import type { Metadata } from "next";
import { OrderDetail } from "@/features/shop/mypage/components/OrderDetail";

export const metadata: Metadata = { title: "주문 상세 | Pine Bakery" };

/**
 * 주문 데이터는 캐시하지 않는다(쿠키 확인 + DB 조회를 요청마다 실행).
 * 고정된 틀은 OrderDetail이 바로 그리고, 데이터 부분만 그 안의 Suspense가 나중에 채운다.
 */
export default function Page({ params }: PageProps<"/mypage/orders/[orderNo]">) {
  return <OrderDetail params={params} />;
}
