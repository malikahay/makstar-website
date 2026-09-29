import type { Metadata } from "next";
import { Suspense } from "react";
import { LoginPage } from "@/components/Account";

export const metadata: Metadata = { title: "Вход", robots: { index: false } };

export default function Page() {
  return (
    <Suspense>
      <LoginPage />
    </Suspense>
  );
}
