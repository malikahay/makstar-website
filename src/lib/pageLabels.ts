import type { Product } from "./products";

export function labelFor(path: string, getProduct: (slug: string) => Product | undefined) {
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
    "/login": "Вход",
    "/register": "Регистрация",
    "/account": "Кабинет",
  };
  return map[path] ?? "Makstar";
}
