"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { api, statusLabels, type Order, type OrderStatus } from "@/lib/client";
import { formatPrice } from "@/lib/products";
import { useAuth } from "./AuthProvider";
import { Arrow, Button } from "./Button";
import { Field } from "./Contacts";
import { PageHero } from "./PageHero";
import { TLink, usePageTransition } from "./TransitionProvider";

/** Only allow same-site relative redirects after login. */
function safeNext(next: string | null, fallback = "/account") {
  return next && next.startsWith("/") && !next.startsWith("//") ? next : fallback;
}

function useGoAfterAuth() {
  const { navigate } = usePageTransition();
  const next = safeNext(useSearchParams().get("next"));
  // /admin is served by the Go backend, not by Next, so it needs a full page load
  return () => (next.startsWith("/admin") ? window.location.assign(next) : navigate(next));
}

function ErrorNote({ error }: { error: string | null }) {
  return (
    <AnimatePresence>
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="rounded-2xl bg-red-50 p-4 text-sm font-semibold text-red-600"
        >
          {error}
        </motion.p>
      )}
    </AnimatePresence>
  );
}

function AuthShell({ title, eyebrow, children }: { title: string; eyebrow: string; children: React.ReactNode }) {
  return (
    <>
      <PageHero eyebrow={eyebrow} title={title} pastas={["farfalle", "elbow", "penne"]} />
      <section className="mx-auto max-w-xl px-4 py-16 md:py-24">{children}</section>
    </>
  );
}

export function LoginPage() {
  const { login } = useAuth();
  const go = useGoAfterAuth();
  const next = useSearchParams().get("next");
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const set = (k: keyof typeof form) => (v: string) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <AuthShell eyebrow="Вход" title="С возвращением">
      <form
        className="space-y-4"
        onSubmit={async (e) => {
          e.preventDefault();
          setBusy(true);
          setError(null);
          try {
            await login(form.email, form.password);
            go();
          } catch (err) {
            setError(err instanceof Error ? err.message : "Не удалось войти");
            setBusy(false);
          }
        }}
      >
        <Field label="Email" name="email" type="email" required value={form.email} onChange={set("email")} />
        <Field label="Пароль" name="password" type="password" required value={form.password} onChange={set("password")} />
        <ErrorNote error={error} />
        <Button type="submit" variant="blue" big className="w-full" magnetic={false} disabled={busy} icon={<Arrow />}>
          {busy ? "Входим…" : "Войти"}
        </Button>
      </form>
      <p className="mt-8 text-center text-mk-black/60">
        Нет аккаунта?{" "}
        <TLink href={next ? `/register?next=${encodeURIComponent(next)}` : "/register"} className="font-bold text-mk-blue underline">
          Зарегистрироваться
        </TLink>
      </p>
    </AuthShell>
  );
}

export function RegisterPage() {
  const { register } = useAuth();
  const go = useGoAfterAuth();
  const next = useSearchParams().get("next");
  const [form, setForm] = useState({ name: "", phone: "", email: "", password: "" });
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const set = (k: keyof typeof form) => (v: string) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <AuthShell eyebrow="Регистрация" title="Свой человек">
      <p className="mb-8 text-lg text-mk-black/60">
        Аккаунт хранит историю заказов и заполняет контакты при оформлении — один раз ввели, дальше только макароны.
      </p>
      <form
        className="space-y-4"
        onSubmit={async (e) => {
          e.preventDefault();
          if (form.password.length < 8) {
            setError("Пароль должен быть не короче 8 символов");
            return;
          }
          setBusy(true);
          setError(null);
          try {
            await register(form);
            go();
          } catch (err) {
            setError(err instanceof Error ? err.message : "Не удалось зарегистрироваться");
            setBusy(false);
          }
        }}
      >
        <Field label="Имя" name="name" required value={form.name} onChange={set("name")} />
        <Field label="Телефон" name="phone" type="tel" value={form.phone} onChange={set("phone")} />
        <Field label="Email" name="email" type="email" required value={form.email} onChange={set("email")} />
        <Field label="Пароль, от 8 символов" name="new-password" type="password" required value={form.password} onChange={set("password")} />
        <ErrorNote error={error} />
        <Button type="submit" variant="blue" big className="w-full" magnetic={false} disabled={busy} icon={<Arrow />}>
          {busy ? "Создаём…" : "Создать аккаунт"}
        </Button>
      </form>
      <p className="mt-8 text-center text-mk-black/60">
        Уже есть аккаунт?{" "}
        <TLink href={next ? `/login?next=${encodeURIComponent(next)}` : "/login"} className="font-bold text-mk-blue underline">
          Войти
        </TLink>
      </p>
    </AuthShell>
  );
}

