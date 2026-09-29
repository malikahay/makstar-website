import type { Metadata } from "next";
import { Suspense } from "react";
import { RegisterPage } from "@/components/Account";

export const metadata: Metadata = { title: "Регистрация", robots: { index: false } };

export default function Page() {
  return (
    <Suspense>
      <RegisterPage />
    </Suspense>
  );
}
