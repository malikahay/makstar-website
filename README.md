# Makstar — сайт макарон

Next.js 16 (App Router) + Tailwind CSS 4 + Framer Motion + Lenis.

Бэкенд — Go (chi + GORM + golang-migrate) и PostgreSQL в папке `backend/`.

```bash
cp .env.example .env      # задайте JWT_SECRET и ADMIN_PASSWORD
docker compose up -d      # Postgres :5433 + Go API :8080 (миграции применяются при старте)
npm install
npm run dev               # http://localhost:3000 — проксирует /api и /admin на Go
```

Без Docker: `cd backend && DATABASE_URL=postgres://… JWT_SECRET=… ADMIN_EMAIL=… ADMIN_PASSWORD=… go run ./cmd/server`.

Аккаунт из `ADMIN_EMAIL` при старте API создаётся (или получает роль админа). Остальных админов назначают в админке → «Пользователи».

## Страницы
| Маршрут | Что там |
|---|---|
| `/` | Главная: hero с параллаксом, манифест, горизонтальная линейка, 3 способа, цифры, рецепты, CTA |
| `/catalog` | Каталог с фильтрами (тип, способ готовки, сортировка) |
| `/catalog/[slug]` | Карточка товара: вес, количество, вкладки, кухонный таймер, рецепты |
| `/recipes` | Рецепты с фильтром и раскрывающейся карточкой (`?m=boil\|fry\|bake`) |
| `/about` | О нас: процесс производства, ценности |
| `/cart`, `/checkout` | Корзина (промокод `MAKSTAR10`) и оформление в 3 шага |
| `/delivery` | Доставка и оплата, калькулятор бесплатной доставки |
| `/contacts` | Контакты, форма, FAQ |
| `/register`, `/login`, `/account` | Регистрация, вход, личный кабинет с историей заказов |
| `/admin` | Админка (Go + htmx): статистика, заказы и статусы, товары, пользователи и роли |

## Где что менять
- Товары и цены — в админке (`/admin/products`). `src/lib/products.ts` — типы и запасной каталог на случай, если API недоступен
- Схема БД — `backend/migrations/` (новые изменения — новым файлом `00000N_*.up.sql`)
- Цены заказа, промокод и доставка считаются на сервере — `backend/internal/store/queries.go`
- Рецепты — `src/lib/recipes.ts`
- Цвета и шрифты — `src/app/globals.css` (`@theme`)
- Переход между страницами — `src/components/TransitionProvider.tsx` (используйте `TLink` вместо `Link`)

Все иллюстрации макарон и пачек — SVG/CSS (`Pasta.tsx`, `Pack.tsx`), внешних картинок нет.
Контакты, адрес, цифры и отзывы — заглушки, замените на реальные.
