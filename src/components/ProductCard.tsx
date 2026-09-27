"use client";

import { formatPrice, methodLabels, type Product } from "@/lib/products";
import { useCart } from "./CartProvider";
import { Pack } from "./Pack";
import { Pasta } from "./Pasta";
import { TLink } from "./TransitionProvider";
import { Tilt } from "./motion";

export function ProductCard({ product, dark = false }: { product: Product; dark?: boolean }) {
  const { add } = useCart();
  const w = product.weights[0];
  return (
    <div className="group relative">
      <TLink href={`/catalog/${product.slug}`} data-cursor="Открыть" className="block">
        <Tilt className="relative" max={10}>
          {/* pasta popping out of the pack */}
          {[
            "left-[12%] group-hover:-translate-y-[55%] group-hover:-rotate-[25deg]",
            "left-[40%] group-hover:-translate-y-[75%] group-hover:rotate-[20deg] delay-75",
            "left-[66%] group-hover:-translate-y-[50%] group-hover:rotate-[50deg] delay-150",
          ].map((c, i) => (
            <div
              key={i}
              className={`absolute top-[4%] z-0 h-[24%] w-[24%] translate-y-[30%] opacity-0 transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:opacity-100 ${c}`}
            >
              <Pasta kind={product.kind} className="h-full w-full drop-shadow-lg" />
            </div>
          ))}
          <div className="relative z-10 transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[0.97]">
            <Pack product={product} />
          </div>
          {product.badge && (
            <div className="absolute -left-2 top-[22%] z-20 -rotate-6 rounded-full bg-mk-black px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-mk-yellow">
              {product.badge}
            </div>
          )}
        </Tilt>
      </TLink>
      <div className="mt-5 flex items-start justify-between gap-3">
        <div>
          <TLink
            href={`/catalog/${product.slug}`}
            className={`font-display text-lg font-bold leading-tight md:text-xl ${dark ? "text-white" : ""}`}
          >
            {product.name}
          </TLink>
          <div className={`mt-1 flex flex-wrap gap-1 ${dark ? "text-white/60" : "text-mk-black/50"}`}>
            {product.methods.map((m) => (
              <span key={m} className="text-xs font-semibold">
                {methodLabels[m]}
                {m !== product.methods[product.methods.length - 1] && " ·"}
              </span>
            ))}
          </div>
          <div className={`mt-2 font-display text-sm font-bold md:text-base ${dark ? "text-mk-yellow" : "text-mk-blue"}`}>
            {formatPrice(w.price)} <span className="text-xs font-medium opacity-60">/ {w.grams} г</span>
          </div>
        </div>
        <button
          onClick={(e) => add(product.slug, w.grams, 1, e.currentTarget)}
          className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-mk-yellow text-2xl md:h-12 md:w-12 font-bold text-mk-black transition-all duration-300 hover:rotate-90 hover:scale-110 hover:bg-mk-blue hover:text-white active:scale-90"
          aria-label={`Добавить ${product.name} в корзину`}
        >
          +
        </button>
      </div>
    </div>
  );
}
