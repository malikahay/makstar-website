"use client";

import { motion, useScroll, useTransform, type MotionValue } from "framer-motion";
import { useRef, useState } from "react";
import { FREE_SHIPPING_FROM, SHIPPING_PRICE, formatPrice } from "@/lib/products";
import { Accordion } from "./Accordion";
import { Arrow, Button } from "./Button";
import { PageHero } from "./PageHero";
import { Pasta } from "./Pasta";
import { Reveal, SplitText } from "./motion";

const ZONES = [
  { t: "Ташкент", time: "Сегодня или завтра", price: formatPrice(SHIPPING_PRICE), note: `Бесплатно от ${formatPrice(FREE_SHIPPING_FROM)}`, cls: "bg-mk-blue text-white" },
  { t: "Регионы", time: "1–3 дня", price: "от 25 000 сум", note: "Все областные центры", cls: "bg-mk-yellow" },
  { t: "Самовывоз", time: "Через 2 часа", price: "Бесплатно", note: "Из пунктов выдачи Makstar", cls: "bg-mk-black text-white" },
];

const ROUTE = ["Заказ принят", "Собираем", "В пути", "У вашей двери"];

function Checkpoint({ i, progress, label }: { i: number; progress: MotionValue<number>; label: string }) {
  const at = i / (ROUTE.length - 1);
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
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.8", "end 0.4"] });
  const left = useTransform(scrollYProgress, (v) => `${Math.min(1, Math.max(0, v)) * 100}%`);
  return (
    <section className="mx-auto max-w-[1400px] px-4 py-24 md:px-8 md:py-32">
      <h2 className="mb-20 font-display text-4xl font-black uppercase md:text-7xl">
        <SplitText text="Как едут ваши макароны" />
      </h2>
      <div ref={ref} className="relative mx-10 md:mx-16">
        <div className="absolute left-0 right-0 top-5 h-2 rounded-full bg-mk-black/10" />
        <motion.div style={{ width: left }} className="absolute left-0 top-5 h-2 rounded-full bg-mk-blue" />
        <motion.div style={{ left }} className="absolute -top-16 -translate-x-1/2">
          <Truck />
        </motion.div>
        <div className="relative flex justify-between">
          {ROUTE.map((r, i) => (
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
  const [packs, setPacks] = useState(6);
  const avg = 13900;
  const sum = packs * avg;
  const free = sum >= FREE_SHIPPING_FROM;
  return (
    <section className="mx-2 overflow-hidden rounded-[40px] bg-mk-yellow md:mx-4">
      <div className="mx-auto grid max-w-[1400px] items-center gap-10 px-6 py-20 md:grid-cols-2 md:px-8">
        <div>
          <h2 className="font-display text-4xl font-black uppercase leading-[0.95] md:text-6xl">
            Сколько пачек до бесплатной доставки?
          </h2>
          <p className="mt-4 max-w-md font-semibold opacity-70">Двигайте ползунок. Средняя цена пачки — {formatPrice(avg)}.</p>
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
                {free ? "Доставка бесплатно 🎉" : `Доставка ${formatPrice(SHIPPING_PRICE)}`}
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
            aria-label="Количество пачек"
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

const PAYMENTS = [
  { t: "Click", d: "Мгновенно из приложения" },
  { t: "Payme", d: "Оплата по QR или ссылке" },
  { t: "Uzum", d: "Можно в рассрочку" },
  { t: "Humo / Uzcard", d: "Любая карта банка" },
  { t: "Visa / Mastercard", d: "Международные карты" },
  { t: "Наличные", d: "Курьеру при получении" },
];

export function DeliveryPage() {
  return (
    <>
      <PageHero
        eyebrow="Доставка и оплата"
        title="Быстро, как вода закипает"
        lead="Привезём макароны к двери или соберём заказ для самовывоза. Оплачивайте как удобно."
        pastas={["elbow", "penne", "conchiglie"]}
      />

      <section className="mx-auto max-w-[1400px] px-4 pt-24 md:px-8">
        <div className="grid gap-4 md:grid-cols-3">
          {ZONES.map((z, i) => (
            <Reveal key={z.t} delay={i * 0.1} y={60}>
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
          <SplitText text="Способы оплаты" />
        </h2>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
          {PAYMENTS.map((p, i) => (
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
            <h2 className="font-display text-4xl font-black uppercase md:text-6xl">Вопросы</h2>
            <p className="mt-4 text-white/60">Не нашли ответ? Напишите нам — отвечаем за 5 минут.</p>
            <div className="mt-8">
              <Button href="/contacts" variant="yellow" icon={<Arrow />}>
                Поддержка
              </Button>
            </div>
          </div>
          <Accordion
            dark
            items={[
              { q: "Какая минимальная сумма заказа?", a: "Минимального заказа нет. Но от 150 000 сум доставка по Ташкенту бесплатная." },
              { q: "Можно выбрать время доставки?", a: "Да, при оформлении выберите удобный интервал: 9–13, 13–17 или 17–21." },
              { q: "Что если пачка повреждена?", a: "Сфотографируйте и напишите в поддержку — заменим или вернём деньги в тот же день." },
              { q: "Вы доставляете оптом?", a: "Да. Для магазинов и HoReCa есть отдельные условия — оставьте заявку на странице контактов." },
            ]}
          />
        </div>
      </section>
    </>
  );
}
