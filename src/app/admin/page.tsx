import { redirect } from "next/navigation";

/** /admin → 상품 목록 */
export default function AdminPage() {
  redirect("/admin/products");
}
