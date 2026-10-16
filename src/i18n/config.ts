export const LANGS = ["ru", "uz"] as const;
export type Lang = (typeof LANGS)[number];
export const DEFAULT_LANG: Lang = "ru";
export const LANG_COOKIE = "lang";

export function isLang(v: unknown): v is Lang {
  return LANGS.includes(v as Lang);
}
