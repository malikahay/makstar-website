import { cookies } from "next/headers";
import { DEFAULT_LANG, LANG_COOKIE, isLang, type Lang } from "./config";
import { dictionaries } from "./index";

/** Server-only: the visitor's language from the cookie set by the RU/UZ switcher. */
export async function getLang(): Promise<Lang> {
  const v = (await cookies()).get(LANG_COOKIE)?.value;
  return isLang(v) ? v : DEFAULT_LANG;
}

export async function getDict() {
  return dictionaries[await getLang()];
}
