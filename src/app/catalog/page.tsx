import type { Metadata } from "next";
import { CatalogGrid } from "@/components/Catalog";
import { PageHero } from "@/components/PageHero";
import { getDict } from "@/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getDict()).meta.catalog };
}

export default async function Page() {
  const t = await getDict();
  return (
    <>
      <PageHero eyebrow={t.catalog.eyebrow} title={t.catalog.title} lead={t.catalog.lead} pastas={["fusilli", "penne", "farfalle"]} />
      <section className="mx-auto max-w-[1400px] px-4 py-12 md:px-8 md:py-16">
        <CatalogGrid />
      </section>
    </>
  );
}
