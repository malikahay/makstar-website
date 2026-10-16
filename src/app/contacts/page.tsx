import type { Metadata } from "next";
import { getDict } from "@/i18n/server";
import { ContactsPage } from "@/components/Contacts";

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getDict()).meta.contacts };
}

export default function Page() {
  return <ContactsPage />;
}
