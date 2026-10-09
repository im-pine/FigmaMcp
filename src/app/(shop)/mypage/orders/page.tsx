import type { Metadata } from "next";
import { MemberOrderList } from "@/features/shop/mypage/components/MemberOrderList";

export const metadata: Metadata = { title: "주문 내역 | Pine Bakery" };

/** 화면 틀은 바로 그리고, 데이터가 필요한 부분만 MemberOrderList 안의 Suspense가 나중에 채운다 */
export default function Page({ searchParams }: PageProps<"/mypage/orders">) {
  return <MemberOrderList searchParams={searchParams} />;
}
