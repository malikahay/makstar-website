"use client";

import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "framer-motion";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "./AuthProvider";
import { useCart } from "./CartProvider";
import { Logo } from "./Logo";
import { TLink } from "./TransitionProvider";

export const NAV = [
  { href: "/catalog", label: "Каталог" },
  { href: "/recipes", label: "Рецепты" },
  { href: "/about", label: "О нас" },
  { href: "/delivery", label: "Доставка и оплата" },
  { href: "/contacts", label: "Контакты" },
];

export function Header() {
  const pathname = usePathname();
  const { count, bump, setDrawerOpen } = useCart();
  const { user } = useAuth();
  const accountHref = user ? "/account" : "/login";
  const { scrollY } = useScroll();
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [menu, setMenu] = useState(false);

  useMotionValueEvent(scrollY, "change", (v) => {
    const prev = scrollY.getPrevious() ?? 0;
    setScrolled(v > 60);
    setHidden(v > 400 && v > prev && !menu);
  });

  // reveal the header whenever something lands in the cart
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setHidden(false);
  }, [count]);

  const solid = scrolled && !menu;

  return (
    <>
      <motion.header
        className="fixed inset-x-0 top-0 z-[120] px-3 pt-3 md:px-6 md:pt-4"
        animate={{ y: hidden ? "-120%" : "0%" }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      >
        <div
          className={`mx-auto flex max-w-[1400px] items-center justify-between rounded-full px-4 py-2.5 transition-all duration-500 md:px-6 ${
            solid
              ? "bg-white/85 text-mk-black shadow-[0_10px_40px_-10px_rgba(10,26,143,.35)] backdrop-blur-xl"
              : menu
                ? "text-mk-black"
                : "text-white"
          }`}
        >
          <TLink href="/" className="text-xl md:text-2xl" aria-label="Makstar — на главную" onClick={() => setMenu(false)}>
            <Logo />
          </TLink>

          <nav className="hidden items-center gap-1 lg:flex">
            {NAV.map((n) => {
              const active = pathname === n.href || pathname.startsWith(n.href + "/");
              return (
                <TLink
                  key={n.href}
                  href={n.href}
                  className="group relative px-4 py-2 text-sm font-semibold"
                >
                  <span className="roll">
                    <span>{n.label}</span>
                    <span>{n.label}</span>
                  </span>
                  {active && (
                    <motion.span
                      layoutId="nav-dot"
                      className="absolute bottom-0 left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-mk-yellow"
                    />
                  )}
                </TLink>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            <TLink
              href={accountHref}
              className={`relative grid h-11 w-11 place-items-center rounded-full transition-colors ${
                solid || menu ? "bg-mk-black/5 text-mk-black" : "bg-white/15 text-white"
              }`}
              aria-label={user ? `Личный кабинет: ${user.name}` : "Войти"}
              title={user ? user.name : "Войти"}
            >
              <UserIcon />
              {user && <span className="absolute right-1.5 top-1.5 h-2.5 w-2.5 rounded-full bg-mk-yellow ring-2 ring-current" />}
            </TLink>
            <button
              id="cart-target"
              onClick={() => setDrawerOpen(true)}
              className={`relative flex h-11 items-center gap-2 rounded-full px-4 text-sm font-bold transition-colors ${
                solid || menu ? "bg-mk-blue text-white" : "bg-white text-mk-blue"
              }`}
              aria-label={`Корзина, товаров: ${count}`}
            >
              <motion.span
                key={bump}
                animate={bump ? { scale: [1, 1.5, 0.9, 1.1, 1], rotate: [0, -15, 10, 0] } : undefined}
                transition={{ duration: 0.6 }}
                className="inline-flex"
              >
                <BagIcon />
              </motion.span>
              <span className="hidden sm:inline">Корзина</span>
              <AnimatePresence mode="popLayout">
                <motion.span
                  key={count}
                  initial={{ y: -14, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: 14, opacity: 0 }}
                  className="grid h-6 min-w-6 place-items-center rounded-full bg-mk-yellow px-1.5 text-xs text-mk-black"
                >
                  {count}
                </motion.span>
              </AnimatePresence>
            </button>
            <button
              onClick={() => setMenu((m) => !m)}
              className={`relative grid h-11 w-11 place-items-center rounded-full lg:hidden ${
                solid || menu ? "bg-mk-black text-white" : "bg-mk-yellow text-mk-black"
              }`}
              aria-label="Меню"
              aria-expanded={menu}
            >
              <motion.span
                className="absolute h-0.5 w-5 rounded bg-current"
                animate={menu ? { rotate: 45, y: 0 } : { rotate: 0, y: -4 }}
              />
              <motion.span
                className="absolute h-0.5 w-5 rounded bg-current"
                animate={menu ? { rotate: -45, y: 0 } : { rotate: 0, y: 4 }}
              />
            </button>
          </div>
        </div>
      </motion.header>

      <AnimatePresence>
        {menu && (
          <motion.div
            className="fixed inset-0 z-[110] flex flex-col justify-between bg-mk-yellow px-6 pb-10 pt-28"
            initial={{ clipPath: "circle(0% at 92% 4%)" }}
            animate={{ clipPath: "circle(150% at 92% 4%)" }}
            exit={{ clipPath: "circle(0% at 92% 4%)" }}
            transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
          >
            <nav className="flex flex-col gap-2">
              {[{ href: "/", label: "Главная" }, ...NAV, { href: accountHref, label: user ? "Кабинет" : "Войти" }].map((n, i) => (
                <div key={n.href} className="overflow-hidden">
                  <motion.div
                    initial={{ y: "100%" }}
                    animate={{ y: "0%" }}
                    exit={{ y: "100%" }}
                    transition={{ duration: 0.7, delay: 0.2 + i * 0.06, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <TLink
                      href={n.href}
                      onClick={() => setMenu(false)}
                      className="flex items-baseline gap-3 font-display text-4xl font-black uppercase text-mk-black sm:text-6xl"
                    >
                      <span className="text-sm text-mk-blue">0{i + 1}</span>
                      {n.label}
                    </TLink>
                  </motion.div>
                </div>
              ))}
            </nav>
            <motion.div
              className="flex flex-col gap-1 text-sm font-semibold text-mk-black"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, transition: { delay: 0.6 } }}
              exit={{ opacity: 0 }}
            >
              <a href="tel:+998994003010">+998 (99) 400-30-10</a>
              <a href="mailto:hello@makstar.uz">hello@makstar.uz</a>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function UserIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21a8 8 0 0 1 16 0" strokeLinecap="round" />
    </svg>
  );
}

export function BagIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M5 8h14l-1.2 12.1a1 1 0 0 1-1 .9H7.2a1 1 0 0 1-1-.9L5 8Z" strokeLinejoin="round" />
      <path d="M9 8V6a3 3 0 0 1 6 0v2" strokeLinecap="round" />
    </svg>
  );
}
