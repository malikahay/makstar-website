import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductView } from "@/components/ProductView";
import { getLang } from "@/i18n/server";
import { getProducts } from "@/lib/catalog";

async function findProduct(slug: string) {
  return (await getProducts(await getLang())).find((p) => p.slug === slug);
}

export async function generateMetadata({ params }: PageProps<"/catalog/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const p = await findProduct(slug);
  return p ? { title: `${p.name} ${p.number}`, description: p.tagline } : {};
}

export default async function Page({ params }: PageProps<"/catalog/[slug]">) {
  const { slug } = await params;
  const product = await findProduct(slug);
  if (!product) notFound();
  return <ProductView key={product.slug} product={product} />;
}
