"use client";

import { AnimatePresence, motion, useInView, useScroll, useTransform } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { formatPrice, methodLabels, products, type Method, type Product } from "@/lib/products";
import { recipes } from "@/lib/recipes";
import { Arrow, Button } from "./Button";
import { QtyStepper } from "./CartBits";
import { useCart } from "./CartProvider";
import { Pack } from "./Pack";
import { Pasta } from "./Pasta";
import { ProductCard } from "./ProductCard";
import { Plate } from "./Recipes";
import { TLink, usePageReady } from "./TransitionProvider";
import { Reveal, SplitText, Tilt } from "./motion";

const EXPO = [0.16, 1, 0.3, 1] as const;

function howTo(p: Product): Record<Method, string[]> {
  return {
    boil: [
      "Вскипятите 1 литр воды на каждые 100 г макарон.",
      "Посолите — 10 г соли на литр. Масло не нужно, наши макароны не слипаются.",
      `Всыпьте макароны и варите ${p.cookTime} мин, помешивая в первую минуту.`,
      "Откиньте на дуршлаг, оставив полстакана воды для соуса.",
    ],
    fry: [
      `Отварите макароны на 2 минуты меньше — ${Math.max(1, p.cookTime - 2)} мин.`,
      "Раскалите сковороду с маслом до лёгкого дымка.",
      "Выложите макароны и не трогайте 2–3 минуты — ждём корочку.",
      "Переверните, добавьте лук, яйцо или фарш и жарьте ещё 3 минуты.",
    ],
    bake: [
      `Отварите макароны ${Math.max(1, p.cookTime - 3)} мин — они дойдут в духовке.`,
      "Смешайте с соусом, выложите в форму.",
      "Посыпьте сыром и запекайте 20 минут при 200 °C.",
      "Дайте постоять 5 минут перед подачей — так форма не развалится.",
    ],
  };
}

function Timer({ minutes }: { minutes: number }) {
  const total = minutes * 60;
  const [left, setLeft] = useState(total);
  const [running, setRunning] = useState(false);
  useEffect(() => {
    if (!running) return;
    const t = setInterval(() => setLeft((l) => Math.max(0, l - 1)), 1000);
    return () => clearInterval(t);
  }, [running]);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (left === 0) setRunning(false);
  }, [left]);
  const pct = left / total;
  const R = 54;
  const C = 2 * Math.PI * R;
  const mm = String(Math.floor(left / 60)).padStart(2, "0");
  const ss = String(left % 60).padStart(2, "0");
  return (
    <div className="flex items-center gap-6 rounded-[32px] bg-mk-black p-6 text-white">
      <div className="relative h-32 w-32 shrink-0">
        <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90">
          <circle cx="60" cy="60" r={R} stroke="rgba(255,255,255,.12)" strokeWidth="10" fill="none" />
          <motion.circle
            cx="60"
            cy="60"
            r={R}
            stroke="var(--color-mk-yellow)"
            strokeWidth="10"
            fill="none"
            strokeLinecap="round"
            strokeDasharray={C}
            animate={{ strokeDashoffset: C * (1 - pct) }}
            transition={{ duration: 0.9, ease: "linear" }}
          />
        </svg>
        <div className="absolute inset-0 grid place-items-center font-display text-2xl font-black tabular-nums">
          {left === 0 ? "🍝" : `${mm}:${ss}`}
        </div>
      </div>
      <div>
        <div className="font-display text-xl font-bold">{left === 0 ? "Готово! Сливайте воду" : "Кухонный таймер"}</div>
        <p className="mt-1 text-sm text-white/60">Нажмите, когда закипит вода.</p>
        <div className="mt-4 flex gap-2">
          <button
            onClick={() => (left === 0 ? (setLeft(total), setRunning(true)) : setRunning((r) => !r))}
            className="rounded-full bg-mk-yellow px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-mk-black transition-transform hover:scale-105"
          >
            {running ? "Пауза" : left === total ? "Старт" : left === 0 ? "Ещё раз" : "Продолжить"}
          </button>
          <button
            onClick={() => {
              setRunning(false);
              setLeft(total);
            }}
            className="rounded-full border border-white/20 px-5 py-2.5 text-xs font-bold uppercase tracking-wider"
          >
            Сброс
          </button>
        </div>
      </div>
    </div>
  );
}

