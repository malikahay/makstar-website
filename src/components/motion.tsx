"use client";

import {
  animate,
  motion,
  useInView,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { useEffect, useRef } from "react";
import { usePageReady } from "./TransitionProvider";

const EXPO = [0.16, 1, 0.3, 1] as const;

/** Fade/slide in once visible and the curtain is up */
export function Reveal({
  children,
  className,
  delay = 0,
  y = 40,
  as = "div",
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  y?: number;
  as?: "div" | "section" | "li" | "span";
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-10% 0px" });
  const ready = usePageReady();
  const M = motion[as] as typeof motion.div;
  return (
    <M
      ref={ref}
      className={className}
      initial={{ opacity: 0, y }}
      animate={inView && ready ? { opacity: 1, y: 0 } : undefined}
      transition={{ duration: 1, ease: EXPO, delay: delay + 0.1 }}
    >
      {children}
    </M>
  );
}

/** Word-by-word masked rise */
export function SplitText({
  text,
  className,
  delay = 0,
  stagger = 0.06,
  wordClassName = "",
}: {
  text: string;
  className?: string;
  delay?: number;
  stagger?: number;
  wordClassName?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-5% 0px" });
  const ready = usePageReady();
  const show = inView && ready;
  return (
    <span ref={ref} className={className} aria-label={text}>
      {text.split(" ").map((w, i) => (
        <span key={i} className="-mb-[0.12em] -mt-[0.18em] inline-block overflow-hidden pb-[0.12em] pt-[0.18em] align-top" aria-hidden>
          <motion.span
            className={`inline-block ${wordClassName}`}
            initial={{ y: "110%", rotate: 6 }}
            animate={show ? { y: "0%", rotate: 0 } : undefined}
            transition={{ duration: 1.1, ease: EXPO, delay: delay + 0.15 + i * stagger }}
          >
            {w}
            {" "}
          </motion.span>
        </span>
      ))}
    </span>
  );
}

/** Words light up as the paragraph scrolls through the viewport */
export function ScrollWords({ text, className }: { text: string; className?: string }) {
  const ref = useRef<HTMLParagraphElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.85", "end 0.45"] });
  const words = text.split(" ");
  return (
    <p ref={ref} className={className}>
      {words.map((w, i) => (
        <Word key={i} progress={scrollYProgress} range={[i / words.length, (i + 1) / words.length]}>
          {w}
        </Word>
      ))}
    </p>
  );
}

function Word({
  children,
  progress,
  range,
}: {
  children: string;
  progress: MotionValue<number>;
  range: [number, number];
}) {
  const opacity = useTransform(progress, range, [0.12, 1]);
  const highlight = children.startsWith("*");
  return (
    <motion.span style={{ opacity }} className={`mr-[0.25em] inline-block ${highlight ? "text-mk-blue" : ""}`}>
      {highlight ? children.slice(1) : children}
    </motion.span>
  );
}

/** Element drifts towards the pointer */
export function Magnetic({
  children,
  strength = 0.35,
  className,
}: {
  children: React.ReactNode;
  strength?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 200, damping: 15, mass: 0.4 });
  const sy = useSpring(y, { stiffness: 200, damping: 15, mass: 0.4 });
  return (
    <motion.div
      ref={ref}
      className={`inline-block ${className ?? ""}`}
      style={{ x: sx, y: sy }}
      onPointerMove={(e) => {
        if (e.pointerType !== "mouse" || !ref.current) return;
        const r = ref.current.getBoundingClientRect();
        x.set((e.clientX - r.left - r.width / 2) * strength);
        y.set((e.clientY - r.top - r.height / 2) * strength);
      }}
      onPointerLeave={() => {
        x.set(0);
        y.set(0);
      }}
    >
      {children}
    </motion.div>
  );
}

export function Marquee({
  children,
  className = "",
  duration = 30,
  reverse = false,
}: {
  children: React.ReactNode;
  className?: string;
  duration?: number;
  reverse?: boolean;
}) {
  return (
    <div className={`flex overflow-hidden whitespace-nowrap ${className}`}>
      <div
        className="animate-marquee flex shrink-0"
        style={{ ["--dur" as string]: `${duration}s`, animationDirection: reverse ? "reverse" : "normal" }}
      >
        <div className="flex shrink-0">{children}</div>
        <div className="flex shrink-0" aria-hidden>
          {children}
        </div>
      </div>
    </div>
  );
}

export function Counter({
  to,
  suffix = "",
  className,
  duration = 2,
}: {
  to: number;
  suffix?: string;
  className?: string;
  duration?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const ready = usePageReady();
  useEffect(() => {
    if (!inView || !ready) return;
    const c = animate(0, to, {
      duration,
      ease: EXPO,
      onUpdate: (v) => {
        if (ref.current) ref.current.textContent = new Intl.NumberFormat("ru-RU").format(Math.round(v)) + suffix;
      },
    });
    return () => c.stop();
  }, [inView, ready, to, suffix, duration]);
  return (
    <span ref={ref} className={className}>
      0{suffix}
    </span>
  );
}

/** Mouse-tilt 3D wrapper */
export function Tilt({
  children,
  className,
  max = 12,
}: {
  children: React.ReactNode;
  className?: string;
  max?: number;
}) {
  const rx = useMotionValue(0);
  const ry = useMotionValue(0);
  const srx = useSpring(rx, { stiffness: 150, damping: 15 });
  const sry = useSpring(ry, { stiffness: 150, damping: 15 });
  return (
    <motion.div
      className={className}
      style={{ rotateX: srx, rotateY: sry, transformPerspective: 900 }}
      onPointerMove={(e) => {
        if (e.pointerType !== "mouse") return;
        const r = e.currentTarget.getBoundingClientRect();
        ry.set(((e.clientX - r.left) / r.width - 0.5) * max * 2);
        rx.set(-((e.clientY - r.top) / r.height - 0.5) * max * 2);
      }}
      onPointerLeave={() => {
        rx.set(0);
        ry.set(0);
      }}
    >
      {children}
    </motion.div>
  );
}

/** Parallax offset tied to page scroll through the element */
export function Parallax({
  children,
  className,
  speed = 0.2,
}: {
  children: React.ReactNode;
  className?: string;
  speed?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [`${speed * 100}%`, `${-speed * 100}%`]);
  return (
    <motion.div ref={ref} className={className} style={{ y }}>
      {children}
    </motion.div>
  );
}
