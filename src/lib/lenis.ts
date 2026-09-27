import type Lenis from "lenis";

export const lenisRef: { current: Lenis | null } = { current: null };

export function scrollToTop(immediate = true) {
  if (lenisRef.current) lenisRef.current.scrollTo(0, { immediate, force: true });
  else window.scrollTo({ top: 0, behavior: immediate ? "instant" : "smooth" });
}
