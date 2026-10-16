"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useMemo, useState } from "react";
import type { Category, Method } from "@/lib/products";
import { useT } from "./LocaleProvider";
import { useProducts } from "./ProductsProvider";
import { ProductCard } from "./ProductCard";

type Sort = "popular" | "cheap" | "fast";

export function CatalogGrid() {
  const { products } = useProducts();
  const t = useT();
  const [cat, setCat] = useState<Category | "all">("all");
  const [methods, setMethods] = useState<Method[]>([]);
  const [sort, setSort] = useState<Sort>("popular");

  const list = useMemo(() => {
    let l = products.filter(
      (p) => (cat === "all" || p.category === cat) && methods.every((m) => p.methods.includes(m)),
    );
    if (sort === "cheap") l = [...l].sort((a, b) => a.weights[0].price - b.weights[0].price);
    if (sort === "fast") l = [...l].sort((a, b) => a.cookTime - b.cookTime);
    return l;
  }, [products, cat, methods, sort]);

  const cats: (Category | "all")[] = ["all", "long", "short", "shaped", "soup"];

  return (
    <div>
      <div className="sticky top-20 z-30 -mx-4 mb-12 flex flex-col gap-3 bg-white/85 px-4 py-4 backdrop-blur-xl md:top-24 md:mx-0 md:flex-row md:items-center md:justify-between md:rounded-full md:px-3 md:py-2 md:shadow-[0_10px_40px_-15px_rgba(10,26,143,.3)]">
        <div className="flex gap-1 overflow-x-auto" data-lenis-prevent>
          {cats.map((c) => (
            <button
              key={c}
              onClick={() => setCat(c)}
              className="relative shrink-0 rounded-full px-5 py-2.5 text-sm font-bold"
            >
              {cat === c && (
                <motion.span
                  layoutId="cat-pill"
                  className="absolute inset-0 rounded-full bg-mk-blue"
                  transition={{ type: "spring", stiffness: 400, damping: 32 }}
                />
              )}
              <span className={`relative transition-colors ${cat === c ? "text-white" : ""}`}>
                {c === "all" ? t.common.all : t.categories[c]}
              </span>
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 overflow-x-auto">
          {(["boil", "fry", "bake"] as Method[]).map((m) => {
            const on = methods.includes(m);
            return (
              <button
                key={m}
                onClick={() => setMethods((ms) => (on ? ms.filter((x) => x !== m) : [...ms, m]))}
                className={`shrink-0 rounded-full border-2 px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all ${
                  on ? "border-mk-yellow bg-mk-yellow" : "border-mk-black/10 hover:border-mk-black/40"
                }`}
              >
                {on ? "✓ " : ""}
                {t.methods[m]}
              </button>
            );
          })}
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as Sort)}
            className="shrink-0 rounded-full bg-mk-black px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-white outline-none"
          >
            <option value="popular">{t.catalog.sortPopular}</option>
            <option value="cheap">{t.catalog.sortCheap}</option>
            <option value="fast">{t.catalog.sortFast}</option>
          </select>
        </div>
      </div>

      <div className="mb-6 font-display text-sm font-bold text-mk-black/50">
        {t.catalog.found} <span className="text-mk-blue">{list.length}</span>
      </div>

      <motion.div layout className="grid grid-cols-2 gap-x-4 gap-y-12 md:grid-cols-3 md:gap-x-8 lg:grid-cols-4">
        <AnimatePresence mode="popLayout">
          {list.map((p, i) => (
            <motion.div
              key={p.slug}
              layout
              initial={{ opacity: 0, y: 80, rotate: 4 }}
              animate={{ opacity: 1, y: 0, rotate: 0 }}
              exit={{ opacity: 0, scale: 0.7, rotate: -6 }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: i * 0.04 }}
            >
              <ProductCard product={p} />
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
      {list.length === 0 && (
        <div className="py-20 text-center font-display text-2xl font-bold">
          {t.catalog.empty}
        </div>
      )}
    </div>
  );
}
