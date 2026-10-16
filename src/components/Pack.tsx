"use client";

import type { Product } from "@/lib/products";
import { useT } from "./LocaleProvider";
import { Pasta } from "./Pasta";
import { Star } from "./Logo";

export function Pack({
  product,
  grams,
  className = "",
  big = false,
}: {
  product: Product;
  grams?: number;
  className?: string;
  big?: boolean;
}) {
  const t = useT();
  const weight = grams ?? product.weights[0].grams;
  const weightBadge = (
    <div
      className="absolute right-[6%] top-[25%] grid aspect-square w-[20%] rotate-12 place-items-center rounded-full bg-white font-display font-black leading-none text-mk-blue"
      style={{ fontSize: "4.6cqw" }}
    >
      <span className="text-center">
        {weight >= 1000 ? `${weight / 1000} ${t.kg}` : `${weight} ${t.g}`}
      </span>
    </div>
  );
  const boxClass = `relative aspect-[3/4] w-full select-none overflow-hidden rounded-[8%/6%] bg-mk-blue text-white shadow-[0_40px_80px_-30px_rgba(10,26,143,0.8)] ${className}`;

  // a photo uploaded in the admin replaces the drawn pack
  if (product.image) {
    return (
      <div className={boxClass} style={{ containerType: "inline-size" }}>
        {/* eslint-disable-next-line @next/next/no-img-element -- served by the Go API, already sized by the admin */}
        <img src={product.image} alt={product.name} draggable={false} className="absolute inset-0 h-full w-full object-cover" />
        {weightBadge}
      </div>
    );
  }

  return (
    <div className={boxClass} style={{ containerType: "inline-size" }}>
      {/* pouch crimp */}
      <div className="absolute inset-x-0 top-0 h-[5%] bg-[repeating-linear-gradient(90deg,rgba(255,255,255,.18)_0_2px,transparent_2px_7px)]" />
      {/* yellow band */}
      <div className="absolute inset-x-0 top-[5%] flex h-[16%] items-center justify-between bg-mk-yellow px-[7%] text-mk-black">
        <span className="font-display font-black tracking-tight" style={{ fontSize: "9cqw" }}>
          MAKSTAR
        </span>
        <Star className="h-[8cqw] w-[8cqw] text-mk-blue" />
      </div>
      {/* diagonal stripe */}
      <div className="absolute -left-[20%] top-[58%] h-[10%] w-[140%] -rotate-12 bg-mk-blue-deep/60" />
      {/* window */}
      <div className="absolute left-1/2 top-[27%] aspect-square w-[64%] -translate-x-1/2 rounded-full bg-mk-yellow-soft ring-[1.6cqw] ring-mk-yellow">
        <Pasta kind={product.kind} className="absolute inset-[8%] drop-shadow-[0_6px_6px_rgba(138,90,0,.35)]" />
      </div>
      {/* texts */}
      <div className="absolute inset-x-[7%] bottom-[6%]">
        <div className="font-display font-black uppercase leading-[0.95]" style={{ fontSize: `${Math.min(big ? 11 : 12, 94 / product.name.length)}cqw` }}>
          {product.name}
        </div>
        <div className="mt-[1.5cqw] flex items-center justify-between" style={{ fontSize: "4.4cqw" }}>
          <span className="opacity-80">{product.latin}</span>
          <span className="font-bold text-mk-yellow">{product.number}</span>
        </div>
      </div>
      {weightBadge}
      {/* shine */}
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(115deg,transparent_30%,rgba(255,255,255,.22)_45%,transparent_60%)]" />
      <div className="pointer-events-none absolute inset-y-0 left-0 w-[6%] bg-gradient-to-r from-black/25 to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-[6%] bg-gradient-to-l from-black/25 to-transparent" />
    </div>
  );
}
