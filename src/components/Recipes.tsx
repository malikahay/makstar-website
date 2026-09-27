"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useState } from "react";
import { lenisRef } from "@/lib/lenis";
import { getProduct, methodLabels, type Method, type PastaKind } from "@/lib/products";
import type { Recipe } from "@/lib/recipes";
import { Button } from "./Button";
import { useCart } from "./CartProvider";
import { Pasta } from "./Pasta";

const methodBg: Record<Method, string> = {
  boil: "bg-mk-blue text-white",
  fry: "bg-mk-yellow text-mk-black",
  bake: "bg-mk-black text-white",
};

const PILE: [number, number, number, number][] = [
  // left%, top%, size%, rotate
  [28, 22, 44, -20],
  [8, 38, 40, 35],
  [44, 40, 42, 80],
  [22, 50, 40, 150],
  [36, 12, 36, 200],
  [48, 22, 34, -60],
];

export function Plate({ kind, className = "", spin = false }: { kind: PastaKind; className?: string; spin?: boolean }) {
  return (
    <div className={`relative aspect-square ${className}`}>
      <div className="absolute inset-0 rounded-full bg-white shadow-[0_30px_60px_-20px_rgba(0,0,0,.45)]" />
      <div className="absolute inset-[6%] rounded-full border-[3px] border-dashed border-mk-blue/25" />
      <div className="absolute inset-[14%] rounded-full bg-mk-yellow-soft/60" />
      <div className={`absolute inset-[10%] ${spin ? "animate-spin-slow" : ""}`}>
        {PILE.map(([l, t, s, r], i) => (
          <Pasta
            key={i}
            kind={kind}
            bare
            className="absolute drop-shadow-[0_4px_4px_rgba(138,90,0,.35)]"
            style={{ left: `${l}%`, top: `${t}%`, width: `${s}%`, height: `${s}%`, transform: `rotate(${r}deg)` }}
          />
        ))}
        {/* herbs */}
        {[
          [30, 30], [60, 45], [45, 65], [70, 30], [25, 60],
        ].map(([l, t], i) => (
          <span
            key={i}
            className="absolute h-[4%] w-[7%] rounded-full bg-emerald-600"
            style={{ left: `${l}%`, top: `${t}%`, transform: `rotate(${i * 50}deg)` }}
          />
        ))}
      </div>
    </div>
  );
}

export function RecipeCard({ recipe, onOpen }: { recipe: Recipe; onOpen: () => void }) {
  return (
    <motion.button
      layoutId={`recipe-${recipe.slug}`}
      onClick={onOpen}
      data-cursor="Готовить"
      className={`group relative flex w-full flex-col overflow-hidden rounded-[32px] p-6 text-left ${methodBg[recipe.method]}`}
      style={{ borderRadius: 32 }}
    >
      <div className="flex items-center justify-between text-xs font-bold uppercase tracking-[0.2em]">
        <span>{methodLabels[recipe.method]}</span>
        <span className="opacity-70">{recipe.time} мин</span>
      </div>
      <motion.div layoutId={`plate-${recipe.slug}`} className="mx-auto my-6 w-[72%]">
        <Plate
          kind={recipe.kind}
          className="transition-transform duration-[1.2s] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:rotate-[60deg] group-hover:scale-105"
        />
      </motion.div>
      <motion.h3 layoutId={`title-${recipe.slug}`} className="font-display text-2xl font-black leading-tight">
        {recipe.title}
      </motion.h3>
      <p className="mt-2 text-sm opacity-75">{recipe.lead}</p>
      <div className="mt-5 flex items-center gap-2 text-xs font-bold">
        <span className="rounded-full border border-current px-3 py-1">{recipe.level}</span>
        <span className="rounded-full border border-current px-3 py-1">{recipe.servings} порц.</span>
      </div>
    </motion.button>
  );
}

