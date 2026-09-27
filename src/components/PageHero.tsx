"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import type { PastaKind } from "@/lib/products";
import { Pasta } from "./Pasta";
import { SplitText, Reveal } from "./motion";

export function PageHero({
  eyebrow,
  title,
  lead,
  pastas = ["penne", "fusilli", "farfalle"],
  children,
}: {
  eyebrow: string;
  title: string;
  lead?: string;
  pastas?: PastaKind[];
  children?: React.ReactNode;
}) {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "40%"]);
  const r = useTransform(scrollYProgress, [0, 1], [0, 120]);
  const r2 = useTransform(scrollYProgress, [0, 1], [0, -90]);

  return (
    <section ref={ref} className="grain relative overflow-hidden rounded-b-[40px] bg-mk-blue pb-16 pt-36 text-white md:rounded-b-[64px] md:pb-24 md:pt-44">
      <motion.div style={{ y, rotate: r }} className="pointer-events-none absolute -right-10 top-24 h-48 w-48 opacity-90 md:right-[8%] md:h-72 md:w-72">
        <Pasta kind={pastas[0]} className="h-full w-full" />
      </motion.div>
      <motion.div style={{ y, rotate: r2 }} className="pointer-events-none absolute bottom-6 right-[30%] hidden h-28 w-28 md:block">
        <Pasta kind={pastas[1]} className="h-full w-full" />
      </motion.div>
      <motion.div style={{ rotate: r }} className="pointer-events-none absolute -left-8 bottom-4 h-24 w-24 opacity-60 md:h-32 md:w-32">
        <Pasta kind={pastas[2]} className="h-full w-full" />
      </motion.div>
      <div className="relative mx-auto max-w-[1400px] px-4 md:px-8">
        <Reveal y={20}>
          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-mk-yellow px-4 py-1.5 text-xs font-bold uppercase tracking-[0.25em] text-mk-black">
            {eyebrow}
          </div>
        </Reveal>
        <h1 className="max-w-5xl font-display text-5xl font-black uppercase leading-[0.9] tracking-tight sm:text-7xl md:text-8xl lg:text-9xl">
          <SplitText text={title} />
        </h1>
        {lead && (
          <Reveal delay={0.3} className="mt-8 max-w-xl text-lg text-white/80 md:text-xl">
            {lead}
          </Reveal>
        )}
        {children}
      </div>
    </section>
  );
}
