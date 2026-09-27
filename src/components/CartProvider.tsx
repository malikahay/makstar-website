"use client";

import { AnimatePresence, motion } from "framer-motion";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { getProduct, type PastaKind } from "@/lib/products";
import { Pasta } from "./Pasta";

export type CartItem = { slug: string; grams: number; qty: number };

type Flight = { id: number; kind: PastaKind; x: number; y: number; tx: number; ty: number };

type CartCtx = {
  items: CartItem[];
  count: number;
  subtotal: number;
  add: (slug: string, grams: number, qty?: number, from?: HTMLElement | null) => void;
  setQty: (slug: string, grams: number, qty: number) => void;
  remove: (slug: string, grams: number) => void;
  clear: () => void;
  promo: string | null;
  discount: number;
  applyPromo: (code: string) => boolean;
  drawerOpen: boolean;
  setDrawerOpen: (v: boolean) => void;
  bump: number;
};

const Ctx = createContext<CartCtx | null>(null);

export function useCart() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useCart outside CartProvider");
  return c;
}

export function priceOf(item: CartItem) {
  const p = getProduct(item.slug);
  return p?.weights.find((w) => w.grams === item.grams)?.price ?? 0;
}

const KEY = "mk-cart";
export const PROMO_CODE = "MAKSTAR10";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [flights, setFlights] = useState<Flight[]>([]);
  const [bump, setBump] = useState(0);
  const [promo, setPromo] = useState<string | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (raw) setItems(JSON.parse(raw));
    } catch {}
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem(KEY, JSON.stringify(items));
    } catch {}
  }, [items, loaded]);

  const add = useCallback<CartCtx["add"]>((slug, grams, qty = 1, from) => {
    setItems((prev) => {
      const ex = prev.find((i) => i.slug === slug && i.grams === grams);
      if (ex) return prev.map((i) => (i === ex ? { ...i, qty: i.qty + qty } : i));
      return [...prev, { slug, grams, qty }];
    });
    const product = getProduct(slug);
    const tgt = document.getElementById("cart-target")?.getBoundingClientRect();
    if (from && tgt && product) {
      const r = from.getBoundingClientRect();
      setFlights((f) => [
        ...f,
        {
          id: Date.now() + Math.random(),
          kind: product.kind,
          x: r.left + r.width / 2 - 40,
          y: r.top + r.height / 2 - 40,
          tx: tgt.left + tgt.width / 2 - 40,
          // header may be hidden above the viewport; it slides back in on add
          ty: Math.max(tgt.top, 16) + tgt.height / 2 - 40,
        },
      ]);
    } else {
      setBump((b) => b + 1);
    }
  }, []);

  const setQty = useCallback((slug: string, grams: number, qty: number) => {
    setItems((prev) =>
      qty <= 0
        ? prev.filter((i) => !(i.slug === slug && i.grams === grams))
        : prev.map((i) => (i.slug === slug && i.grams === grams ? { ...i, qty } : i)),
    );
  }, []);

  const remove = useCallback((slug: string, grams: number) => {
    setItems((prev) => prev.filter((i) => !(i.slug === slug && i.grams === grams)));
  }, []);

  const clear = useCallback(() => {
    setItems([]);
    setPromo(null);
  }, []);

  const applyPromo = useCallback((code: string) => {
    const ok = code.trim().toUpperCase() === PROMO_CODE;
    setPromo(ok ? PROMO_CODE : null);
    return ok;
  }, []);

  const subtotal = items.reduce((s, i) => s + priceOf(i) * i.qty, 0);
  const discount = promo ? Math.round(subtotal * 0.1) : 0;

  const value = useMemo<CartCtx>(
    () => ({
      items,
      count: items.reduce((s, i) => s + i.qty, 0),
      subtotal,
      promo,
      discount,
      applyPromo,
      add,
      setQty,
      remove,
      clear,
      drawerOpen,
      setDrawerOpen,
      bump,
    }),
    [items, subtotal, promo, discount, applyPromo, add, setQty, remove, clear, drawerOpen, bump],
  );

  return (
    <Ctx.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed inset-0 z-[150]">
        <AnimatePresence>
          {flights.map((f) => (
            <motion.div
              key={f.id}
              className="absolute left-0 top-0 h-20 w-20"
              initial={{ x: f.x, y: f.y, scale: 0.4, rotate: 0, opacity: 0 }}
              animate={{
                x: [f.x, (f.x + f.tx) / 2, f.tx],
                y: [f.y, Math.min(f.y, f.ty) - 160, f.ty],
                scale: [0.4, 1.4, 0.35],
                rotate: [0, 200, 420],
                opacity: [0, 1, 1],
              }}
              exit={{ opacity: 0, scale: 0 }}
              transition={{ duration: 0.9, ease: [0.5, 0, 0.3, 1] }}
              onAnimationComplete={() => {
                setFlights((all) => all.filter((x) => x.id !== f.id));
                setBump((b) => b + 1);
              }}
            >
              <Pasta kind={f.kind} className="h-full w-full drop-shadow-xl" />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </Ctx.Provider>
  );
}
