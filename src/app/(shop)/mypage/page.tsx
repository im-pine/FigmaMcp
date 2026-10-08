import type { Metadata } from "next";
import { MyPage } from "@/features/shop/mypage/components/MyPage";

export const metadata: Metadata = { title: "마이페이지 | Pine Bakery" };

export default function Page() {
  return <MyPage />;
}
