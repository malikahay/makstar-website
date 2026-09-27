"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect } from "react";
import { lenisRef } from "@/lib/lenis";
import { formatPrice } from "@/lib/products";
import { Button } from "./Button";
import { CartLine, FreeShippingBar } from "./CartBits";
import { useCart } from "./CartProvider";
import { Pasta } from "./Pasta";

export function CartDrawer() {
  const { items, drawerOpen, setDrawerOpen, subtotal, count } = useCart();
  const close = () => setDrawerOpen(false);

  useEffect(() => {
    if (drawerOpen) lenisRef.current?.stop();
    else lenisRef.current?.start();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setDrawerOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [drawerOpen, setDrawerOpen]);

  return (
    <AnimatePresence>
      {drawerOpen && (
        <div className="fixed inset-0 z-[160]">
          <motion.div
            className="absolute inset-0 bg-mk-blue-ink/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={close}
          />
          <motion.aside
            className="absolute inset-y-2 right-2 flex w-[calc(100%-16px)] max-w-md flex-col overflow-hidden rounded-[28px] bg-white"
            initial={{ x: "110%" }}
            animate={{ x: 0 }}
            exit={{ x: "110%" }}
            transition={{ duration: 0.7, ease: [0.76, 0, 0.24, 1] }}
            role="dialog"
            aria-label="Корзина"
          >
            <div className="flex items-center justify-between bg-mk-blue px-6 py-5 text-white">
              <div className="font-display text-2xl font-black uppercase">
                Корзина <span className="text-mk-yellow">{count}</span>
              </div>
              <button
                onClick={close}
                className="grid h-10 w-10 place-items-center rounded-full bg-white/15 text-xl transition-transform hover:rotate-90"
                aria-label="Закрыть"
              >
                ✕
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-6" data-lenis-prevent>
              {items.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center gap-4 py-16 text-center">
                  <Pasta kind="nest" className="animate-spin-slow h-32 w-32 opacity-80" />
                  <p className="font-display text-xl font-bold">Кастрюля пуста</p>
                  <p className="max-w-60 text-sm text-mk-black/60">Самое время положить в неё что-нибудь вкусное.</p>
                  <Button href="/catalog" variant="blue" magnetic={false}>
                    В каталог
                  </Button>
                </div>
              ) : (
                <ul>
                  <AnimatePresence initial={false}>
                    {items.map((i) => (
                      <CartLine key={i.slug + i.grams} item={i} onNavigate={close} />
                    ))}
                  </AnimatePresence>
                </ul>
              )}
            </div>
            {items.length > 0 && (
              <div className="space-y-4 border-t border-mk-black/10 bg-mk-yellow-soft/40 px-6 py-5">
                <FreeShippingBar subtotal={subtotal} />
                <div className="flex items-end justify-between">
                  <span className="text-sm font-semibold text-mk-black/60">Итого</span>
                  <span className="font-display text-2xl font-black">{formatPrice(subtotal)}</span>
                </div>
                <div className="grid grid-cols-2 gap-2" onClick={close}>
                  <Button href="/cart" variant="outline" magnetic={false} className="w-full">
                    Корзина
                  </Button>
                  <Button href="/checkout" variant="blue" magnetic={false} className="w-full">
                    Оформить
                  </Button>
                </div>
              </div>
            )}
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
}
