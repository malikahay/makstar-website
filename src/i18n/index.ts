import type { Lang } from "./config";
import { ru, type Dict } from "./ru";
import { uz } from "./uz";

export const dictionaries: Record<Lang, Dict> = { ru, uz };

export type { Dict };
