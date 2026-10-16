"use client";

import { motion, useScroll, useTransform, type MotionValue } from "framer-motion";
import { useRef, useState } from "react";
import { FREE_SHIPPING_FROM, SHIPPING_PRICE } from "@/lib/products";
import { useFormatPrice, useT } from "./LocaleProvider";
import { Accordion } from "./Accordion";
import { Arrow, Button } from "./Button";
import { PageHero } from "./PageHero";
import { Pasta } from "./Pasta";
import { Reveal, SplitText } from "./motion";

const ZONE_STYLES = ["bg-mk-blue text-white", "bg-mk-yellow", "bg-mk-black text-white"];
const ROUTE_STEPS = 4;

function Checkpoint({ i, progress, label }: { i: number; progress: MotionValue<number>; label: string }) {
  const at = i / (ROUTE_STEPS - 1);
  const bg = useTransform(progress, [at - 0.05, at], ["#e5e7eb", "#ffd400"]);
  const scale = useTransform(progress, [at - 0.05, at, at + 0.05], [1, 1.3, 1]);
  return (
    <div className="flex flex-col items-center gap-3" style={{ width: 0 }}>
      <motion.div style={{ backgroundColor: bg, scale }} className="grid h-10 w-10 shrink-0 place-items-center rounded-full font-display text-sm font-black ring-4 ring-white">
        {i + 1}
      </motion.div>
      <span className="w-28 text-center text-xs font-bold md:text-sm">{label}</span>
    </div>
  );
}

function Route() {
  const t = useT();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.8", "end 0.4"] });
  const left = useTransform(scrollYProgress, (v) => `${Math.min(1, Math.max(0, v)) * 100}%`);
  return (
    <section className="mx-auto max-w-[1400px] px-4 py-24 md:px-8 md:py-32">
      <h2 className="mb-20 font-display text-4xl font-black uppercase md:text-7xl">
        <SplitText key={t.delivery.routeTitle} text={t.delivery.routeTitle} />
      </h2>
      <div ref={ref} className="relative mx-10 md:mx-16">
        <div className="absolute left-0 right-0 top-5 h-2 rounded-full bg-mk-black/10" />
        <motion.div style={{ width: left }} className="absolute left-0 top-5 h-2 rounded-full bg-mk-blue" />
        <motion.div style={{ left }} className="absolute -top-16 -translate-x-1/2">
          <Truck />
        </motion.div>
        <div className="relative flex justify-between">
          {t.delivery.route.map((r, i) => (
            <Checkpoint key={r} i={i} label={r} progress={scrollYProgress} />
          ))}
        </div>
      </div>
    </section>
  );
}

function Truck() {
  return (
    <div className="relative">
      <svg viewBox="0 0 120 64" className="h-14 w-28 drop-shadow-lg">
        <rect x="2" y="6" width="74" height="40" rx="6" fill="var(--color-mk-blue)" />
        <rect x="2" y="6" width="74" height="10" rx="4" fill="var(--color-mk-yellow)" />
        <text x="8" y="35" fontSize="10.5" fontWeight="900" fill="#fff" fontFamily="var(--font-unbounded)">
          MAKSTAR
        </text>
        <path d="M78 18h20l14 16v12H78z" fill="var(--color-mk-black)" />
        <rect x="84" y="22" width="14" height="10" rx="2" fill="#bcd0ff" />
        <circle cx="24" cy="50" r="9" fill="var(--color-mk-black)" />
        <circle cx="24" cy="50" r="4" fill="#fff" />
        <circle cx="94" cy="50" r="9" fill="var(--color-mk-black)" />
        <circle cx="94" cy="50" r="4" fill="#fff" />
      </svg>
    </div>
  );
}

