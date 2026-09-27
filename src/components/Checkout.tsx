"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import {
  FREE_SHIPPING_FROM,
  SHIPPING_PRICE,
  formatPrice,
  getProduct,
  products,
  type PastaKind,
} from "@/lib/products";
import { Arrow, Button } from "./Button";
import { CartLine, FreeShippingBar } from "./CartBits";
import { PROMO_CODE, priceOf, useCart } from "./CartProvider";
import { Field } from "./Contacts";
import { PageHero } from "./PageHero";
import { Pasta } from "./Pasta";
import { ProductCard } from "./ProductCard";
import { Reveal } from "./motion";

const EXPO = [0.16, 1, 0.3, 1] as const;

function useTotals(delivery: "courier" | "pickup" = "courier") {
  const { subtotal, discount } = useCart();
  const shipping = delivery === "pickup" || subtotal >= FREE_SHIPPING_FROM || subtotal === 0 ? 0 : SHIPPING_PRICE;
  return { subtotal, discount, shipping, total: subtotal - discount + shipping };
}

function Summary({
  delivery,
  children,
  compact,
}: {
  delivery?: "courier" | "pickup";
  children?: React.ReactNode;
  compact?: boolean;
}) {
  const { items, promo, applyPromo } = useCart();
  const { subtotal, discount, shipping, total } = useTotals(delivery);
  const [code, setCode] = useState("");
  const [err, setErr] = useState(false);
  return (
    <div className="sticky top-28 rounded-[32px] bg-mk-black p-6 text-white md:p-8">
      <h3 className="font-display text-2xl font-black uppercase">Ваш заказ</h3>
      {compact && (
        <ul className="mt-5 space-y-3">
          {items.map((i) => {
            const p = getProduct(i.slug)!;
            return (
              <li key={i.slug + i.grams} className="flex items-center gap-3 text-sm">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-mk-blue">
                  <Pasta kind={p.kind} className="h-7 w-7" />
                </span>
                <span className="flex-1">
                  {p.name}, {i.grams} г × {i.qty}
                </span>
                <span className="font-bold">{formatPrice(priceOf(i) * i.qty)}</span>
              </li>
            );
          })}
        </ul>
      )}
      <dl className="mt-6 space-y-3 border-t border-white/10 pt-6 text-sm">
        <div className="flex justify-between">
          <dt className="text-white/60">Товары</dt>
          <dd>{formatPrice(subtotal)}</dd>
        </div>
        <AnimatePresence>
          {discount > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="flex justify-between text-mk-yellow"
            >
              <dt>Промокод {promo}</dt>
              <dd>−{formatPrice(discount)}</dd>
            </motion.div>
          )}
        </AnimatePresence>
        <div className="flex justify-between">
          <dt className="text-white/60">Доставка</dt>
          <dd>{shipping === 0 ? "Бесплатно" : formatPrice(shipping)}</dd>
        </div>
      </dl>
      {!promo && (
        <form
          className={`mt-6 flex overflow-hidden rounded-full bg-white/10 p-1 ${err ? "ring-2 ring-red-400" : ""}`}
          onSubmit={(e) => {
            e.preventDefault();
            setErr(!applyPromo(code));
          }}
        >
          <input
            value={code}
            onChange={(e) => {
              setCode(e.target.value);
              setErr(false);
            }}
            placeholder={`Промокод (попробуйте ${PROMO_CODE})`}
            className="min-w-0 flex-1 bg-transparent px-4 text-sm uppercase outline-none placeholder:normal-case placeholder:text-white/40"
          />
          <button className="rounded-full bg-white px-4 py-2 text-xs font-bold uppercase text-mk-black">Ок</button>
        </form>
      )}
      <div className="mt-6 flex items-end justify-between border-t border-white/10 pt-6">
        <span className="text-white/60">Итого</span>
        <AnimatePresence mode="popLayout">
          <motion.span
            key={total}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            className="font-display text-3xl font-black text-mk-yellow"
          >
            {formatPrice(total)}
          </motion.span>
        </AnimatePresence>
      </div>
      {children && <div className="mt-6">{children}</div>}
    </div>
  );
}

