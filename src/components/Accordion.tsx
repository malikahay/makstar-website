"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";

export function Accordion({ items, dark = false }: { items: { q: string; a: string }[]; dark?: boolean }) {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <ul className={`divide-y ${dark ? "divide-white/15" : "divide-mk-black/10"}`}>
      {items.map((it, i) => {
        const isOpen = open === i;
        return (
          <li key={it.q}>
            <button
              onClick={() => setOpen(isOpen ? null : i)}
              className="flex w-full items-center justify-between gap-6 py-6 text-left"
              aria-expanded={isOpen}
            >
              <span className="font-display text-lg font-bold md:text-2xl">{it.q}</span>
              <motion.span
                animate={{ rotate: isOpen ? 45 : 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className={`grid h-10 w-10 shrink-0 place-items-center rounded-full text-2xl ${
                  isOpen ? "bg-mk-yellow text-mk-black" : dark ? "bg-white/10" : "bg-mk-black/5"
                }`}
              >
                +
              </motion.span>
            </button>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  className="overflow-hidden"
                >
                  <p className={`max-w-3xl pb-6 text-base md:text-lg ${dark ? "text-white/70" : "text-mk-black/70"}`}>{it.a}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </li>
        );
      })}
    </ul>
  );
}
