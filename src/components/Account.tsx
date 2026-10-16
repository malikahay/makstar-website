"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { dictionaries } from "@/i18n";
import { api, type Order, type OrderStatus, type User } from "@/lib/client";
import { useAuth } from "./AuthProvider";
import { Arrow, Button } from "./Button";
import { Consent } from "./Consent";
import { Field } from "./Contacts";
import { useFormatPrice, useLocale, useT } from "./LocaleProvider";
import { useProducts } from "./ProductsProvider";
import { PageHero } from "./PageHero";
import { TLink, usePageTransition } from "./TransitionProvider";

/** Only allow same-site relative redirects after login. */
function safeNext(next: string | null, fallback = "/account") {
  return next && next.startsWith("/") && !next.startsWith("//") ? next : fallback;
}

function useGoAfterAuth() {
  const { navigate } = usePageTransition();
  const param = useSearchParams().get("next");
  return (u: User) => {
    // admins land in the admin panel unless they were heading somewhere specific
    const next = safeNext(param, u.role === "admin" ? "/admin" : "/account");
    // /admin is served by the Go backend, not by Next, so it needs a full page load
    if (next.startsWith("/admin")) window.location.assign(next);
    else navigate(next);
  };
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
  const t = useT();
  const { login } = useAuth();
  const go = useGoAfterAuth();
  const next = useSearchParams().get("next");
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const set = (k: keyof typeof form) => (v: string) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <AuthShell eyebrow={t.auth.loginEyebrow} title={t.auth.loginTitle}>
      <form
        className="space-y-4"
        onSubmit={async (e) => {
          e.preventDefault();
          setBusy(true);
          setError(null);
          try {
            go(await login(form.email, form.password));
          } catch (err) {
            setError(err instanceof Error ? err.message : t.auth.loginFailed);
            setBusy(false);
          }
        }}
      >
        <Field label={t.auth.email} name="email" required value={form.email} onChange={set("email")} />
        <Field label={t.auth.password} name="password" type="password" required value={form.password} onChange={set("password")} />
        <ErrorNote error={error} />
        <Button type="submit" variant="blue" big className="w-full" magnetic={false} disabled={busy} icon={<Arrow />}>
          {busy ? t.auth.loggingIn : t.auth.login}
        </Button>
      </form>
      <p className="mt-8 text-center text-mk-black/60">
        {t.auth.noAccount}{" "}
        <TLink href={next ? `/register?next=${encodeURIComponent(next)}` : "/register"} className="font-bold text-mk-blue underline">
          {t.auth.register}
        </TLink>
      </p>
    </AuthShell>
  );
}

