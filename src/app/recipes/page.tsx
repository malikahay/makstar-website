import type { Metadata } from "next";
import { PageHero } from "@/components/PageHero";
import { RecipeGrid } from "@/components/Recipes";
import { getDict } from "@/i18n/server";
import type { Method } from "@/lib/products";

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getDict()).meta.recipes };
}

export default async function Page({ searchParams }: PageProps<"/recipes">) {
  const { m } = await searchParams;
  const t = await getDict();
  const initial = (["boil", "fry", "bake"] as const).includes(m as Method) ? (m as Method) : "all";
  return (
    <>
      <PageHero eyebrow={t.recipes.eyebrow} title={t.recipes.title} lead={t.recipes.lead} pastas={["spaghetti", "elbow", "conchiglie"]} />
      <section className="mx-auto max-w-[1400px] px-4 py-16 md:px-8 md:py-24">
        <RecipeGrid key={initial} initialMethod={initial} />
      </section>
    </>
  );
}
