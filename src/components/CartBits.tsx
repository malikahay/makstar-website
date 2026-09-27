"use client";

import { AnimatePresence, motion } from "framer-motion";
import { FREE_SHIPPING_FROM, formatPrice, getProduct } from "@/lib/products";
import { priceOf, useCart, type CartItem } from "./CartProvider";
import { Pasta } from "./Pasta";
import { TLink } from "./TransitionProvider";

export function QtyStepper({
  value,
  onChange,
  dark = false,
}: {
  value: number;
  onChange: (v: number) => void;
  dark?: boolean;
}) {
  const btn = `grid h-9 w-9 place-items-center rounded-full text-lg font-bold transition-colors ${
    dark ? "hover:bg-white/15" : "hover:bg-mk-yellow"
  }`;
  return (
    <div className={`inline-flex items-center rounded-full ${dark ? "bg-white/10" : "bg-mk-black/5"} p-1`}>
      <button className={btn} onClick={() => onChange(value - 1)} aria-label="Меньше">
        −
      </button>
      <div className="relative w-8 overflow-hidden text-center font-display font-bold tabular-nums">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={value}
            className="inline-block"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
          >
            {value}
          </motion.span>
        </AnimatePresence>
      </div>
      <button className={btn} onClick={() => onChange(value + 1)} aria-label="Больше">
        +
      </button>
    </div>
  );
}

export function CartLine({ item, onNavigate }: { item: CartItem; onNavigate?: () => void }) {
  const { setQty, remove } = useCart();
  const p = getProduct(item.slug);
  if (!p) return null;
  return (
    <motion.li
      layout
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -60, height: 0, marginBottom: 0, paddingTop: 0, paddingBottom: 0 }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      className="flex items-center gap-4 overflow-hidden border-b border-mk-black/10 py-4"
    >
      <TLink
        href={`/catalog/${p.slug}`}
        onClick={onNavigate}
        className="group grid h-20 w-20 shrink-0 place-items-center rounded-2xl bg-mk-blue"
      >
        <Pasta kind={p.kind} className="h-14 w-14 transition-transform duration-500 group-hover:rotate-45 group-hover:scale-110" />
      </TLink>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="font-display text-lg font-bold leading-tight">{p.name}</div>
            <div className="text-sm text-mk-black/50">
              {item.grams} г · {formatPrice(priceOf(item))}
            </div>
          </div>
          <button
            onClick={() => remove(item.slug, item.grams)}
            className="text-xs font-bold uppercase tracking-wider text-mk-black/40 transition-colors hover:text-mk-blue"
          >
            Удалить
          </button>
        </div>
        <div className="mt-2 flex items-center justify-between">
          <QtyStepper value={item.qty} onChange={(v) => setQty(item.slug, item.grams, v)} />
          <span className="font-display font-bold">{formatPrice(priceOf(item) * item.qty)}</span>
        </div>
      </div>
    </motion.li>
  );
}

export function FreeShippingBar({ subtotal }: { subtotal: number }) {
  const left = Math.max(0, FREE_SHIPPING_FROM - subtotal);
  const pct = Math.min(100, (subtotal / FREE_SHIPPING_FROM) * 100);
  return (
    <div>
      <div className="mb-2 text-sm font-semibold">
        {left > 0 ? (
          <>
            До бесплатной доставки — <span className="text-mk-blue">{formatPrice(left)}</span>
          </>
        ) : (
          <span className="text-mk-blue">Доставка бесплатно! 🎉</span>
        )}
      </div>
      <div className="relative h-3 overflow-hidden rounded-full bg-mk-black/10">
        <motion.div
          className="absolute inset-y-0 left-0 rounded-full bg-mk-blue"
          animate={{ width: `${pct}%` }}
          transition={{ type: "spring", stiffness: 80, damping: 18 }}
        />
        <motion.div
          className="absolute top-1/2 h-5 w-5 -translate-y-1/2"
          animate={{ left: `calc(${pct}% - 10px)`, rotate: pct * 7 }}
          transition={{ type: "spring", stiffness: 80, damping: 18 }}
        >
          <Pasta kind="farfalle" className="h-full w-full" />
        </motion.div>
      </div>
    </div>
  );
}
