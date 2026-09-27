"use client";

import { TLink } from "./TransitionProvider";
import { Magnetic } from "./motion";

type Variant = "yellow" | "blue" | "black" | "white" | "outline";

const styles: Record<Variant, { base: string; fill: string; hoverText: string }> = {
  yellow: { base: "bg-mk-yellow text-mk-black", fill: "bg-mk-black", hoverText: "group-hover:text-mk-yellow" },
  blue: { base: "bg-mk-blue text-white", fill: "bg-mk-yellow", hoverText: "group-hover:text-mk-black" },
  black: { base: "bg-mk-black text-white", fill: "bg-mk-yellow", hoverText: "group-hover:text-mk-black" },
  white: { base: "bg-white text-mk-black", fill: "bg-mk-blue", hoverText: "group-hover:text-white" },
  outline: { base: "border-2 border-current bg-transparent", fill: "bg-mk-yellow", hoverText: "group-hover:text-mk-black" },
};

type Props = {
  children: string;
  variant?: Variant;
  href?: string;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  type?: "button" | "submit";
  className?: string;
  big?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  magnetic?: boolean;
};

export function Button({
  children,
  variant = "yellow",
  href,
  onClick,
  type = "button",
  className = "",
  big,
  disabled,
  icon,
  magnetic = true,
}: Props) {
  const s = styles[variant];
  const cls = `group relative inline-flex items-center justify-center gap-3 overflow-hidden rounded-full font-bold uppercase tracking-wider transition-transform active:scale-95 disabled:opacity-40 ${
    big ? "px-10 py-5 text-sm md:text-base" : "px-7 py-4 text-xs md:text-sm"
  } ${s.base} ${className}`;
  const inner = (
    <>
      <span
        className={`absolute inset-x-0 bottom-0 h-full translate-y-[101%] rounded-t-[50%] transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-y-0 group-hover:rounded-none ${s.fill}`}
      />
      <span className={`relative z-10 transition-colors duration-300 ${s.hoverText}`}>
        <span className="roll">
          <span>{children}</span>
          <span>{children}</span>
        </span>
      </span>
      {icon && <span className={`relative z-10 transition-colors duration-300 ${s.hoverText}`}>{icon}</span>}
    </>
  );
  const el = href ? (
    <TLink href={href} className={cls}>
      {inner}
    </TLink>
  ) : (
    <button type={type} onClick={onClick} className={cls} disabled={disabled}>
      {inner}
    </button>
  );
  return magnetic ? <Magnetic strength={0.25}>{el}</Magnetic> : el;
}

export function Arrow({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden>
      <path d="M5 12h14M13 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
