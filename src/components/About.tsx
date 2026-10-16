"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef, useState } from "react";
import type { PastaKind } from "@/lib/products";
import { Arrow, Button } from "./Button";
import { PageHero } from "./PageHero";
import { Pasta } from "./Pasta";
import { Counter, Marquee, Reveal, ScrollWords, SplitText } from "./motion";
import { Star } from "./Logo";
import { useT } from "./LocaleProvider";

const STEP_KINDS: PastaKind[] = ["vermicelli", "nest", "noodles", "penne", "fusilli", "farfalle"];

function Process() {
  const t = useT();
  const STEPS = t.about.steps.map((s, i) => ({ ...s, kind: STEP_KINDS[i] }));
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.7", "end 0.6"] });
  const scaleY = useTransform(scrollYProgress, [0, 1], [0, 1]);
  return (
    <section className="mx-auto max-w-[1400px] px-4 py-24 md:px-8 md:py-32">
      <h2 className="mb-16 font-display text-5xl font-black uppercase leading-[0.9] md:text-8xl">
        <SplitText key={t.about.processTitle[0]} text={t.about.processTitle[0]} />
        <br />
        <SplitText key={t.about.processTitle[1]} text={t.about.processTitle[1]} wordClassName="text-mk-blue" delay={0.1} />
      </h2>
      <div ref={ref} className="relative">
        <div className="absolute bottom-0 left-6 top-0 w-1 rounded-full bg-mk-black/10 md:left-1/2 md:-translate-x-1/2" />
        <motion.div
          style={{ scaleY }}
          className="absolute bottom-0 left-6 top-0 w-1 origin-top rounded-full bg-mk-blue md:left-1/2 md:-translate-x-1/2"
        />
        <div className="space-y-12 md:space-y-24">
          {STEPS.map((s, i) => {
            const left = i % 2 === 0;
            return (
              <div key={i} className="relative grid items-center md:grid-cols-2 md:gap-24">
                <div className="absolute left-6 top-6 z-10 grid h-12 w-12 -translate-x-1/2 place-items-center rounded-full bg-mk-yellow font-display text-sm font-black ring-8 ring-white md:left-1/2">
                  0{i + 1}
                </div>
                <Reveal
                  y={60}
                  className={`ml-16 md:ml-0 ${left ? "md:col-start-1 md:text-right" : "md:col-start-2"}`}
                >
                  <div
                    className={`group inline-flex max-w-lg flex-col gap-4 rounded-[32px] p-8 transition-colors duration-500 hover:bg-mk-blue hover:text-white ${
                      i % 3 === 1 ? "bg-mk-yellow" : "bg-mk-black/[0.04]"
                    } ${left ? "md:items-end" : ""}`}
                  >
                    <Pasta
                      kind={s.kind}
                      className="h-20 w-20 transition-transform duration-700 group-hover:rotate-[160deg] group-hover:scale-125"
                    />
                    <h3 className="font-display text-3xl font-black uppercase">{s.t}</h3>
                    <p className="opacity-75">{s.d}</p>
                  </div>
                </Reveal>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

const VALUE_STYLES = ["bg-mk-blue text-white", "bg-mk-yellow", "bg-mk-black text-white", "bg-white text-mk-black ring-2 ring-mk-black"];

function FlipCard({ v }: { v: { front: string; back: string; cls: string } }) {
  const [flipped, setFlipped] = useState(false);
  return (
    <div
      className="h-72 [perspective:1200px]"
      onMouseEnter={() => setFlipped(true)}
      onMouseLeave={() => setFlipped(false)}
      onClick={() => setFlipped((f) => !f)}
    >
      <motion.div
        className="relative h-full w-full [transform-style:preserve-3d]"
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{ type: "spring", stiffness: 120, damping: 16 }}
      >
        <div className={`absolute inset-0 flex flex-col justify-between rounded-[32px] p-8 [backface-visibility:hidden] ${v.cls}`}>
          <Star className="h-8 w-8" />
          <div className="font-display text-3xl font-black uppercase md:text-4xl">{v.front}</div>
        </div>
        <div
          className={`absolute inset-0 flex items-end rounded-[32px] p-8 [backface-visibility:hidden] [transform:rotateY(180deg)] ${v.cls}`}
        >
          <p className="text-lg font-semibold">{v.back}</p>
        </div>
      </motion.div>
    </div>
  );
}

export function AboutPage() {
  const t = useT();
  const VALUES = t.about.values.map((v, i) => ({ ...v, cls: VALUE_STYLES[i] }));
  return (
    <>
      <PageHero
        eyebrow={t.about.eyebrow}
        title={t.about.title}
        lead={t.about.lead}
        pastas={["farfalle", "rigatoni", "elbow"]}
      />

      <section className="mx-auto max-w-[1400px] px-4 py-24 md:px-8 md:py-36">
        <ScrollWords
          className="font-display text-3xl font-bold leading-[1.15] tracking-tight md:text-6xl"
          key={t.about.story}
          text={t.about.story}
        />
      </section>

      <div className="bg-mk-blue py-6 text-white">
        <Marquee duration={25}>
          {t.about.marquee.map((w) => (
            <span key={w} className="flex items-center gap-8 px-8 font-display text-4xl font-black uppercase md:text-6xl">
              {w}
              <Star className="h-8 w-8 text-mk-yellow" />
            </span>
          ))}
        </Marquee>
      </div>

      <Process />

      <section className="mx-auto max-w-[1400px] px-4 pb-24 md:px-8 md:pb-32">
        <h2 className="mb-12 font-display text-5xl font-black uppercase md:text-8xl">
          <SplitText key={t.about.valuesTitle} text={t.about.valuesTitle} />
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {VALUES.map((v, i) => (
            <Reveal key={i} delay={i * 0.08} y={60}>
              <FlipCard v={v} />
            </Reveal>
          ))}
        </div>
      </section>

      <section className="mx-2 overflow-hidden rounded-[40px] bg-mk-black text-white md:mx-4">
        <div className="mx-auto grid max-w-[1400px] gap-10 px-6 py-20 md:grid-cols-3 md:px-8 md:py-28">
          {[
            { n: 1460000, s: "", ...t.about.numbers[0] },
            { n: 1000, s: "+", ...t.about.numbers[1] },
            { n: 99, s: "%", ...t.about.numbers[2] },
          ].map((s, i) => (
            <Reveal key={i} delay={i * 0.1}>
              <div className="whitespace-nowrap font-display text-[13vw] font-black text-mk-yellow md:text-[min(4vw,4.5rem)]">
                <Counter to={s.n} suffix={s.s} />
                {s.unit && <span className="ml-2 text-[0.4em] uppercase">{s.unit}</span>}
              </div>
              <div className="mt-2 text-white/60">{s.l}</div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-[1400px] px-4 py-24 text-center md:px-8 md:py-36">
        <Reveal>
          <Pasta kind="fusilli" className="animate-spin-slow mx-auto mb-10 h-24 w-24" />
        </Reveal>
        <blockquote className="mx-auto max-w-4xl font-display text-3xl font-bold leading-tight md:text-5xl">
          <SplitText key={t.about.quote} text={t.about.quote} stagger={0.03} />
        </blockquote>
        <Reveal delay={0.4} className="mt-8 text-sm font-bold uppercase tracking-[0.3em] text-mk-blue">
          {t.about.quoteAuthor}
        </Reveal>
        <Reveal delay={0.5} className="mt-12">
          <Button href="/catalog" variant="blue" big icon={<Arrow />}>
            {t.about.tryIt}
          </Button>
        </Reveal>
      </section>
    </>
  );
}
