import { LayoutGrid, ShoppingBag, type LucideIcon } from "lucide-react";

/** 관리자 메뉴 (Figma: AdminSidebar · AdminTabBar) */
export const ADMIN_NAV: { href: "/admin/products" | "/admin/orders"; label: string; icon: LucideIcon }[] = [
  { href: "/admin/products", label: "상품", icon: LayoutGrid },
  { href: "/admin/orders", label: "주문", icon: ShoppingBag },
];

/** 헤더 경로 이름: /admin/orders/20261006-0001 → 주문 / 20261006-0001 */
export function adminTitle(pathname: string): string {
  const [, , section, id] = pathname.split("/");
  const label = ADMIN_NAV.find((n) => n.href === `/admin/${section}`)?.label ?? "";
  return id ? `${label} / ${decodeURIComponent(id)}` : label;
}
