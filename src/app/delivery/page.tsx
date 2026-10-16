import type { Metadata } from "next";
import { getDict } from "@/i18n/server";
import { DeliveryPage } from "@/components/Delivery";

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getDict()).meta.delivery };
}

export default function Page() {
  return <DeliveryPage />;
}
