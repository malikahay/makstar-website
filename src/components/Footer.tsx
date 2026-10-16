"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { SITE } from "@/lib/site";
import { navItems } from "./Header";
import { useT } from "./LocaleProvider";
import { Logo, Star } from "./Logo";
import { Pasta } from "./Pasta";
import { TLink } from "./TransitionProvider";
import { Marquee } from "./motion";

const socials = [
  ["TG", SITE.social.telegram.url],
  ["IG", SITE.social.instagram],
  ["YT", SITE.social.youtube],
].filter(([, url]) => url);

export function Footer() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end end"] });
  const y = useTransform(scrollYProgress, [0, 1], ["-40%", "0%"]);
  const rotate = useTransform(scrollYProgress, [0, 1], [-60, 0]);
  const t = useT();

  return (
    <footer ref={ref} className="relative overflow-hidden bg-mk-black text-white">
      <Marquee className="border-b border-white/10 py-5" duration={40}>
        {t.footer.marquee.map((w) => (
          <span key={w} className="flex items-center gap-8 px-8 font-display text-3xl font-black uppercase md:text-5xl">
            {w}
            <Star className="h-6 w-6 text-mk-yellow md:h-8 md:w-8" />
          </span>
        ))}
      </Marquee>

      <div className="mx-auto grid max-w-[1400px] gap-12 px-4 py-16 md:grid-cols-4 md:px-8">
        <div className="md:col-span-2">
          <p className="max-w-md font-display text-2xl font-bold leading-tight md:text-3xl">
            {t.footer.pitch}
            <span className="text-mk-yellow">{t.footer.pitchAccent}</span>.
          </p>
        </div>
        <div>
          <div className="mb-4 text-xs font-bold uppercase tracking-[0.3em] text-white/40">{t.footer.navigation}</div>
          <ul className="space-y-2">
            {[{ href: "/", label: t.pages.home }, ...navItems(t), { href: "/cart", label: t.pages.cart }].map((n) => (
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
          <div className="mb-4 text-xs font-bold uppercase tracking-[0.3em] text-white/40">{t.footer.contact}</div>
          <ul className="space-y-2 font-semibold">
            <li><a className="hover:text-mk-yellow" href={SITE.phoneHref}>{SITE.phone}</a></li>
            <li><a className="hover:text-mk-yellow" href={`mailto:${SITE.email}`}>{SITE.email}</a></li>
            <li className="text-white/60">{t.footer.hours}</li>
          </ul>
          <div className="mt-6 flex gap-2">
            {socials.map(([s, url]) => (
              <a
                key={s}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
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
            {t.footer.slogan}
          </p>
        </motion.div>
        <motion.div style={{ rotate }} className="pointer-events-none absolute right-[8%] top-0 h-[12vw] w-[12vw]">
          <Pasta kind="fusilli" className="h-full w-full" />
        </motion.div>
      </div>
      <div className="mx-auto flex max-w-[1400px] flex-col justify-between gap-2 px-4 py-6 text-xs text-white/40 md:flex-row md:px-8">
        <span>
          © {new Date().getFullYear()} Makstar. {t.footer.rights}
        </span>
        <span className="flex flex-wrap gap-x-5 gap-y-1">
          <TLink href="/offer" className="hover:text-mk-yellow">{t.meta.offer}</TLink>
          <TLink href="/privacy" className="hover:text-mk-yellow">{t.meta.privacy}</TLink>
          <span>{t.footer.madeWith}</span>
        </span>
      </div>
    </footer>
  );
}
