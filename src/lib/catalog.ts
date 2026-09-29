import { fallbackProducts, type Product } from "./products";

export const API_URL = process.env.API_URL ?? "http://localhost:8080";

/** Server-only: the active catalog from the Go API, refreshed every 10 seconds. */
export async function getProducts(): Promise<Product[]> {
  try {
    const res = await fetch(`${API_URL}/api/products`, { next: { revalidate: 10 } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return (await res.json()) as Product[];
  } catch (err) {
    console.warn(`[catalog] API unavailable at ${API_URL}, using built-in catalog:`, err);
    return fallbackProducts;
  }
}