export function RecipeModal({ recipe, onClose }: { recipe: Recipe; onClose: () => void }) {
  const { add } = useCart();
  const product = getProduct(recipe.product);
  const [done, setDone] = useState<Set<number>>(new Set());

  useEffect(() => {
    lenisRef.current?.stop();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => {
      lenisRef.current?.start();
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[140] flex items-end justify-center p-2 md:items-center md:p-8">
      <motion.div
        className="absolute inset-0 bg-mk-blue-ink/60 backdrop-blur-md"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />
      <motion.div
        layoutId={`recipe-${recipe.slug}`}
        className={`relative max-h-[92vh] w-full max-w-5xl overflow-y-auto ${methodBg[recipe.method]}`}
        style={{ borderRadius: 32 }}
        data-lenis-prevent
        role="dialog"
        aria-label={recipe.title}
      >
        <button
          onClick={onClose}
          className="absolute right-5 top-5 z-10 grid h-11 w-11 place-items-center rounded-full bg-white text-mk-black transition-transform hover:rotate-90"
          aria-label="Закрыть"
        >
          ✕
        </button>
        <div className="grid gap-8 p-6 md:grid-cols-[1fr_1.2fr] md:p-10">
          <div>
            <motion.div layoutId={`plate-${recipe.slug}`} className="mx-auto w-[80%] md:w-full">
              <Plate kind={recipe.kind} spin />
            </motion.div>
            <div className="mt-8 grid grid-cols-3 gap-2 text-center">
              {[
                [recipe.time + "", "минут"],
                [recipe.servings + "", "порции"],
                [recipe.level, "уровень"],
              ].map(([v, l]) => (
                <div key={l} className="rounded-2xl bg-white/15 p-3 ring-1 ring-current/10">
                  <div className="font-display text-xl font-black">{v}</div>
                  <div className="text-xs opacity-70">{l}</div>
                </div>
              ))}
            </div>
          </div>
          <div>
            <div className="text-xs font-bold uppercase tracking-[0.3em] opacity-70">{methodLabels[recipe.method]}</div>
            <motion.h3 layoutId={`title-${recipe.slug}`} className="mt-2 pr-12 font-display text-3xl font-black leading-tight md:text-5xl">
              {recipe.title}
            </motion.h3>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0, transition: { delay: 0.3 } }}
              exit={{ opacity: 0 }}
            >
              <p className="mt-4 opacity-80">{recipe.lead}</p>
              <h4 className="mt-8 font-display text-lg font-bold">Ингредиенты</h4>
              <ul className="mt-3 space-y-2">
                {recipe.ingredients.map((i) => (
                  <li key={i} className="flex items-center gap-3">
                    <span className="h-2 w-2 shrink-0 rounded-full bg-current" />
                    {i}
                  </li>
                ))}
              </ul>
              <h4 className="mt-8 font-display text-lg font-bold">Шаги · отмечайте по ходу</h4>
              <ol className="mt-3 space-y-3">
                {recipe.steps.map((s, i) => {
                  const checked = done.has(i);
                  return (
                    <li key={i}>
                      <button
                        onClick={() =>
                          setDone((d) => {
                            const n = new Set(d);
                            if (n.has(i)) n.delete(i);
                            else n.add(i);
                            return n;
                          })
                        }
                        className={`flex w-full gap-4 rounded-2xl p-4 text-left transition-all ${
                          checked ? "bg-white/5 opacity-50" : "bg-white/15"
                        }`}
                      >
                        <span
                          className={`grid h-8 w-8 shrink-0 place-items-center rounded-full font-display text-sm font-black transition-colors ${
                            checked ? "bg-emerald-500 text-white" : "bg-white text-mk-black"
                          }`}
                        >
                          {checked ? "✓" : i + 1}
                        </span>
                        <span className={checked ? "line-through" : ""}>{s}</span>
                      </button>
                    </li>
                  );
                })}
              </ol>
              {product && (
                <div className="mt-8 flex flex-wrap items-center gap-4 rounded-3xl bg-white p-4 text-mk-black">
                  <div className="grid h-16 w-16 place-items-center rounded-2xl bg-mk-blue">
                    <Pasta kind={product.kind} className="h-12 w-12" />
                  </div>
                  <div className="flex-1">
                    <div className="text-xs font-bold uppercase tracking-widest text-mk-black/50">Понадобится</div>
                    <div className="font-display font-bold">
                      {product.name} Makstar, {product.weights[0].grams} г
                    </div>
                  </div>
                  <Button
                    variant="blue"
                    magnetic={false}
                    onClick={(e) => add(product.slug, product.weights[0].grams, 1, e.currentTarget)}
                  >
                    В корзину
                  </Button>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export function RecipeGrid({ recipes, initialMethod }: { recipes: Recipe[]; initialMethod?: Method | "all" }) {
  const [filter, setFilter] = useState<Method | "all">(initialMethod ?? "all");
  const [open, setOpen] = useState<Recipe | null>(null);
  const close = useCallback(() => setOpen(null), []);
  const list = filter === "all" ? recipes : recipes.filter((r) => r.method === filter);
  const filters: (Method | "all")[] = ["all", "boil", "fry", "bake"];

  return (
    <>
      <div className="mb-10 flex flex-wrap gap-2">
        {filters.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className="relative rounded-full px-5 py-3 text-sm font-bold uppercase tracking-wider"
          >
            {filter === f && (
              <motion.span
                layoutId="recipe-filter"
                className="absolute inset-0 rounded-full bg-mk-blue"
                transition={{ type: "spring", stiffness: 400, damping: 32 }}
              />
            )}
            <span className={`relative transition-colors ${filter === f ? "text-white" : "text-mk-black"}`}>
              {f === "all" ? "Все" : methodLabels[f]}
            </span>
          </button>
        ))}
      </div>
      <motion.div layout className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence mode="popLayout">
          {list.map((r, i) => (
            <motion.div
              key={r.slug}
              layout
              initial={{ opacity: 0, y: 60, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: i * 0.05 }}
            >
              <RecipeCard recipe={r} onOpen={() => setOpen(r)} />
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
      <AnimatePresence>{open && <RecipeModal key={open.slug} recipe={open} onClose={close} />}</AnimatePresence>
    </>
  );
}
