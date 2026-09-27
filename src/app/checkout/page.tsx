import type { Metadata } from "next";
import { CheckoutPage } from "@/components/Checkout";

export const metadata: Metadata = { title: "Оформление заказа" };

export default function Page() {
  return <CheckoutPage />;
}
