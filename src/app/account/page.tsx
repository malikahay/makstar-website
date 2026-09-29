import type { Metadata } from "next";
import { AccountPage } from "@/components/Account";

export const metadata: Metadata = { title: "Личный кабинет", robots: { index: false } };

export default function Page() {
  return <AccountPage />;
}
