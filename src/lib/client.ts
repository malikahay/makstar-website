import { dictionaries } from "@/i18n";
import { LANG_COOKIE, isLang } from "@/i18n/config";

function networkError() {
  const v = document.cookie.match(new RegExp(`(?:^|; )${LANG_COOKIE}=([^;]*)`))?.[1];
  return dictionaries[isLang(v) ? v : "ru"].errors.network;
}

/** Browser-side call to the Go API (proxied through Next at /api). Throws with the server's message. */
export async function api<T>(path: string, body?: unknown): Promise<T> {
  const res = await fetch(`/api${path}`, {
    method: body === undefined ? "GET" : "POST",
    headers: body === undefined ? undefined : { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
    credentials: "same-origin",
  });
  if (res.status === 204) return undefined as T;
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new ApiError(res.status, data?.error ?? networkError());
  return data as T;
}

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

export type User = { id: number; email: string; name: string; phone: string; role: "user" | "admin"; createdAt: string };

export type OrderStatus = "new" | "confirmed" | "delivering" | "done" | "cancelled";

export type Order = {
  id: number;
  number: string;
  delivery: "courier" | "pickup";
  address: string;
  slot: string;
  payment: string;
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  status: OrderStatus;
  createdAt: string;
  items: { slug: string; name: string; grams: number; qty: number; price: number }[];
};

