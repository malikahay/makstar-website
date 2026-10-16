import type { Metadata } from "next";
import { getDict } from "@/i18n/server";
import { CheckoutPage } from "@/components/Checkout";

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getDict()).meta.checkout };
}

export default function Page() {
  return <CheckoutPage />;
}