export function RegisterPage() {
  const t = useT();
  const { register } = useAuth();
  const go = useGoAfterAuth();
  const next = useSearchParams().get("next");
  const [form, setForm] = useState({ name: "", phone: "", email: "", password: "" });
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const set = (k: keyof typeof form) => (v: string) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <AuthShell eyebrow={t.auth.registerEyebrow} title={t.auth.registerTitle}>
      <p className="mb-8 text-lg text-mk-black/60">{t.auth.registerLead}</p>
      <form
        className="space-y-4"
        onSubmit={async (e) => {
          e.preventDefault();
          if (form.password.length < 8) {
            setError(t.auth.passwordShort);
            return;
          }
          setBusy(true);
          setError(null);
          try {
            go(await register(form));
          } catch (err) {
            setError(err instanceof Error ? err.message : t.auth.registerFailed);
            setBusy(false);
          }
        }}
      >
        <Field label={t.auth.name} name="name" required value={form.name} onChange={set("name")} />
        <Field label={t.auth.phone} name="phone" type="tel" value={form.phone} onChange={set("phone")} />
        <Field label={t.auth.email} name="email" type="email" required value={form.email} onChange={set("email")} />
        <Field label={t.auth.newPassword} name="new-password" type="password" required value={form.password} onChange={set("password")} />
        <ErrorNote error={error} />
        <Consent />
        <Button type="submit" variant="blue" big className="w-full" magnetic={false} disabled={busy} icon={<Arrow />}>
          {busy ? t.auth.creating : t.auth.create}
        </Button>
      </form>
      <p className="mt-8 text-center text-mk-black/60">
        {t.auth.haveAccount}{" "}
        <TLink href={next ? `/login?next=${encodeURIComponent(next)}` : "/login"} className="font-bold text-mk-blue underline">
          {t.auth.login}
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
  const { t } = useLocale();
  const formatPrice = useFormatPrice();
  const { getProduct } = useProducts();
  // orders store the Russian payment label; show it in the current language
  const payLabel = (p: string) => {
    const key = (Object.keys(dictionaries.ru.checkout.payments) as (keyof typeof t.checkout.payments)[]).find(
      (k) => dictionaries.ru.checkout.payments[k] === p,
    );
    return key ? t.checkout.payments[key] : p;
  };
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

  if (!user) return <AuthShell eyebrow={t.account.eyebrow} title={t.account.wait}>{null}</AuthShell>;

  return (
    <>
      <PageHero eyebrow={t.account.eyebrow} title={t.account.hello(user.name.split(" ")[0])} pastas={["nest", "fusilli", "conchiglie"]}>
        <div className="mt-8 flex flex-wrap gap-3">
          {user.role === "admin" && (
            <a
              href="/admin"
              className="inline-flex items-center rounded-full bg-mk-yellow px-7 py-4 text-xs font-bold uppercase tracking-wider text-mk-black md:text-sm"
            >
              {t.account.admin}
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
            {t.account.logout}
          </Button>
        </div>
      </PageHero>
      <section className="mx-auto grid max-w-[1400px] gap-10 px-4 py-16 md:px-8 md:py-24 lg:grid-cols-[1fr_2fr]">
        <div className="h-fit rounded-[32px] bg-mk-yellow-soft/60 p-6 md:p-8">
          <h2 className="font-display text-2xl font-black uppercase">{t.account.profile}</h2>
          <dl className="mt-6 space-y-4">
            {[
              [t.account.name, user.name],
              [t.account.email, user.email],
              [t.account.phone, user.phone || "—"],
              [t.account.since, new Date(user.createdAt).toLocaleDateString(t.locale)],
            ].map(([k, v]) => (
              <div key={k}>
                <dt className="text-xs font-bold uppercase tracking-wider text-mk-black/50">{k}</dt>
                <dd className="mt-1 font-semibold">{v}</dd>
              </div>
            ))}
          </dl>
        </div>
        <div>
          <h2 className="mb-6 font-display text-3xl font-black uppercase md:text-4xl">{t.account.orders}</h2>
          {orders === null ? (
            <p className="text-mk-black/50">{t.account.loading}</p>
          ) : orders.length === 0 ? (
            <div className="rounded-[32px] border-2 border-dashed border-mk-black/10 p-10 text-center">
              <p className="text-mk-black/60">{t.account.noOrders}</p>
              <div className="mt-6">
                <Button href="/catalog" variant="blue" icon={<Arrow />}>
                  {t.common.toCatalog}
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
                        {new Date(o.createdAt).toLocaleString(t.locale, { dateStyle: "medium", timeStyle: "short" })}
                      </span>
                    </div>
                    <span className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider ${statusColors[o.status]}`}>
                      {t.statuses[o.status]}
                    </span>
                  </div>
                  <ul className="mt-4 space-y-1 text-sm text-mk-black/70">
                    {o.items.map((i) => (
                      <li key={i.slug + i.grams} className="flex justify-between gap-4">
                        <span>
                          {getProduct(i.slug)?.name ?? i.name}, {i.grams} {t.g} × {i.qty}
                        </span>
                        <span>{formatPrice(i.price * i.qty)}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-4 flex flex-wrap items-end justify-between gap-2 border-t border-mk-black/10 pt-4 text-sm">
                    <span className="text-mk-black/50">
                      {o.delivery === "pickup" ? t.account.pickup : `${o.address}, ${o.slot}`} · {payLabel(o.payment)}
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
