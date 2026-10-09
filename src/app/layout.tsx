import type { Metadata } from "next";
import { Noto_Sans_KR, Noto_Serif_KR } from "next/font/google";
import { QueryProvider } from "@/shared/providers/QueryProvider";
import "./globals.css";

// 제목: Noto Serif KR, 본문 · UI: Noto Sans KR (Figma 텍스트 스타일과 동일)
const notoSans = Noto_Sans_KR({
  variable: "--font-noto-sans-kr",
  weight: ["400", "500", "700"],
  subsets: ["latin"],
  display: "swap",
});

const notoSerif = Noto_Serif_KR({
  variable: "--font-noto-serif-kr",
  weight: ["400", "500"],
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  // 탭 제목은 고정 문구만 쓴다 (상품명처럼 불러와야 하는 데이터는 넣지 않는다 — 불러오는 동안 주소가 제목에 보임).
  // 상품 · 상품 목록 · 홈은 "Pine Bakery" 그대로, 그 밖의 화면은 "주문 내역 | Pine Bakery"처럼 화면 이름을 붙인다.
  title: "Pine Bakery",
  description: "매일 아침 직접 굽는 빵과 디저트 — Figma MCP로 디자인한 베이커리 쇼핑몰",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ko" className={`${notoSans.variable} ${notoSerif.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