export function ProductView({ product }: { product: Product }) {
  const { add } = useCart();
  const ready = usePageReady();
  const [weight, setWeight] = useState(product.weights[0].grams);
  const [qty, setQty] = useState(1);
  const [tab, setTab] = useState<"desc" | "how" | "nutri">("desc");
  const [method, setMethod] = useState<Method>(product.methods[0]);
  const price = product.weights.find((w) => w.grams === weight)!.price;
  const buyRef = useRef<HTMLDivElement>(null);
  const buyVisible = useInView(buyRef);
  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const packY = useTransform(scrollYProgress, [0, 1], ["0%", "25%"]);
  const spin = useTransform(scrollYProgress, [0, 1], [0, 240]);
  const spinBack = useTransform(scrollYProgress, [0, 1], [0, -200]);

  const idx = products.findIndex((p) => p.slug === product.slug);
  const next = products[(idx + 1) % products.length];
  const related = products.filter((p) => p.slug !== product.slug && p.methods.some((m) => product.methods.includes(m))).slice(0, 4);
  const productRecipes = recipes.filter((r) => r.product === product.slug);
  const steps = howTo(product);

  const addToCart = (el: HTMLElement) => add(product.slug, weight, qty, el);

  return (
    <>
      <section ref={heroRef} className="grain relative overflow-hidden rounded-b-[40px] bg-mk-blue pb-20 pt-28 text-white md:rounded-b-[64px] md:pt-36">
        <div className="pointer-events-none absolute -left-[10%] top-[10%] select-none font-display text-[40vw] font-black leading-none text-white/[0.04]">
          {product.number}
        </div>
        <div className="relative mx-auto grid max-w-[1400px] items-center gap-12 px-4 md:grid-cols-2 md:px-8">
          <div className="relative mx-auto w-full max-w-[460px]">
            <motion.div style={{ rotate: spin }} className="absolute -left-10 top-10 z-20 h-28 w-28 md:h-36 md:w-36">
              <motion.div
                initial={{ scale: 0 }}
                animate={ready ? { scale: 1 } : undefined}
                transition={{ type: "spring", delay: 0.6 }}
              >
                <Pasta kind={product.kind} className="h-full w-full drop-shadow-2xl" />
              </motion.div>
            </motion.div>
            <motion.div style={{ rotate: spinBack }} className="absolute -right-6 bottom-16 z-20 h-24 w-24 md:h-32 md:w-32">
              <motion.div
                initial={{ scale: 0 }}
                animate={ready ? { scale: 1 } : undefined}
                transition={{ type: "spring", delay: 0.75 }}
              >
                <Pasta kind={product.kind} className="h-full w-full drop-shadow-2xl" />
              </motion.div>
            </motion.div>
            <div className="absolute inset-[10%] rounded-full bg-mk-yellow blur-[100px] opacity-40" />
            <motion.div style={{ y: packY }}>
              <motion.div
                initial={{ y: 200, rotate: -20, opacity: 0 }}
                animate={ready ? { y: 0, rotate: -4, opacity: 1 } : undefined}
                transition={{ duration: 1.4, ease: EXPO, delay: 0.2 }}
              >
                <Tilt max={14}>
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={weight}
                      initial={{ rotateY: -90, opacity: 0 }}
                      animate={{ rotateY: 0, opacity: 1 }}
                      exit={{ rotateY: 90, opacity: 0 }}
                      transition={{ duration: 0.35 }}
                    >
                      <Pack product={product} grams={weight} big />
                    </motion.div>
                  </AnimatePresence>
                </Tilt>
              </motion.div>
            </motion.div>
          </div>

          <div>
            <Reveal y={20} className="mb-6 flex items-center gap-2 text-sm text-white/60">
              <TLink href="/catalog" className="hover:text-mk-yellow">
                Каталог
              </TLink>
              <span>/</span>
              <span className="text-white">{product.name}</span>
            </Reveal>
            <Reveal y={20} delay={0.05} className="flex items-center gap-3">
              <span className="rounded-full bg-mk-yellow px-3 py-1 text-xs font-bold text-mk-black">{product.number}</span>
              <span className="text-sm font-semibold uppercase tracking-[0.2em] text-white/70">{product.latin}</span>
            </Reveal>
            <h1 className="mt-4 font-display text-6xl font-black uppercase leading-[0.9] md:text-8xl">
              <SplitText text={product.name} />
            </h1>
            <Reveal delay={0.2} className="mt-5 max-w-md text-lg text-white/80">
              {product.tagline}
            </Reveal>

            <Reveal delay={0.3} className="mt-8 flex flex-wrap gap-2">
              {product.methods.map((m) => (
                <span key={m} className="rounded-full border border-white/30 px-4 py-2 text-xs font-bold uppercase tracking-wider">
                  {methodLabels[m]}
                </span>
              ))}
              <span className="rounded-full bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-wider">
                ⏱ {product.cookTime} мин
              </span>
            </Reveal>

            <Reveal delay={0.4} className="mt-10">
              <div ref={buyRef} className="rounded-[32px] bg-white p-5 text-mk-black md:p-6">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="relative overflow-hidden">
                    <AnimatePresence mode="popLayout" initial={false}>
                      <motion.div
                        key={price * qty}
                        initial={{ y: 40, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: -40, opacity: 0 }}
                        transition={{ duration: 0.4, ease: EXPO }}
                        className="font-display text-4xl font-black text-mk-blue"
                      >
                        {formatPrice(price * qty)}
                      </motion.div>
                    </AnimatePresence>
                  </div>
                  {product.weights.length > 1 && (
                    <div className="flex rounded-full bg-mk-black/5 p-1">
                      {product.weights.map((w) => (
                        <button
                          key={w.grams}
                          onClick={() => setWeight(w.grams)}
                          className="relative rounded-full px-4 py-2 text-sm font-bold"
                        >
                          {weight === w.grams && (
                            <motion.span layoutId="weight-pill" className="absolute inset-0 rounded-full bg-mk-yellow" />
                          )}
                          <span className="relative">{w.grams} г</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <div className="mt-5 flex flex-wrap items-center gap-3">
                  <QtyStepper value={qty} onChange={(v) => setQty(Math.max(1, v))} />
                  <Button
                    variant="blue"
                    big
                    className="flex-1"
                    magnetic={false}
                    onClick={(e) => addToCart(e.currentTarget)}
                  >
                    В корзину
                  </Button>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* sticky buy bar */}
      <AnimatePresence>
        {!buyVisible && ready && (
          <motion.div
            initial={{ y: 120 }}
            animate={{ y: 0 }}
            exit={{ y: 120 }}
            transition={{ duration: 0.5, ease: EXPO }}
            className="fixed inset-x-2 bottom-2 z-[100] mx-auto flex max-w-2xl items-center gap-3 rounded-full bg-mk-black p-2 pl-3 text-white shadow-2xl md:bottom-4"
          >
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-mk-blue">
              <Pasta kind={product.kind} className="h-9 w-9" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate font-display text-sm font-bold">
                {product.name}, {weight} г
              </div>
              <div className="text-sm text-mk-yellow">{formatPrice(price * qty)}</div>
            </div>
            <button
              onClick={(e) => addToCart(e.currentTarget)}
              className="rounded-full bg-mk-yellow px-5 py-3 text-xs font-bold uppercase tracking-wider text-mk-black transition-transform hover:scale-105 active:scale-95"
            >
              В корзину
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* tabs */}
      <section className="mx-auto max-w-[1400px] px-4 py-20 md:px-8 md:py-28">
        <div className="mb-10 flex gap-2 overflow-x-auto border-b border-mk-black/10" data-lenis-prevent>
          {(
            [
              ["desc", "Описание"],
              ["how", "Как готовить"],
              ["nutri", "Состав и КБЖУ"],
            ] as const
          ).map(([k, l]) => (
            <button key={k} onClick={() => setTab(k)} className="relative shrink-0 px-4 pb-4 font-display text-lg font-bold md:text-2xl">
              <span className={tab === k ? "" : "opacity-40 transition-opacity hover:opacity-70"}>{l}</span>
              {tab === k && <motion.span layoutId="tab-line" className="absolute inset-x-0 -bottom-px h-1 rounded-full bg-mk-blue" />}
            </button>
          ))}
        </div>
        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.45, ease: EXPO }}
          >
            {tab === "desc" && (
              <div className="grid gap-12 md:grid-cols-2">
                <p className="font-display text-2xl font-bold leading-snug md:text-3xl">{product.description}</p>
                <div>
                  <div className="mb-4 text-xs font-bold uppercase tracking-[0.3em] text-mk-blue">Лучше всего с</div>
                  <ul className="space-y-3">
                    {product.bestWith.map((b, i) => (
                      <motion.li
                        key={b}
                        initial={{ opacity: 0, x: 30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 + i * 0.08 }}
                        className="flex items-center justify-between rounded-2xl bg-mk-yellow-soft/60 px-5 py-4 font-semibold"
                      >
                        {b} <Pasta kind={product.kind} className="h-8 w-8" />
                      </motion.li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
            {tab === "how" && (
              <div className="grid gap-10 md:grid-cols-[1.3fr_1fr]">
                <div>
                  <div className="mb-6 flex gap-2">
                    {product.methods.map((m) => (
                      <button key={m} onClick={() => setMethod(m)} className="relative rounded-full px-5 py-2.5 text-sm font-bold">
                        {method === m && <motion.span layoutId="method-pill" className="absolute inset-0 rounded-full bg-mk-yellow" />}
                        <span className="relative">{methodLabels[m]}</span>
                      </button>
                    ))}
                  </div>
                  <AnimatePresence mode="wait">
                    <motion.ol
                      key={method}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="space-y-3"
                    >
                      {steps[method].map((s, i) => (
                        <motion.li
                          key={s}
                          initial={{ opacity: 0, x: -30 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.08, ease: EXPO, duration: 0.6 }}
                          className="flex gap-4 rounded-2xl border border-mk-black/10 p-5"
                        >
                          <span className="font-display text-3xl font-black text-mk-blue">{i + 1}</span>
                          <span className="pt-1 text-lg">{s}</span>
                        </motion.li>
                      ))}
                    </motion.ol>
                  </AnimatePresence>
                </div>
                <div className="md:pt-16">
                  <Timer minutes={product.cookTime} />
                </div>
              </div>
            )}
            {tab === "nutri" && (
              <div className="grid gap-10 md:grid-cols-2">
                <div>
                  <p className="text-lg">
                    <b>Состав:</b> мука из твёрдых сортов пшеницы (durum) высшего сорта, вода
                    {product.slug === "noodles" ? ", яичный порошок" : ""}.
                  </p>
                  <p className="mt-4 text-mk-black/60">
                    Хранить в сухом месте при температуре до +25 °C. Срок годности — 24 месяца.
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    ["Ккал", product.nutrition.kcal, 400],
                    ["Белки, г", product.nutrition.protein, 20],
                    ["Жиры, г", product.nutrition.fat, 10],
                    ["Углеводы, г", product.nutrition.carbs, 100],
                  ].map(([l, v, max], i) => (
                    <div key={l as string} className="rounded-3xl bg-mk-blue p-5 text-white">
                      <div className="font-display text-4xl font-black">{v}</div>
                      <div className="text-sm text-white/70">{l} / 100 г</div>
                      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/20">
                        <motion.div
                          className="h-full bg-mk-yellow"
                          initial={{ width: 0 }}
                          animate={{ width: `${((v as number) / (max as number)) * 100}%` }}
                          transition={{ delay: 0.2 + i * 0.1, duration: 1, ease: EXPO }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </section>

      {productRecipes.length > 0 && (
        <section className="mx-auto max-w-[1400px] px-4 pb-20 md:px-8">
          <h2 className="mb-8 font-display text-4xl font-black uppercase md:text-6xl">
            <SplitText text="Приготовьте это" />
          </h2>
          <div className="grid gap-5 md:grid-cols-2">
            {productRecipes.map((r) => (
              <Reveal key={r.slug}>
                <TLink
                  href="/recipes"
                  data-cursor="Рецепт"
                  className="group flex items-center gap-6 overflow-hidden rounded-[32px] bg-mk-yellow p-6"
                >
                  <Plate kind={r.kind} className="w-32 shrink-0 transition-transform duration-1000 group-hover:rotate-90 md:w-40" />
                  <div>
                    <div className="text-xs font-bold uppercase tracking-[0.2em] opacity-60">
                      {methodLabels[r.method]} · {r.time} мин
                    </div>
                    <h3 className="mt-2 font-display text-2xl font-black leading-tight">{r.title}</h3>
                    <p className="mt-2 text-sm opacity-70">{r.lead}</p>
                  </div>
                </TLink>
              </Reveal>
            ))}
          </div>
        </section>
      )}

      <section className="mx-auto max-w-[1400px] px-4 pb-24 md:px-8">
        <h2 className="mb-10 font-display text-4xl font-black uppercase md:text-6xl">
          <SplitText text="С этим берут" />
        </h2>
        <div className="grid grid-cols-2 gap-x-4 gap-y-12 md:grid-cols-4 md:gap-x-8">
          {related.map((p, i) => (
            <Reveal key={p.slug} delay={i * 0.08} y={60}>
              <ProductCard product={p} />
            </Reveal>
          ))}
        </div>
      </section>

      <TLink
        href={`/catalog/${next.slug}`}
        data-cursor="Далее"
        className="group relative mx-2 mb-2 block overflow-hidden rounded-[40px] bg-mk-black px-6 py-16 text-white md:mx-4 md:mb-4 md:px-12 md:py-24"
      >
        <div className="absolute inset-0 origin-bottom scale-y-0 bg-mk-yellow transition-transform duration-700 ease-[cubic-bezier(0.76,0,0.24,1)] group-hover:scale-y-100" />
        <div className="relative flex items-center justify-between gap-6 transition-colors duration-500 group-hover:text-mk-black">
          <div>
            <div className="text-xs font-bold uppercase tracking-[0.3em] opacity-60">Следующая форма</div>
            <div className="mt-3 font-display text-5xl font-black uppercase md:text-9xl">{next.name}</div>
          </div>
          <div className="flex items-center gap-4">
            <Pasta kind={next.kind} className="h-24 w-24 transition-transform duration-700 group-hover:rotate-180 group-hover:scale-125 md:h-40 md:w-40" />
            <Arrow className="hidden h-12 w-12 transition-transform duration-500 group-hover:translate-x-3 md:block" />
          </div>
        </div>
      </TLink>
    </>
  );
}
