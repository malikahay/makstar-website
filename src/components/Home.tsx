"use client";

import {
  motion,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { Method, PastaKind } from "@/lib/products";
import { useProducts } from "./ProductsProvider";
import { getRecipes } from "@/lib/recipes";
import { useLocale, useT } from "./LocaleProvider";
import { Arrow, Button } from "./Button";
import { Star } from "./Logo";
import { Pack } from "./Pack";
import { Pasta } from "./Pasta";
import { ProductCard } from "./ProductCard";
import { Plate } from "./Recipes";
import { TLink, usePageReady } from "./TransitionProvider";
import { Counter, Marquee, Reveal, ScrollWords, SplitText } from "./motion";

const EXPO = [0.16, 1, 0.3, 1] as const;

/* ───────────────────────── HERO ───────────────────────── */

const PIECES: { kind: PastaKind; x: string; y: string; s: number; r: number; d: number; ex: number; ey: number }[] = [
  { kind: "penne", x: "6%", y: "62%", s: 120, r: -20, d: 1.4, ex: -300, ey: 200 },
  { kind: "fusilli", x: "44%", y: "18%", s: 110, r: 30, d: 0.8, ex: -80, ey: -300 },
  { kind: "farfalle", x: "86%", y: "70%", s: 120, r: 15, d: 1.6, ex: 300, ey: 250 },
  { kind: "elbow", x: "52%", y: "72%", s: 90, r: -40, d: 1, ex: 60, ey: 320 },
  { kind: "conchiglie", x: "90%", y: "14%", s: 100, r: 10, d: 1.2, ex: 320, ey: -220 },
  { kind: "rigatoni", x: "30%", y: "8%", s: 80, r: 60, d: 0.6, ex: -200, ey: -320 },
  { kind: "fusilli", x: "70%", y: "44%", s: 60, r: -60, d: 2, ex: 200, ey: 60 },
  { kind: "penne", x: "38%", y: "52%", s: 64, r: 70, d: 1.8, ex: -120, ey: 140 },
];

function Piece({
  p,
  mx,
  my,
  progress,
  i,
}: {
  p: (typeof PIECES)[number];
  mx: MotionValue<number>;
  my: MotionValue<number>;
  progress: MotionValue<number>;
  i: number;
}) {
  const ready = usePageReady();
  const x = useTransform([mx, progress], ([m, pr]: number[]) => m * p.d * 60 + pr * p.ex);
  const y = useTransform([my, progress], ([m, pr]: number[]) => m * p.d * 60 + pr * p.ey);
  const rotate = useTransform(progress, [0, 1], [p.r, p.r + 180 * (i % 2 ? 1 : -1)]);
  return (
    <motion.div
      className="pointer-events-none absolute z-10"
      style={{ left: p.x, top: p.y, x, y, rotate }}
      initial={{ scale: 0, opacity: 0 }}
      animate={ready ? { scale: 1, opacity: 1 } : undefined}
      transition={{ type: "spring", stiffness: 120, damping: 12, delay: 0.5 + i * 0.07 }}
    >
      <div className="animate-float" style={{ ["--dur" as string]: `${5 + (i % 4)}s`, width: p.s, height: p.s }}>
        <Pasta kind={p.kind} className="h-full w-full scale-[0.7] drop-shadow-[0_20px_20px_rgba(6,16,79,.45)] md:scale-100" />
      </div>
    </motion.div>
  );
}

function Hero() {
  const { products } = useProducts();
  const t = useT();
  const ref = useRef<HTMLElement>(null);
  const ready = usePageReady();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const mxRaw = useMotionValue(0);
  const myRaw = useMotionValue(0);
  const mx = useSpring(mxRaw, { stiffness: 60, damping: 20 });
  const my = useSpring(myRaw, { stiffness: 60, damping: 20 });

  const wordY = useTransform(scrollYProgress, [0, 1], ["0%", "-60%"]);
  const packY = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const packRotate = useTransform(scrollYProgress, [0, 1], [8, -20]);
  const packScale = useTransform(scrollYProgress, [0, 1], [1, 0.75]);
  const packX = useTransform(mx, (v) => v * -30);
  const packRY = useTransform(mx, (v) => v * 30);
  const packRX = useTransform(my, (v) => v * -20);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  const penne = products.find((p) => p.slug === "penne") ?? products[0];

  return (
    <section
      ref={ref}
      className="grain relative h-[100svh] min-h-[680px] overflow-hidden bg-mk-blue text-white"
      onPointerMove={(e) => {
        mxRaw.set(e.clientX / window.innerWidth - 0.5);
        myRaw.set(e.clientY / window.innerHeight - 0.5);
      }}
    >
      {/* rays */}
      <div className="pointer-events-none absolute left-1/2 top-[55%] h-[160vmax] w-[160vmax] -translate-x-1/2 -translate-y-1/2 animate-spin-slow opacity-[0.025] [animation-duration:200s]">
        <div className="h-full w-full bg-[repeating-conic-gradient(from_0deg,#fff_0deg_6deg,transparent_6deg_18deg)] rounded-full" />
      </div>

      {PIECES.map((p, i) => (
        <Piece key={i} p={p} i={i} mx={mx} my={my} progress={scrollYProgress} />
      ))}

      {/* giant word */}
      <motion.div style={{ y: wordY }} className="pointer-events-none absolute inset-x-0 bottom-[-1.5vw] z-0 text-center">
        <div className="flex justify-center font-display text-[18.5vw] font-black leading-[0.8] tracking-tighter text-mk-yellow">
          {"MAKSTAR".split("").map((l, i) => (
            <span key={i} className="inline-block overflow-hidden pt-[2vw]">
              <motion.span
                className="inline-block"
                initial={{ y: "105%" }}
                animate={ready ? { y: "0%" } : undefined}
                transition={{ duration: 1.3, ease: EXPO, delay: 0.1 + i * 0.06 }}
              >
                {l}
              </motion.span>
            </span>
          ))}
        </div>
      </motion.div>

      {/* pack */}
      <motion.div
        className="absolute bottom-[15%] right-[5%] z-20 w-[36vw] max-w-[420px] md:bottom-auto md:right-[12%] md:top-[14%] md:w-[26vw]"
        style={{ y: packY, x: packX, rotate: packRotate, scale: packScale, rotateY: packRY, rotateX: packRX, transformPerspective: 1000 }}
      >
        <motion.div
          initial={{ y: "120%", rotate: 30, opacity: 0 }}
          animate={ready ? { y: "0%", rotate: 0, opacity: 1 } : undefined}
          transition={{ duration: 1.4, ease: EXPO, delay: 0.35 }}
        >
          <div className="animate-float" style={{ ["--dur" as string]: "7s" }}>
            <Pack product={penne} big />
          </div>
        </motion.div>
      </motion.div>

      {/* copy */}
      <motion.div style={{ opacity: contentOpacity }} className="relative z-30 mx-auto max-w-[1400px] px-4 pt-32 md:px-8 md:pt-40">
        <h1 className="max-w-3xl font-display text-[13vw] font-black uppercase leading-[0.88] tracking-tight sm:text-7xl md:text-8xl">
          <SplitText text={t.home.hero[0]} className="block" />
          <SplitText text={t.home.hero[1]} className="block" wordClassName="text-mk-yellow" delay={0.1} />
          <SplitText text={t.home.hero[2]} className="block" delay={0.2} />
        </h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={ready ? { opacity: 1, y: 0 } : undefined}
          transition={{ duration: 1, ease: EXPO, delay: 0.6 }}
          className="mt-6 max-w-sm text-base text-white/80 md:text-lg"
        >
          {t.home.heroLead}
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={ready ? { opacity: 1, y: 0 } : undefined}
          transition={{ duration: 1, ease: EXPO, delay: 0.75 }}
          className="mt-8 flex flex-wrap gap-3"
        >
          <Button href="/catalog" big icon={<Arrow />}>
            {t.common.toCatalog}
          </Button>
          <Button href="/recipes" variant="outline" big>
            {t.common.recipes}
          </Button>
        </motion.div>
      </motion.div>

      {/* scroll cue */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={ready ? { opacity: 1 } : undefined}
        transition={{ delay: 1.4 }}
        className="absolute bottom-6 left-4 z-30 hidden items-center gap-3 text-xs font-bold uppercase tracking-[0.3em] md:left-8 md:flex"
      >
        <span className="relative h-10 w-6 rounded-full border-2 border-white/60">
          <motion.span
            className="absolute left-1/2 top-2 h-2 w-1 -translate-x-1/2 rounded-full bg-mk-yellow"
            animate={{ y: [0, 12, 0] }}
            transition={{ repeat: Infinity, duration: 1.6 }}
          />
        </span>
        {t.home.scroll}
      </motion.div>
    </section>
  );
}

/* ───────────────────────── TAPES ───────────────────────── */

function Tapes() {
  const words = useT().home.tapes;
  return (
    <section className="relative z-10 -mt-10 h-48 overflow-hidden md:h-64">
      <div className="absolute inset-x-[-5%] top-1/2 -translate-y-1/2 rotate-[4deg] bg-mk-black py-4 text-white">
        <Marquee duration={35} reverse>
          {words.map((w) => (
            <span key={w} className="flex items-center gap-6 px-6 font-display text-2xl font-black uppercase md:text-4xl">
              {w} <Star className="h-5 w-5 text-mk-yellow" />
            </span>
          ))}
        </Marquee>
      </div>
      <div className="absolute inset-x-[-5%] top-1/2 -translate-y-1/2 -rotate-[3deg] bg-mk-yellow py-4 text-mk-black shadow-2xl">
        <Marquee duration={28}>
          {words.map((w) => (
            <span key={w} className="flex items-center gap-6 px-6 font-display text-2xl font-black uppercase md:text-4xl">
              {w} <Pasta kind="farfalle" className="h-10 w-10" />
            </span>
          ))}
        </Marquee>
      </div>
    </section>
  );
}

/* ───────────────────────── MANIFESTO ───────────────────────── */

function Manifesto() {
  const t = useT();
  return (
    <section className="mx-auto max-w-[1400px] px-4 py-24 md:px-8 md:py-40">
      <Reveal className="mb-10 flex items-center gap-3 text-xs font-bold uppercase tracking-[0.3em] text-mk-blue">
        <span className="h-px w-12 bg-mk-blue" /> {t.home.manifesto}
      </Reveal>
      <ScrollWords
        className="font-display text-3xl font-bold leading-[1.15] tracking-tight md:text-6xl"
        key={t.home.manifestoText}
        text={t.home.manifestoText}
      />
    </section>
  );
}

/* ───────────────────────── LINEUP (horizontal scroll) ───────────────────────── */

function Lineup() {
  const { products } = useProducts();
  const t = useT();
  const section = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const [distance, setDistance] = useState(0);
  const { scrollYProgress } = useScroll({ target: section, offset: ["start start", "end end"] });
  const x = useTransform(scrollYProgress, [0, 1], [0, -distance]);
  const bar = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  useLayoutEffect(() => {
    const measure = () => {
      if (track.current) setDistance(Math.max(0, track.current.scrollWidth - window.innerWidth));
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  return (
    <section ref={section} className="relative bg-mk-black" style={{ height: `calc(100vh + ${distance}px)` }}>
      <div className="sticky top-0 flex h-screen flex-col justify-center overflow-hidden">
        <motion.div ref={track} style={{ x }} className="flex w-max items-center gap-8 px-4 md:gap-12 md:px-8">
          <div className="w-[80vw] shrink-0 text-white md:w-[36vw]">
            <div className="mb-4 text-xs font-bold uppercase tracking-[0.3em] text-mk-yellow">{t.home.lineupEyebrow}</div>
            <h2 className="font-display text-5xl font-black uppercase leading-[0.9] md:text-7xl">
              {t.home.lineupTitle[0]} <span className="text-outline text-mk-yellow">{t.home.lineupTitle[1]}</span>{" "}
              {t.home.lineupTitle[2]}
            </h2>
            <p className="mt-6 max-w-sm text-white/60">{t.home.lineupLead}</p>
            <div className="mt-8">
              <Button href="/catalog" variant="yellow" icon={<Arrow />}>
                {t.home.fullCatalog}
              </Button>
            </div>
          </div>
          {products.map((p) => (
            <div key={p.slug} className="w-[62vw] shrink-0 sm:w-[40vw] md:w-[22vw]">
              <ProductCard product={p} dark />
            </div>
          ))}
          <div className="w-[10vw] shrink-0" />
        </motion.div>
        <div className="absolute inset-x-4 bottom-8 h-1 overflow-hidden rounded-full bg-white/10 md:inset-x-8">
          <motion.div style={{ width: bar }} className="h-full bg-mk-yellow" />
        </div>
      </div>
    </section>
  );
}

/* ───────────────────────── METHODS ───────────────────────── */

const METHODS = [
  { key: "boil", n: "01", cls: "bg-mk-blue text-white", kind: "spaghetti" },
  { key: "fry", n: "02", cls: "bg-mk-yellow text-mk-black", kind: "penne" },
  { key: "bake", n: "03", cls: "bg-mk-black text-white", kind: "conchiglie" },
] as const satisfies { key: Method; n: string; cls: string; kind: PastaKind }[];

function Methods() {
  const t = useT();
  const [active, setActive] = useState(1);
  return (
    <section className="mx-auto max-w-[1400px] px-4 py-24 md:px-8 md:py-32">
      <div className="mb-12 flex flex-wrap items-end justify-between gap-6">
        <h2 className="font-display text-5xl font-black uppercase leading-[0.9] md:text-8xl">
          <SplitText key={t.home.methodsTitle[0]} text={t.home.methodsTitle[0]} />
          <br />
          <SplitText key={t.home.methodsTitle[1]} text={t.home.methodsTitle[1]} wordClassName="text-mk-blue" delay={0.15} />
        </h2>
      </div>
      <div className="flex flex-col gap-3 md:h-[560px] md:flex-row">
        {METHODS.map((m, i) => {
          const isActive = active === i;
          return (
            <motion.div
              key={m.key}
              layout
              onMouseEnter={() => setActive(i)}
              onClick={() => setActive(i)}
              className={`relative cursor-pointer overflow-hidden rounded-[32px] p-6 md:p-10 ${m.cls}`}
              animate={{ flexGrow: isActive ? 3 : 1 }}
              transition={{ duration: 0.8, ease: EXPO }}
              style={{ flexBasis: 0, minHeight: isActive ? 420 : 140 }}
            >
              <div className="flex items-start justify-between">
                <span className="font-display text-sm font-bold opacity-60">{m.n}</span>
                <motion.div
                  animate={{ rotate: isActive ? 0 : -45, scale: isActive ? 1 : 0.8 }}
                  className="grid h-12 w-12 place-items-center rounded-full border-2 border-current"
                >
                  <Arrow className="h-5 w-5" />
                </motion.div>
              </div>
              <h3
                className={`mt-4 font-display text-4xl font-black uppercase md:text-6xl ${
                  isActive ? "" : "md:absolute md:bottom-10 md:left-8 md:mt-0 md:rotate-180 md:text-5xl md:[writing-mode:vertical-rl]"
                }`}
              >
                {t.methods[m.key]}
              </h3>
              <motion.div
                animate={{ opacity: isActive ? 1 : 0, y: isActive ? 0 : 30 }}
                transition={{ duration: 0.6, ease: EXPO, delay: isActive ? 0.2 : 0 }}
                className="relative z-10 mt-4 max-w-sm"
              >
                <p className="text-base opacity-80 md:text-lg">{t.home.methodTexts[m.key]}</p>
                <TLink
                  href={`/recipes?m=${m.key}`}
                  className="mt-6 inline-flex items-center gap-2 border-b-2 border-current pb-1 text-sm font-bold uppercase tracking-wider"
                >
                  {t.common.recipes} <Arrow />
                </TLink>
              </motion.div>
              <motion.div
                className="pointer-events-none absolute -bottom-10 -right-10 h-64 w-64 md:h-80 md:w-80"
                animate={{ rotate: isActive ? 20 : -30, scale: isActive ? 1 : 0.45, x: isActive ? 0 : 40, y: isActive ? 0 : 40 }}
                transition={{ duration: 1, ease: EXPO }}
              >
                <Pasta kind={m.kind} className="h-full w-full" />
                {m.key === "boil" && isActive && (
                  <div className="absolute left-1/3 top-0 flex gap-4">
                    {[0, 1, 2].map((s) => (
                      <span
                        key={s}
                        className="block h-10 w-3 rounded-full bg-white/50 blur-sm"
                        style={{ animation: `steam 2s ${s * 0.5}s ease-out infinite` }}
                      />
                    ))}
                  </div>
                )}
              </motion.div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}

/* ───────────────────────── STATS ───────────────────────── */

function Stats() {
  const stats = useT().home.stats;
  return (
    <section className="relative overflow-hidden rounded-[40px] bg-mk-yellow mx-2 md:mx-4">
      <div className="mx-auto grid max-w-[1400px] gap-10 px-6 py-20 md:grid-cols-4 md:px-8 md:py-28">
        {stats.map((s, i) => (
          <Reveal key={s.l} delay={i * 0.1}>
            <div className="border-t-2 border-mk-black pt-6">
              <div className="font-display text-6xl font-black tracking-tight text-mk-blue lg:text-7xl">
                {s.n === 0 ? "0" : <Counter to={s.n} suffix={s.s} />}
              </div>
              <div className="mt-3 max-w-[14rem] font-semibold">{s.l}</div>
            </div>
          </Reveal>
        ))}
      </div>
      <Pasta kind="fusilli" className="animate-spin-slow pointer-events-none absolute -bottom-16 -right-16 h-64 w-64 opacity-30" />
    </section>
  );
}

/* ───────────────────────── RECIPES TEASER ───────────────────────── */

function RecipesTeaser() {
  const { lang, t } = useLocale();
  const list = getRecipes(lang).slice(0, 3);
  return (
    <section className="mx-auto max-w-[1400px] px-4 py-24 md:px-8 md:py-32">
      <div className="mb-12 flex flex-wrap items-end justify-between gap-6">
        <div>
          <Reveal className="mb-4 text-xs font-bold uppercase tracking-[0.3em] text-mk-blue">{t.common.recipes}</Reveal>
          <h2 className="font-display text-5xl font-black uppercase leading-[0.9] md:text-7xl">
            <SplitText key={t.home.recipesTitle} text={t.home.recipesTitle} />
          </h2>
        </div>
        <Button href="/recipes" variant="black" icon={<Arrow />}>
          {t.home.allRecipes}
        </Button>
      </div>
      <div className="grid gap-5 md:grid-cols-3">
        {list.map((r, i) => (
          <Reveal key={r.slug} delay={i * 0.12} y={80}>
            <TLink
              href="/recipes"
              data-cursor={t.common.cursorCook}
              className={`group block overflow-hidden rounded-[32px] p-6 ${
                i === 0 ? "bg-mk-blue text-white" : i === 1 ? "bg-mk-black text-white" : "bg-mk-yellow"
              }`}
            >
              <div className="text-xs font-bold uppercase tracking-[0.2em] opacity-70">{t.home.minutes(r.time)}</div>
              <div className="mx-auto my-8 w-[70%]">
                <Plate
                  kind={r.kind}
                  className="transition-transform duration-[1.2s] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:rotate-90 group-hover:scale-110"
                />
              </div>
              <h3 className="font-display text-2xl font-black leading-tight">{r.title}</h3>
              <p className="mt-2 text-sm opacity-75">{r.lead}</p>
            </TLink>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

/* ───────────────────────── CTA ───────────────────────── */

function RainPiece({ i }: { i: number }) {
  const kinds: PastaKind[] = ["penne", "fusilli", "farfalle", "elbow", "conchiglie", "rigatoni"];
  const [style, setStyle] = useState<React.CSSProperties>({ opacity: 0 });
  useEffect(() => {
    // randomised only on the client to keep SSR markup stable
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setStyle({
      left: `${Math.random() * 100}%`,
      width: 40 + Math.random() * 60,
      height: 40 + Math.random() * 60,
      animationDuration: `${6 + Math.random() * 6}s`,
      animationDelay: `${-Math.random() * 10}s`,
    });
  }, []);
  return (
    <div className="rain absolute -top-24" style={style}>
      <Pasta kind={kinds[i % kinds.length]} className="h-full w-full" />
    </div>
  );
}

function CTA() {
  const t = useT();
  return (
    <section className="relative mx-2 mb-2 overflow-hidden rounded-[40px] bg-mk-blue text-white md:mx-4 md:mb-4">
      <style>{`@keyframes rain{from{transform:translateY(0) rotate(0)}to{transform:translateY(900px) rotate(540deg)}} .rain{animation:rain linear infinite}`}</style>
      <div className="pointer-events-none absolute inset-0 [&_svg]:drop-shadow-[0_10px_10px_rgba(6,16,79,.5)]">
        {Array.from({ length: 18 }).map((_, i) => (
          <RainPiece key={i} i={i} />
        ))}
      </div>
      <div className="relative mx-auto flex max-w-[1400px] flex-col items-center px-4 py-28 text-center md:py-40">
        <Reveal className="mb-6 text-xs font-bold uppercase tracking-[0.3em] text-mk-yellow">{t.home.ctaEyebrow}</Reveal>
        <h2 className="font-display text-6xl font-black uppercase leading-[0.85] md:text-[9rem]">
          <SplitText key={t.home.ctaTitle[0]} text={t.home.ctaTitle[0]} />
          <br />
          <SplitText key={t.home.ctaTitle[1]} text={t.home.ctaTitle[1]} wordClassName="text-mk-yellow" delay={0.15} />
        </h2>
        <Reveal delay={0.3} className="mt-10">
          <Button href="/catalog" big icon={<Arrow />}>
            {t.home.ctaButton}
          </Button>
        </Reveal>
      </div>
    </section>
  );
}

export function HomePage() {
  return (
    <>
      <Hero />
      <Tapes />
      <Manifesto />
      <Lineup />
      <Methods />
      <Stats />
      <RecipesTeaser />
      <CTA />
    </>
  );
}
