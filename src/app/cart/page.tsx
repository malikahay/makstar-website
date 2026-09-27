import type { Metadata } from "next";
import { CartPage } from "@/components/Checkout";

export const metadata: Metadata = { title: "Корзина" };

export default function Page() {
  return <CartPage />;
}
