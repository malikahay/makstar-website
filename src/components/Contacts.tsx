"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { Accordion } from "./Accordion";
import { Button } from "./Button";
import { PageHero } from "./PageHero";
import { Pasta } from "./Pasta";
import { Reveal, SplitText } from "./motion";

const CHANNELS = [
  { t: "Позвонить", v: "+998 71 200-00-00", href: "tel:+998712000000", cls: "bg-mk-blue text-white" },
  { t: "Написать", v: "hello@makstar.uz", href: "mailto:hello@makstar.uz", cls: "bg-mk-yellow" },
  { t: "Telegram", v: "@makstar_support", href: "#", cls: "bg-mk-black text-white" },
];

const TOPICS = ["Вопрос по заказу", "Качество", "Оптовые закупки", "Сотрудничество", "Другое"];

export function Field({
  label,
  name,
  type = "text",
  textarea,
  required,
  value,
  onChange,
}: {
  label: string;
  name: string;
  type?: string;
  textarea?: boolean;
  required?: boolean;
  value?: string;
  onChange?: (v: string) => void;
}) {
  const cls =
    "peer w-full rounded-2xl border-2 border-mk-black/10 bg-white px-5 pb-3 pt-7 outline-none transition-colors focus:border-mk-blue";
  const props = {
    name,
    required,
    placeholder: " ",
    className: cls,
    ...(onChange ? { value: value ?? "", onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => onChange(e.target.value) } : {}),
  };
  return (
    <label className="relative block">
      {textarea ? <textarea rows={4} {...props} className={cls + " resize-none"} /> : <input type={type} {...props} />}
      <span className="pointer-events-none absolute left-5 top-5 origin-left text-mk-black/50 transition-all duration-300 peer-focus:top-2 peer-focus:scale-75 peer-focus:text-mk-blue peer-[:not(:placeholder-shown)]:top-2 peer-[:not(:placeholder-shown)]:scale-75">
        {label}
        {required && " *"}
      </span>
    </label>
  );
}

