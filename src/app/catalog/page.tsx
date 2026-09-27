import type { Metadata } from "next";
import { CatalogGrid } from "@/components/Catalog";
import { PageHero } from "@/components/PageHero";

export const metadata: Metadata = { title: "Каталог" };

export default function Page() {
  return (
    <>
      <PageHero
        eyebrow="Каталог · 10 форм"
        title="Выбирай форму"
        lead="Длинные и короткие, фигурные и для супа. Все — из твёрдой пшеницы и все одинаково любят сковородку."
        pastas={["fusilli", "penne", "farfalle"]}
      />
      <section className="mx-auto max-w-[1400px] px-4 py-12 md:px-8 md:py-16">
        <CatalogGrid />
      </section>
    </>
  );
}
