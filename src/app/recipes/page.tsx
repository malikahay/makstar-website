import type { Metadata } from "next";
import { PageHero } from "@/components/PageHero";
import { RecipeGrid } from "@/components/Recipes";
import type { Method } from "@/lib/products";
import { recipes } from "@/lib/recipes";

export const metadata: Metadata = { title: "Рецепты" };

export default async function Page({ searchParams }: PageProps<"/recipes">) {
  const { m } = await searchParams;
  const initial = (["boil", "fry", "bake"] as const).includes(m as Method) ? (m as Method) : "all";
  return (
    <>
      <PageHero
        eyebrow="Рецепты"
        title="Вари, жарь, запекай"
        lead="Проверенные рецепты на каждый день: от жареных спагетти на завтрак до лагмана, которым гордилась бы бабушка."
        pastas={["spaghetti", "elbow", "conchiglie"]}
      />
      <section className="mx-auto max-w-[1400px] px-4 py-16 md:px-8 md:py-24">
        <RecipeGrid key={initial} recipes={recipes} initialMethod={initial} />
      </section>
    </>
  );
}
