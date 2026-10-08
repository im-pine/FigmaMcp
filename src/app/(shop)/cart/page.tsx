import type { Metadata } from "next";
import { CartView } from "@/features/shop/cart/components/CartView";

export const metadata: Metadata = { title: "장바구니 | Pine Bakery" };

export default function CartPage() {
  return <CartView />;
}
