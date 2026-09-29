"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { animate as animateValue, useAnimate } from "framer-motion";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ComponentProps,
} from "react";
import { lenisRef, scrollToTop } from "@/lib/lenis";
import { labelFor } from "@/lib/pageLabels";
import { useProducts } from "./ProductsProvider";
import { Pasta } from "./Pasta";
import { Logo } from "./Logo";

type Ctx = { navigate: (href: string) => void; ready: boolean };
const TransitionCtx = createContext<Ctx>({ navigate: () => {}, ready: true });

export const usePageTransition = () => useContext(TransitionCtx);
/** true once the curtain has lifted — use to start entrance animations */
export const usePageReady = () => useContext(TransitionCtx).ready;

const EASE = [0.76, 0, 0.24, 1] as const;
const PASTAS = ["fusilli", "penne", "farfalle", "elbow", "conchiglie"] as const;

export function TransitionProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { getProduct } = useProducts();
  const [scope, animate] = useAnimate<HTMLDivElement>();
  const [ready, setReady] = useState(false);
  const [intro, setIntro] = useState(true);
  const [label, setLabel] = useState("");
  const [pastaIdx, setPastaIdx] = useState(0);
  const [blocking, setBlocking] = useState(true);
  const counterRef = useRef<HTMLSpanElement>(null);
  const busy = useRef(true);
  const target = useRef<string | null>(null);

  const reveal = useCallback(async () => {
    scrollToTop(true);
    setReady(true);
    await animate([
      [".tr-label", { y: "-40%", opacity: 0 }, { duration: 0.35, ease: "easeIn" }],
      [".tr-blue", { y: ["0%", "-100%"] }, { duration: 0.85, ease: EASE, at: 0.1 }],
      [".tr-yellow", { y: ["0%", "-100%"] }, { duration: 0.85, ease: EASE, at: 0.2 }],
    ]);
    // park panels below the viewport, hidden, ready for the next cover
    await animate([
      [".tr-blue", { y: "100%" }, { duration: 0 }],
      [".tr-yellow", { y: "100%" }, { duration: 0 }],
    ]);
    setBlocking(false);
    lenisRef.current?.start();
    busy.current = false;
  }, [animate]);

  // intro loader on first load
  useEffect(() => {
    let seen = false;
    try {
      seen = sessionStorage.getItem("mk-intro") === "1";
      sessionStorage.setItem("mk-intro", "1");
    } catch {}
    lenisRef.current?.stop();
    const run = async () => {
      if (!seen) {
        await animateValue(0, 100, {
          duration: 1.8,
          ease: [0.65, 0, 0.35, 1],
          onUpdate: (v) => {
            if (counterRef.current) counterRef.current.textContent = String(Math.round(v)).padStart(3, "0");
          },
        });
      } else {
        await new Promise((r) => setTimeout(r, 250));
      }
      await reveal();
      setIntro(false);
    };
    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const navigate = useCallback(
    async (href: string) => {
      const path = href.split(/[?#]/)[0] || "/";
      if (busy.current) return;
      if (path === pathname) {
        scrollToTop(false);
        return;
      }
      busy.current = true;
      router.prefetch(href);
      setLabel(labelFor(path, getProduct));
      setPastaIdx((i) => (i + 1) % PASTAS.length);
      lenisRef.current?.stop();
      setBlocking(true);
      await animate([
        [".tr-yellow", { y: ["100%", "0%"] }, { duration: 0.7, ease: EASE }],
        [".tr-blue", { y: ["100%", "0%"] }, { duration: 0.7, ease: EASE, at: 0.1 }],
        [".tr-label", { y: ["60%", "0%"], opacity: [0, 1] }, { duration: 0.5, ease: [0.16, 1, 0.3, 1], at: 0.5 }],
      ]);
      setReady(false);
      target.current = path;
      router.push(href, { scroll: false });
    },
    [animate, pathname, router, getProduct],
  );

  // new route committed → lift the curtain
  useEffect(() => {
    if (target.current && target.current === pathname) {
      target.current = null;
      const t = setTimeout(reveal, 450);
      return () => clearTimeout(t);
    }
  }, [pathname, reveal]);

  // safety net if a navigation never commits
  useEffect(() => {
    if (!target.current) return;
    const t = setTimeout(() => {
      if (target.current) {
        target.current = null;
        reveal();
      }
    }, 5000);
    return () => clearTimeout(t);
  });

  return (
    <TransitionCtx.Provider value={{ navigate, ready }}>
      {children}
      <div
        ref={scope}
        className={`fixed inset-0 z-[200] ${blocking ? "" : "pointer-events-none invisible"}`}
        aria-hidden={!blocking}
      >
        <div className="tr-yellow absolute inset-0 bg-mk-yellow" style={{ transform: "translateY(0%)" }}>
          <div className="absolute -top-[14vh] left-0 h-[15vh] w-full rounded-[50%_50%_0_0/100%_100%_0_0] bg-mk-yellow" />
          <div className="absolute -bottom-[14vh] left-0 h-[15vh] w-full rounded-[0_0_50%_50%/0_0_100%_100%] bg-mk-yellow" />
        </div>
        <div className="tr-blue grain absolute inset-0 bg-mk-blue" style={{ transform: "translateY(0%)" }}>
          <div className="absolute -top-[14vh] left-0 h-[15vh] w-full rounded-[50%_50%_0_0/100%_100%_0_0] bg-mk-blue" />
          <div className="absolute -bottom-[14vh] left-0 h-[15vh] w-full rounded-[0_0_50%_50%/0_0_100%_100%] bg-mk-blue" />
          <div className="tr-label absolute inset-0 flex flex-col items-center justify-center px-4 text-center text-white">
            <Pasta
              kind={PASTAS[pastaIdx]}
              className="animate-spin-slow mb-6 h-24 w-24 md:h-32 md:w-32"
              style={{ animationDuration: "2.4s" }}
            />
            {intro ? (
              <>
                <Logo className="text-5xl md:text-8xl" />
                <div className="mt-6 font-display text-mk-yellow">
                  <span ref={counterRef} className="text-2xl tabular-nums md:text-3xl">000</span>
                  <span className="ml-2 text-sm uppercase tracking-[0.3em] opacity-70">варим</span>
                </div>
              </>
            ) : (
              <>
                <span className="mb-3 text-xs font-bold uppercase tracking-[0.4em] text-mk-yellow">Makstar →</span>
                <span className="font-display text-5xl font-black uppercase leading-none md:text-8xl">{label}</span>
              </>
            )}
          </div>
        </div>
      </div>
    </TransitionCtx.Provider>
  );
}

type TLinkProps = Omit<ComponentProps<typeof Link>, "href"> & { href: string };

/** Link that plays the curtain transition before navigating */
export function TLink({ href, children, ...rest }: TLinkProps) {
  const { navigate } = usePageTransition();
  return (
    <Link
      href={href}
      {...rest}
      onNavigate={(e) => {
        e.preventDefault();
        navigate(href);
      }}
    >
      {children}
    </Link>
  );
}