function EmptyCart() {
  return (
    <div className="flex flex-col items-center py-20 text-center">
      <motion.div animate={{ rotate: [0, -10, 10, 0] }} transition={{ repeat: Infinity, duration: 3 }}>
        <Pasta kind="nest" className="h-40 w-40" />
      </motion.div>
      <h2 className="mt-6 font-display text-4xl font-black uppercase">Корзина пуста</h2>
      <p className="mt-3 max-w-sm text-mk-black/60">Но это легко исправить. Начните с хитов — их выбирают чаще всего.</p>
      <div className="mt-8">
        <Button href="/catalog" variant="blue" big icon={<Arrow />}>
          В каталог
        </Button>
      </div>
    </div>
  );
}

export function CartPage() {
  const { items, subtotal } = useCart();
  const suggestions = products.filter((p) => p.badge === "Хит" && !items.some((i) => i.slug === p.slug)).slice(0, 4);
  return (
    <>
      <PageHero eyebrow="Корзина" title="Ваша кастрюля" pastas={["nest", "penne", "elbow"]} />
      <section className="mx-auto max-w-[1400px] px-4 py-16 md:px-8 md:py-24">
        {items.length === 0 ? (
          <EmptyCart />
        ) : (
          <div className="grid gap-10 lg:grid-cols-[1.6fr_1fr]">
            <div>
              <div className="mb-6 rounded-3xl bg-mk-yellow-soft/50 p-5">
                <FreeShippingBar subtotal={subtotal} />
              </div>
              <ul>
                <AnimatePresence initial={false}>
                  {items.map((i) => (
                    <CartLine key={i.slug + i.grams} item={i} />
                  ))}
                </AnimatePresence>
              </ul>
            </div>
            <div>
              <Summary>
                <Button href="/checkout" variant="yellow" big className="w-full" magnetic={false} icon={<Arrow />}>
                  Оформить заказ
                </Button>
              </Summary>
            </div>
          </div>
        )}
      </section>
      {suggestions.length > 0 && (
        <section className="mx-auto max-w-[1400px] px-4 pb-24 md:px-8">
          <h2 className="mb-10 font-display text-3xl font-black uppercase md:text-5xl">Добавить к заказу?</h2>
          <div className="grid grid-cols-2 gap-x-4 gap-y-12 md:grid-cols-4 md:gap-x-8">
            {suggestions.map((p, i) => (
              <Reveal key={p.slug} delay={i * 0.08}>
                <ProductCard product={p} />
              </Reveal>
            ))}
          </div>
        </section>
      )}
    </>
  );
}

/* ───────────────────────── CHECKOUT ───────────────────────── */

const STEPS = ["Контакты", "Доставка", "Оплата"];
const SLOTS = ["9:00–13:00", "13:00–17:00", "17:00–21:00"];
const PAY = ["Click", "Payme", "Uzum", "Картой онлайн", "Наличными курьеру"];

