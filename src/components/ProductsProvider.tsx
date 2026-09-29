"use client";

import { createContext, useContext, useMemo } from "react";
import type { Product } from "@/lib/products";

type ProductsCtx = { products: Product[]; getProduct: (slug: string) => Product | undefined };

const Ctx = createContext<ProductsCtx | null>(null);

export function ProductsProvider({ products, children }: { products: Product[]; children: React.ReactNode }) {
  const value = useMemo(() => {
    const bySlug = new Map(products.map((p) => [p.slug, p]));
    return { products, getProduct: (slug: string) => bySlug.get(slug) };
  }, [products]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useProducts() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useProducts outside ProductsProvider");
  return c;
}