function Calculator() {
  const t = useT();
  const formatPrice = useFormatPrice();
  const [packs, setPacks] = useState(6);
  const avg = 13900;
  const sum = packs * avg;
  const free = sum >= FREE_SHIPPING_FROM;
  return (
    <section className="mx-2 overflow-hidden rounded-[40px] bg-mk-yellow md:mx-4">
      <div className="mx-auto grid max-w-[1400px] items-center gap-10 px-6 py-20 md:grid-cols-2 md:px-8">
        <div>
          <h2 className="font-display text-4xl font-black uppercase leading-[0.95] md:text-6xl">
            {t.delivery.calcTitle}
          </h2>
          <p className="mt-4 max-w-md font-semibold opacity-70">{t.delivery.calcLead(formatPrice(avg))}</p>
        </div>
        <div className="rounded-[32px] bg-white p-8">
          <div className="flex items-end justify-between">
            <div className="font-display text-7xl font-black text-mk-blue tabular-nums">{packs}</div>
            <div className="text-right">
              <div className="font-display text-2xl font-black">{formatPrice(sum)}</div>
              <motion.div
                key={String(free)}
                initial={{ scale: 0.6, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className={`mt-1 inline-block rounded-full px-3 py-1 text-xs font-bold ${free ? "bg-mk-blue text-white" : "bg-mk-black/10"}`}
              >
                {free ? t.delivery.freeShipping : t.delivery.shipping(formatPrice(SHIPPING_PRICE))}
              </motion.div>
            </div>
          </div>
          <input
            type="range"
            min={1}
            max={20}
            value={packs}
            onChange={(e) => setPacks(+e.target.value)}
            className="mt-8 w-full accent-[#1638ff]"
            aria-label={t.delivery.packsAria}
          />
          <div className="mt-6 flex h-16 flex-wrap gap-1 overflow-hidden">
            {Array.from({ length: packs }).map((_, i) => (
              <motion.div
                key={i}
                initial={{ y: -40, opacity: 0, rotate: -30 }}
                animate={{ y: 0, opacity: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 400, damping: 15 }}
                className="grid h-7 w-6 place-items-center rounded-md bg-mk-blue"
              >
                <Pasta kind="penne" className="h-5 w-5" />
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export function DeliveryPage() {
  const t = useT();
  const formatPrice = useFormatPrice();
  const [tashkent, regions, pickup] = t.delivery.zones;
  const ZONES = [
    { ...tashkent, price: formatPrice(SHIPPING_PRICE), note: `${tashkent.note} ${formatPrice(FREE_SHIPPING_FROM)}` },
    regions,
    pickup,
  ].map((z, i) => ({ ...z, cls: ZONE_STYLES[i] }));
  return (
    <>
      <PageHero
        eyebrow={t.delivery.eyebrow}
        title={t.delivery.title}
        lead={t.delivery.lead}
        pastas={["elbow", "penne", "conchiglie"]}
      />

      <section className="mx-auto max-w-[1400px] px-4 pt-24 md:px-8">
        <div className="grid gap-4 md:grid-cols-3">
          {ZONES.map((z, i) => (
            <Reveal key={i} delay={i * 0.1} y={60}>
              <div className={`group relative h-full overflow-hidden rounded-[32px] p-8 ${z.cls}`}>
                <div className="text-xs font-bold uppercase tracking-[0.3em] opacity-60">0{i + 1}</div>
                <h3 className="mt-6 font-display text-4xl font-black uppercase">{z.t}</h3>
                <div className="mt-6 space-y-1">
                  <div className="text-lg font-bold">{z.time}</div>
                  <div className="font-display text-2xl font-black">{z.price}</div>
                  <div className="text-sm opacity-70">{z.note}</div>
                </div>
                <Pasta
                  kind={(["penne", "fusilli", "farfalle"] as const)[i]}
                  className="absolute -bottom-6 -right-6 h-32 w-32 opacity-40 transition-all duration-700 group-hover:rotate-90 group-hover:scale-125 group-hover:opacity-100"
                />
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <Route />
      <Calculator />

      <section className="mx-auto max-w-[1400px] px-4 py-24 md:px-8 md:py-32">
        <h2 className="mb-12 font-display text-4xl font-black uppercase md:text-7xl">
          <SplitText key={t.delivery.paymentTitle} text={t.delivery.paymentTitle} />
        </h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {t.delivery.payments.map((p, i) => (
            <Reveal key={p.t} delay={i * 0.05}>
              <div className="group relative overflow-hidden rounded-[28px] border-2 border-mk-black/10 p-6 transition-colors duration-500 hover:border-mk-blue md:p-8">
                <div className="absolute inset-0 translate-y-full bg-mk-blue transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-y-0" />
                <div className="relative transition-colors duration-500 group-hover:text-white">
                  <div className="font-display text-xl font-black md:text-3xl">{p.t}</div>
                  <div className="mt-2 text-sm opacity-60">{p.d}</div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="mx-2 mb-2 rounded-[40px] bg-mk-black px-6 py-20 text-white md:mx-4 md:mb-4 md:px-12 md:py-28">
        <div className="mx-auto grid max-w-[1400px] gap-12 md:grid-cols-[1fr_2fr]">
          <div>
            <h2 className="font-display text-4xl font-black uppercase md:text-6xl">{t.delivery.faqTitle}</h2>
            <p className="mt-4 text-white/60">{t.delivery.faqLead}</p>
            <div className="mt-8">
              <Button href="/contacts" variant="yellow" icon={<Arrow />}>
                {t.delivery.support}
              </Button>
            </div>
          </div>
          <Accordion
            dark
            items={t.delivery.faq}
          />
        </div>
      </section>
    </>
  );
}
