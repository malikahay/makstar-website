import type { Metadata } from "next";
import { ContactsPage } from "@/components/Contacts";

export const metadata: Metadata = { title: "Контакты и поддержка" };

export default function Page() {
  return <ContactsPage />;
}
