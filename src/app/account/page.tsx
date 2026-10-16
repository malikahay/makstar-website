import type { Metadata } from "next";
import { getDict } from "@/i18n/server";
import { AccountPage } from "@/components/Account";

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getDict()).meta.account, robots: { index: false } };
}

export default function Page() {
  return <AccountPage />;
}
