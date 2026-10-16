import type { Lang } from "@/i18n/config";
import { fallbackProducts, type Product } from "./products";

export const API_URL = process.env.API_URL ?? "http://localhost:8080";

/** Server-only: the active catalog from the Go API in the given language, refreshed every 10 seconds. */
export async function getProducts(lang: Lang): Promise<Product[]> {
  try {
    const res = await fetch(`${API_URL}/api/products?lang=${lang}`, { next: { revalidate: 10 } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return (await res.json()) as Product[];
  } catch (err) {
    console.warn(`[catalog] API unavailable at ${API_URL}, using built-in catalog:`, err);
    return fallbackProducts;
  }
}
