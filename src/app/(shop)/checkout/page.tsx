import type { Metadata } from "next";
import { CheckoutView } from "@/features/shop/checkout/components/CheckoutView";

export const metadata: Metadata = { title: "주문서 작성 | Pine Bakery" };

export default function CheckoutPage() {
  return <CheckoutView />;
}
