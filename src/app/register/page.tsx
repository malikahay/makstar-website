import type { Metadata } from "next";
import { getDict } from "@/i18n/server";
import { Suspense } from "react";
import { RegisterPage } from "@/components/Account";

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getDict()).meta.register, robots: { index: false } };
}

export default function Page() {
  return (
    <Suspense>
      <RegisterPage />
    </Suspense>
  );
}
