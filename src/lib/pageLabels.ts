import { getProduct } from "./products";

export function labelFor(path: string) {
  if (path === "/") return "Главная";
  if (path.startsWith("/catalog/")) return getProduct(path.split("/")[2])?.name ?? "Каталог";
  const map: Record<string, string> = {
    "/catalog": "Каталог",
    "/recipes": "Рецепты",
    "/about": "О нас",
    "/cart": "Корзина",
    "/checkout": "Оформление",
    "/delivery": "Доставка и оплата",
    "/contacts": "Контакты",
  };
  return map[path] ?? "Makstar";
}