function ContactForm() {
  const [topic, setTopic] = useState(TOPICS[0]);
  const [sent, setSent] = useState(false);
  return (
    <div className="relative overflow-hidden rounded-[40px] bg-mk-yellow-soft/50 p-6 md:p-10">
      <AnimatePresence mode="wait">
        {sent ? (
          <motion.div
            key="ok"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex min-h-[460px] flex-col items-center justify-center text-center"
          >
            <motion.div initial={{ rotate: -180, scale: 0 }} animate={{ rotate: 0, scale: 1 }} transition={{ type: "spring", stiffness: 150 }}>
              <Pasta kind="farfalle" className="h-32 w-32" />
            </motion.div>
            <h3 className="mt-6 font-display text-4xl font-black uppercase">Получили!</h3>
            <p className="mt-3 max-w-sm text-mk-black/70">Ответим в течение 15 минут в рабочее время. А пока — поставьте воду.</p>
            <button onClick={() => setSent(false)} className="mt-6 text-sm font-bold uppercase tracking-wider text-mk-blue underline">
              Отправить ещё
            </button>
          </motion.div>
        ) : (
          <motion.form
            key="form"
            exit={{ opacity: 0, y: -20 }}
            onSubmit={(e) => {
              e.preventDefault();
              setSent(true);
            }}
            className="space-y-4"
          >
            <h3 className="mb-6 font-display text-3xl font-black uppercase">Напишите нам</h3>
            <div className="flex flex-wrap gap-2">
              {TOPICS.map((t) => (
                <button
                  type="button"
                  key={t}
                  onClick={() => setTopic(t)}
                  className="relative rounded-full px-4 py-2 text-sm font-bold"
                >
                  {topic === t && <motion.span layoutId="topic" className="absolute inset-0 rounded-full bg-mk-blue" />}
                  <span className={`relative ${topic === t ? "text-white" : ""}`}>{t}</span>
                </button>
              ))}
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Имя" name="name" required />
              <Field label="Телефон" name="phone" type="tel" required />
            </div>
            <Field label="Email" name="email" type="email" />
            <Field label="Сообщение" name="message" textarea required />
            <Button type="submit" variant="blue" big magnetic={false}>
              Отправить
            </Button>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}

function MapCard() {
  return (
    <div className="relative h-full min-h-[360px] overflow-hidden rounded-[40px] bg-mk-blue">
      <svg className="absolute inset-0 h-full w-full opacity-30" aria-hidden>
        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M40 0H0V40" fill="none" stroke="#fff" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
        <path d="M-20 260 C 120 200, 220 320, 380 220 S 620 120, 900 200" stroke="#fff" strokeWidth="14" fill="none" opacity="0.6" />
        <path d="M200 -20 C 240 140, 160 260, 260 480" stroke="#fff" strokeWidth="10" fill="none" opacity="0.5" />
      </svg>
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        <span className="absolute left-1/2 top-1/2 -ml-8 -mt-8 h-16 w-16 rounded-full bg-mk-yellow" style={{ animation: "pulse-ring 2s ease-out infinite" }} />
        <span className="absolute left-1/2 top-1/2 -ml-8 -mt-8 h-16 w-16 rounded-full bg-mk-yellow" style={{ animation: "pulse-ring 2s 1s ease-out infinite" }} />
        <div className="relative grid h-16 w-16 place-items-center rounded-full bg-mk-yellow shadow-2xl">
          <Pasta kind="fusilli" className="h-10 w-10" />
        </div>
      </div>
      <div className="absolute inset-x-4 bottom-4 rounded-3xl bg-white p-5">
        <div className="text-xs font-bold uppercase tracking-[0.2em] text-mk-blue">Офис и пункт выдачи</div>
        <div className="mt-1 font-display text-lg font-bold">г. Ташкент, ул. Макаронная, 1</div>
        <div className="text-sm text-mk-black/60">Пн–Сб 9:00–20:00, Вс 10:00–18:00</div>
      </div>
    </div>
  );
}

export function ContactsPage() {
  return (
    <>
      <PageHero
        eyebrow="Контакты и поддержка"
        title="Мы на связи"
        lead="Вопрос по заказу, отзыв о вкусе или идея рецепта — пишите, звоните, приходите."
        pastas={["conchiglie", "fusilli", "penne"]}
      />

      <section className="mx-auto max-w-[1400px] px-4 pt-24 md:px-8">
        <div className="grid gap-4 md:grid-cols-3">
          {CHANNELS.map((c, i) => (
            <Reveal key={c.t} delay={i * 0.1} y={60}>
              <a
                href={c.href}
                className={`group relative flex h-56 flex-col justify-between overflow-hidden rounded-[32px] p-8 transition-transform duration-500 hover:-translate-y-2 ${c.cls}`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-[0.3em] opacity-60">{c.t}</span>
                  <span className="grid h-12 w-12 place-items-center rounded-full border-2 border-current text-xl transition-transform duration-500 group-hover:-rotate-45">
                    →
                  </span>
                </div>
                <div className="font-display text-xl font-black md:text-2xl">{c.v}</div>
              </a>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="mx-auto grid max-w-[1400px] gap-4 px-4 py-4 md:grid-cols-[1.3fr_1fr] md:px-8">
        <Reveal y={60}>
          <ContactForm />
        </Reveal>
        <Reveal y={60} delay={0.1}>
          <MapCard />
        </Reveal>
      </section>

      <section className="mx-auto max-w-[1400px] px-4 py-24 md:px-8 md:py-32">
        <h2 className="mb-10 font-display text-4xl font-black uppercase md:text-7xl">
          <SplitText text="Частые вопросы" />
        </h2>
        <Accordion
          items={[
            { q: "Почему ваши макароны не слипаются?", a: "Твёрдая пшеница содержит больше белка — он держит крахмал внутри. Плюс медленная сушка. Главное — много воды: 1 литр на 100 г." },
            { q: "Можно ли их жарить без предварительной варки?", a: "Вермишель и лапшу — да, обжарьте до золотистого цвета, а затем залейте бульоном. Остальные формы лучше сначала отварить." },
            { q: "Где купить Makstar офлайн?", a: "В большинстве сетевых супермаркетов и магазинов у дома. Точный список уточняйте в поддержке." },
            { q: "Подходят ли для детского питания?", a: "Да, в составе только мука из твёрдой пшеницы и вода. Для детей от 1,5 лет рекомендуем вермишель и бантики." },
            { q: "Как стать оптовым партнёром?", a: "Выберите тему «Оптовые закупки» в форме выше — менеджер свяжется в течение рабочего дня." },
          ]}
        />
      </section>
    </>
  );
}
