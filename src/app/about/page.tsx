import type { Metadata } from "next";
import { AboutPage } from "@/components/About";

export const metadata: Metadata = { title: "О нас" };

export default function Page() {
  return <AboutPage />;
}
