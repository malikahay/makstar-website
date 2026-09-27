import type { Metadata } from "next";
import { DeliveryPage } from "@/components/Delivery";

export const metadata: Metadata = { title: "Доставка и оплата" };

export default function Page() {
  return <DeliveryPage />;
}
