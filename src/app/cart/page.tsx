import type { Metadata } from "next";
import { getDict } from "@/i18n/server";
import { CartPage } from "@/components/Checkout";

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getDict()).meta.cart };
}

export default function Page() {
  return <CartPage />;
}
