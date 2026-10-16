import type { Dict } from "@/i18n";
import type { Product } from "./products";

/** Title shown on the page-transition curtain. */
export function labelFor(path: string, t: Dict, getProduct: (slug: string) => Product | undefined) {
  if (path === "/") return t.pages.home;
  if (path.startsWith("/catalog/")) return getProduct(path.split("/")[2])?.name ?? t.pages.catalog;
  const key = path.slice(1) as keyof Dict["pages"];
  return t.pages[key] ?? "Makstar";
}
