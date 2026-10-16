import type { Metadata } from "next";
import { getDict } from "@/i18n/server";
import { AboutPage } from "@/components/About";

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getDict()).meta.about };
}

export default function Page() {
  return <AboutPage />;
}
