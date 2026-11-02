import { redirect } from "next/navigation";

export default async function MMFProductsPage() {
  redirect("/admin/products");
}