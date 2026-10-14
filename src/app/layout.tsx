import type { Metadata } from "next";
import { Noto_Sans_KR } from "next/font/google";
import { QueryProvider } from "@/shared/providers/QueryProvider";
import "./globals.css";

// 제목 · 본문 · UI 모두 Noto Sans KR 하나 (Figma 텍스트 스타일과 동일).
// 한글 세리프는 글자 조각이 커서 제목 몇 글자에 폰트 전송량의 65–75%를 차지해 뺐다.
// weight를 지정하지 않으면 가변 폰트(굵기 축 하나)로 받는다 — Google이 굵기마다 같은 파일을 주므로 전송량은 같다
const notoSans = Noto_Sans_KR({
  variable: "--font-noto-sans-kr",
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
    <html lang="ko" className={`${notoSans.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
