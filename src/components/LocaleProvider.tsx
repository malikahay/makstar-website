"use client";

import { useRouter } from "next/navigation";
import { createContext, useCallback, useContext, useMemo, useTransition } from "react";
import { LANG_COOKIE, type Lang } from "@/i18n/config";
import { dictionaries, type Dict } from "@/i18n";
import { formatPrice } from "@/lib/products";

type LocaleCtx = { lang: Lang; t: Dict; setLang: (l: Lang) => void; switching: boolean };

const Ctx = createContext<LocaleCtx | null>(null);

export function LocaleProvider({ lang, children }: { lang: Lang; children: React.ReactNode }) {
  const router = useRouter();
  const [switching, startTransition] = useTransition();

  const setLang = useCallback(
    (l: Lang) => {
      document.cookie = `${LANG_COOKIE}=${l}; path=/; max-age=31536000; samesite=lax`;
      document.documentElement.lang = l;
      // re-render server components (catalog from the API, metadata) in the new language
      startTransition(() => router.refresh());
    },
    [router],
  );

  const value = useMemo(() => ({ lang, t: dictionaries[lang], setLang, switching }), [lang, setLang, switching]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useLocale() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useLocale outside LocaleProvider");
  return c;
}

/** Shorthand for the current dictionary. */
export function useT() {
  return useLocale().t;
}

/** formatPrice bound to the current language's currency name. */
export function useFormatPrice() {
  const { t } = useLocale();
  return useCallback((n: number) => formatPrice(n, t.currency), [t]);
}