const statusColors: Record<OrderStatus, string> = {
  new: "bg-mk-yellow text-mk-black",
  confirmed: "bg-mk-blue/10 text-mk-blue",
  delivering: "bg-mk-blue text-white",
  done: "bg-emerald-100 text-emerald-700",
  cancelled: "bg-red-100 text-red-600",
};

export function AccountPage() {
  const { user, loading, logout } = useAuth();
  const { navigate } = usePageTransition();
  const [orders, setOrders] = useState<Order[] | null>(null);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      navigate("/login?next=/account");
      return;
    }
    api<Order[]>("/orders/my")
      .then(setOrders)
      .catch(() => setOrders([]));
  }, [user, loading, navigate]);

  if (!user) return <AuthShell eyebrow="Кабинет" title="Минутку…">{null}</AuthShell>;

  return (
    <>
      <PageHero eyebrow="Личный кабинет" title={`Привет, ${user.name.split(" ")[0]}`} pastas={["nest", "fusilli", "conchiglie"]}>
        <div className="mt-8 flex flex-wrap gap-3">
          {user.role === "admin" && (
            <a
              href="/admin"
              className="inline-flex items-center rounded-full bg-mk-yellow px-7 py-4 text-xs font-bold uppercase tracking-wider text-mk-black md:text-sm"
            >
              Админ-панель →
            </a>
          )}
          <Button
            variant="outline"
            magnetic={false}
            onClick={async () => {
              await logout();
              navigate("/");
            }}
          >
            Выйти
          </Button>
        </div>
      </PageHero>
      <section className="mx-auto grid max-w-[1400px] gap-10 px-4 py-16 md:px-8 md:py-24 lg:grid-cols-[1fr_2fr]">
        <div className="h-fit rounded-[32px] bg-mk-yellow-soft/60 p-6 md:p-8">
          <h2 className="font-display text-2xl font-black uppercase">Профиль</h2>
          <dl className="mt-6 space-y-4">
            {[
              ["Имя", user.name],
              ["Email", user.email],
              ["Телефон", user.phone || "—"],
              ["С нами с", new Date(user.createdAt).toLocaleDateString("ru-RU")],
            ].map(([k, v]) => (
              <div key={k}>
                <dt className="text-xs font-bold uppercase tracking-wider text-mk-black/50">{k}</dt>
                <dd className="mt-1 font-semibold">{v}</dd>
              </div>
            ))}
          </dl>
        </div>
        <div>
          <h2 className="mb-6 font-display text-3xl font-black uppercase md:text-4xl">Мои заказы</h2>
          {orders === null ? (
            <p className="text-mk-black/50">Загружаем…</p>
          ) : orders.length === 0 ? (
            <div className="rounded-[32px] border-2 border-dashed border-mk-black/10 p-10 text-center">
              <p className="text-mk-black/60">Заказов пока нет.</p>
              <div className="mt-6">
                <Button href="/catalog" variant="blue" icon={<Arrow />}>
                  В каталог
                </Button>
              </div>
            </div>
          ) : (
            <ul className="space-y-4">
              {orders.map((o) => (
                <li key={o.id} className="rounded-[28px] border-2 border-mk-black/10 p-5 md:p-6">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <span className="font-display text-xl font-black">{o.number}</span>
                      <span className="ml-3 text-sm text-mk-black/50">
                        {new Date(o.createdAt).toLocaleString("ru-RU", { dateStyle: "medium", timeStyle: "short" })}
                      </span>
                    </div>
                    <span className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider ${statusColors[o.status]}`}>
                      {statusLabels[o.status]}
                    </span>
                  </div>
                  <ul className="mt-4 space-y-1 text-sm text-mk-black/70">
                    {o.items.map((i) => (
                      <li key={i.slug + i.grams} className="flex justify-between gap-4">
                        <span>
                          {i.name}, {i.grams} г × {i.qty}
                        </span>
                        <span>{formatPrice(i.price * i.qty)}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-4 flex flex-wrap items-end justify-between gap-2 border-t border-mk-black/10 pt-4 text-sm">
                    <span className="text-mk-black/50">
                      {o.delivery === "pickup" ? "Самовывоз" : `${o.address}, ${o.slot}`} · {o.payment}
                    </span>
                    <span className="font-display text-xl font-black text-mk-blue">{formatPrice(o.total)}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </>
  );
}
