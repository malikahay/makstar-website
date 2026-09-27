"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { NAV } from "./Header";
import { Logo, Star } from "./Logo";
import { Pasta } from "./Pasta";
import { TLink } from "./TransitionProvider";
import { Marquee } from "./motion";

export function Footer() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end end"] });
  const y = useTransform(scrollYProgress, [0, 1], ["-40%", "0%"]);
  const rotate = useTransform(scrollYProgress, [0, 1], [-60, 0]);

  return (
    <footer ref={ref} className="relative overflow-hidden bg-mk-black text-white">
      <Marquee className="border-b border-white/10 py-5" duration={40}>
        {["Варить", "Жарить", "Запекать", "Есть", "Повторять"].map((w) => (
          <span key={w} className="flex items-center gap-8 px-8 font-display text-3xl font-black uppercase md:text-5xl">
            {w}
            <Star className="h-6 w-6 text-mk-yellow md:h-8 md:w-8" />
          </span>
        ))}
      </Marquee>

      <div className="mx-auto grid max-w-[1400px] gap-12 px-4 py-16 md:grid-cols-4 md:px-8">
        <div className="md:col-span-2">
          <p className="max-w-md font-display text-2xl font-bold leading-tight md:text-3xl">
            Макароны из твёрдой пшеницы, которые хочется <span className="text-mk-yellow">варить, жарить и запекать</span>.
          </p>
          <form
            className="mt-8 flex max-w-md overflow-hidden rounded-full bg-white/10 p-1.5 focus-within:ring-2 focus-within:ring-mk-yellow"
            onSubmit={(e) => {
              e.preventDefault();
              (e.currentTarget.elements.namedItem("email") as HTMLInputElement).value = "";
              alert("Спасибо! Первый рецепт уже летит к вам 🍝");
            }}
          >
            <input
              name="email"
              type="email"
              required
              placeholder="Email для рецептов недели"
              className="min-w-0 flex-1 bg-transparent px-4 text-sm outline-none placeholder:text-white/40"
            />
            <button className="rounded-full bg-mk-yellow px-5 py-3 text-xs font-bold uppercase tracking-wider text-mk-black transition-transform hover:scale-105">
              Хочу
            </button>
          </form>
        </div>
        <div>
          <div className="mb-4 text-xs font-bold uppercase tracking-[0.3em] text-white/40">Навигация</div>
          <ul className="space-y-2">
            {[{ href: "/", label: "Главная" }, ...NAV, { href: "/cart", label: "Корзина" }].map((n) => (
              <li key={n.href}>
                <TLink href={n.href} className="group inline-flex font-semibold hover:text-mk-yellow">
                  <span className="roll">
                    <span>{n.label}</span>
                    <span>{n.label}</span>
                  </span>
                </TLink>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <div className="mb-4 text-xs font-bold uppercase tracking-[0.3em] text-white/40">Связь</div>
          <ul className="space-y-2 font-semibold">
            <li><a className="hover:text-mk-yellow" href="tel:+998994003010">+998 (99) 400-30-10</a></li>
            <li><a className="hover:text-mk-yellow" href="mailto:hello@makstar.uz">hello@makstar.uz</a></li>
            <li className="text-white/60">Ежедневно, 7:00–19:00</li>
          </ul>
          <div className="mt-6 flex gap-2">
            {["TG", "IG", "YT"].map((s) => (
              <a
                key={s}
                href="#"
                className="grid h-11 w-11 place-items-center rounded-full border border-white/20 text-xs font-bold transition-all hover:-translate-y-1 hover:border-mk-yellow hover:bg-mk-yellow hover:text-mk-black"
              >
                {s}
              </a>
            ))}
          </div>
        </div>
      </div>

      <div className="relative px-4 md:px-8">
        <motion.div style={{ y }} className="text-center">
          <Logo className="text-[20vw] text-mk-blue" />
          <p className="mt-2 font-display text-xl font-black uppercase text-mk-yellow md:text-4xl">
            Будьте здоровы, живите богато!
          </p>
        </motion.div>
        <motion.div style={{ rotate }} className="pointer-events-none absolute right-[8%] top-0 h-[12vw] w-[12vw]">
          <Pasta kind="fusilli" className="h-full w-full" />
        </motion.div>
      </div>
      <div className="mx-auto flex max-w-[1400px] flex-col justify-between gap-2 px-4 py-6 text-xs text-white/40 md:flex-row md:px-8">
        <span>© {new Date().getFullYear()} Makstar. Все права защищены.</span>
        <span>Сделано с любовью к макаронам</span>
      </div>
    </footer>
  );
}
