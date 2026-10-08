import type { Metadata } from "next";
import { AdminHeader } from "@/features/admin/layout/AdminHeader";
import { AdminMobileHeader } from "@/features/admin/layout/AdminMobileHeader";
import { AdminSidebar } from "@/features/admin/layout/AdminSidebar";
import { AdminTabBar } from "@/features/admin/layout/AdminTabBar";
import { getOrderStatusCounts } from "@/server/services/order/counts";

export const metadata: Metadata = { title: "관리자 · Pine Bakery" };

/** 관리자 전체 틀 — 데스크톱: 사이드바 + 헤더, 모바일: 로고 헤더 + 하단 탭 바 (shadcn dashboard-01) */
export default async function AdminLayout({ children }: LayoutProps<"/admin">) {
  const counts = await getOrderStatusCounts();

  return (
    <div className="flex min-h-dvh bg-page">
      <AdminSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <AdminHeader />
        <AdminMobileHeader />
        <main className="flex-1 pb-24 lg:pb-12">{children}</main>
      </div>
      <AdminTabBar receivedCount={counts.RECEIVED} />
    </div>
  );
}