function Choice({
  active,
  onClick,
  title,
  sub,
  group,
}: {
  active: boolean;
  onClick: () => void;
  title: string;
  sub?: string;
  group: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative overflow-hidden rounded-2xl border-2 p-5 text-left transition-colors ${
        active ? "border-mk-blue" : "border-mk-black/10 hover:border-mk-black/30"
      }`}
    >
      {active && <motion.span layoutId={group} className="absolute inset-0 bg-mk-blue" transition={{ type: "spring", stiffness: 400, damping: 35 }} />}
      <span className={`relative block font-display font-bold transition-colors ${active ? "text-white" : ""}`}>{title}</span>
      {sub && <span className={`relative mt-1 block text-sm transition-colors ${active ? "text-white/70" : "text-mk-black/50"}`}>{sub}</span>}
    </button>
  );
}

function Confetti() {
  const [pieces] = useState(() => {
    const kinds: PastaKind[] = ["penne", "fusilli", "farfalle", "elbow", "conchiglie", "rigatoni"];
    return Array.from({ length: 36 }).map((_, i) => ({
      kind: kinds[i % kinds.length],
      x: (Math.random() - 0.5) * 1400,
      y: -Math.random() * 700 - 100,
      r: Math.random() * 720 - 360,
      s: 30 + Math.random() * 50,
    }));
  });
  return (
    <div className="pointer-events-none fixed inset-0 z-[130] flex items-center justify-center">
      {pieces.map((p, i) => (
        <motion.div
          key={i}
          className="absolute"
          style={{ width: p.s, height: p.s }}
          initial={{ x: 0, y: 200, rotate: 0, opacity: 1 }}
          animate={{ x: p.x, y: [200, p.y, p.y + 1200], rotate: p.r, opacity: [1, 1, 0] }}
          transition={{ duration: 2.8, ease: [0.2, 0.8, 0.4, 1], times: [0, 0.35, 1] }}
        >
          <Pasta kind={p.kind} className="h-full w-full" />
        </motion.div>
      ))}
    </div>
  );
}

export function CheckoutPage() {
  const { items, clear } = useCart();
  const [step, setStep] = useState(0);
  const [dir, setDir] = useState(1);
  const [delivery, setDelivery] = useState<"courier" | "pickup">("courier");
  const [slot, setSlot] = useState(SLOTS[1]);
  const [pay, setPay] = useState(PAY[0]);
  const [form, setForm] = useState({ name: "", phone: "", email: "", address: "", comment: "" });
  const [done, setDone] = useState<string | null>(null);
  const { total } = useTotals(delivery);

  const set = (k: keyof typeof form) => (v: string) => setForm((f) => ({ ...f, [k]: v }));
  const go = (n: number) => {
    setDir(n > step ? 1 : -1);
    setStep(n);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (done) {
    return (
      <>
        <Confetti />
        <section className="grain relative flex min-h-screen flex-col items-center justify-center bg-mk-blue px-4 pt-24 text-center text-white">
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 120, damping: 12 }}
            className="grid h-32 w-32 place-items-center rounded-full bg-mk-yellow text-6xl text-mk-black"
          >
            ✓
          </motion.div>
          <motion.h1
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 1, ease: EXPO }}
            className="mt-10 font-display text-5xl font-black uppercase leading-[0.9] md:text-8xl"
          >
            Заказ принят!
          </motion.h1>
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-6 max-w-md text-lg text-white/80"
          >
            Номер заказа <b className="text-mk-yellow">{done}</b>. Мы позвоним вам в течение 10 минут. Ставьте воду кипятиться!
          </motion.p>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }} className="mt-10 flex flex-wrap justify-center gap-3">
            <Button href="/recipes" big>
              Что приготовить
            </Button>
            <Button href="/" variant="outline" big>
              На главную
            </Button>
          </motion.div>
        </section>
      </>
    );
  }

  if (items.length === 0) {
    return (
      <>
        <PageHero eyebrow="Оформление" title="Оформление заказа" pastas={["penne", "fusilli", "elbow"]} />
        <EmptyCart />
      </>
    );
  }

  const canNext =
    step === 0 ? form.name.trim().length > 1 && form.phone.replace(/\D/g, "").length >= 9 : step === 1 ? delivery === "pickup" || form.address.trim().length > 4 : true;

  return (
    <>
      <PageHero eyebrow="Оформление" title="Почти готово" pastas={["penne", "fusilli", "elbow"]} />
      <section className="mx-auto max-w-[1400px] px-4 py-16 md:px-8 md:py-24">
        <div className="grid gap-10 lg:grid-cols-[1.6fr_1fr]">
          <div>
            {/* stepper */}
            <div className="mb-10 flex items-center gap-2">
              {STEPS.map((s, i) => (
                <button
                  key={s}
                  onClick={() => i < step && go(i)}
                  className="flex flex-1 flex-col gap-2 text-left"
                  disabled={i > step}
                >
                  <div className="relative h-1.5 overflow-hidden rounded-full bg-mk-black/10">
                    <motion.div
                      className="absolute inset-y-0 left-0 bg-mk-blue"
                      animate={{ width: i <= step ? "100%" : "0%" }}
                      transition={{ duration: 0.6, ease: EXPO }}
                    />
                  </div>
                  <span className={`text-xs font-bold uppercase tracking-wider ${i <= step ? "text-mk-blue" : "text-mk-black/40"}`}>
                    0{i + 1} · {s}
                  </span>
                </button>
              ))}
            </div>

            <div className="relative overflow-hidden">
              <AnimatePresence mode="wait" custom={dir}>
                <motion.div
                  key={step}
                  custom={dir}
                  initial={{ x: dir * 80, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: dir * -80, opacity: 0 }}
                  transition={{ duration: 0.45, ease: EXPO }}
                  className="space-y-4"
                >
                  {step === 0 && (
                    <>
                      <h2 className="font-display text-3xl font-black uppercase md:text-4xl">Кто будет есть макароны?</h2>
                      <Field label="Имя" name="name" required value={form.name} onChange={set("name")} />
                      <Field label="Телефон" name="phone" type="tel" required value={form.phone} onChange={set("phone")} />
                      <Field label="Email для чека" name="email" type="email" value={form.email} onChange={set("email")} />
                    </>
                  )}
                  {step === 1 && (
                    <>
                      <h2 className="font-display text-3xl font-black uppercase md:text-4xl">Куда везём?</h2>
                      <div className="grid gap-3 sm:grid-cols-2">
                        <Choice group="delivery" active={delivery === "courier"} onClick={() => setDelivery("courier")} title="Курьером" sub="Сегодня или завтра" />
                        <Choice group="delivery" active={delivery === "pickup"} onClick={() => setDelivery("pickup")} title="Самовывоз" sub="Бесплатно, через 2 часа" />
                      </div>
                      <AnimatePresence initial={false}>
                        {delivery === "courier" && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="space-y-4 overflow-hidden"
                          >
                            <Field label="Адрес доставки" name="address" required value={form.address} onChange={set("address")} />
                            <div className="text-sm font-bold uppercase tracking-wider text-mk-black/50">Интервал</div>
                            <div className="grid gap-3 sm:grid-cols-3">
                              {SLOTS.map((s) => (
                                <Choice key={s} group="slot" active={slot === s} onClick={() => setSlot(s)} title={s} />
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                      <Field label="Комментарий курьеру" name="comment" textarea value={form.comment} onChange={set("comment")} />
                    </>
                  )}
                  {step === 2 && (
                    <>
                      <h2 className="font-display text-3xl font-black uppercase md:text-4xl">Как оплатите?</h2>
                      <div className="grid gap-3 sm:grid-cols-2">
                        {PAY.map((p) => (
                          <Choice key={p} group="pay" active={pay === p} onClick={() => setPay(p)} title={p} />
                        ))}
                      </div>
                      <div className="rounded-2xl bg-mk-yellow-soft/60 p-5 text-sm">
                        <b>{form.name}</b>, {form.phone}
                        <br />
                        {delivery === "courier" ? `${form.address}, ${slot}` : "Самовывоз: г. Чирчик, ул. Ш. Рашидова, 368"}
                      </div>
                    </>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            <div className="mt-10 flex flex-wrap gap-3">
              {step > 0 && (
                <Button variant="outline" onClick={() => go(step - 1)} magnetic={false}>
                  Назад
                </Button>
              )}
              {step < 2 ? (
                <Button variant="blue" onClick={() => go(step + 1)} disabled={!canNext} icon={<Arrow />}>
                  Далее
                </Button>
              ) : (
                <Button
                  variant="yellow"
                  big
                  onClick={() => {
                    setDone("MK-" + Math.floor(100000 + Math.random() * 899999));
                    clear();
                    window.scrollTo({ top: 0 });
                  }}
                >
                  {`Оплатить ${formatPrice(total)}`}
                </Button>
              )}
            </div>
          </div>
          <div>
            <Summary delivery={delivery} compact />
          </div>
        </div>
      </section>
    </>
  );
}
