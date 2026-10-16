import type { Metadata } from "next";
import { getDict } from "@/i18n/server";
import { LegalPage } from "@/components/Legal";

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getDict()).meta.offer };
}

export default function Page() {
  return <LegalPage doc="offer" />;
}
