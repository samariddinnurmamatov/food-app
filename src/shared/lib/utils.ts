import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Removes a leading /uz, /ru or /en locale segment from a pathname
export function stripLocale(path: string): string {
  return path.replace(/^\/(uz|ru|en)(?=\/|$)/, "") || "/";
}

// Delivery pricing — single source of truth for cart & checkout
export const FREE_DELIVERY_THRESHOLD = 100_000;
export const DELIVERY_FEE = 7_000;
export function computeDeliveryFee(total: number): number {
  return total >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_FEE;
}

// Right-size an Unsplash photo to how it actually renders by rewriting the
// `w=` query param (data ships w=200/600/800). Single source of truth shared by
// every raw <img> that isn't migrated to next/image.
export function sized(url: string, w: number): string {
  return url.replace(/w=\d+/, `w=${w}`);
}

// SSR-safe price formatter
export function fmt(price: number) {
  return `${String(price).replace(/\B(?=(\d{3})+(?!\d))/g, " ")} so'm`;
}

// Maps an app locale (uz/ru/en) to a BCP-47 tag for Intl.
const DATE_LOCALES: Record<string, string> = {
  uz: "uz-UZ",
  ru: "ru-RU",
  en: "en-US",
};

// Hand-rolled Uzbek short months — ICU/Intl lacks proper `uz` short-month data
// (it renders the raw "M06" CLDR code), so we format Uzbek ourselves.
const UZ_MONTHS = ["Yan","Fev","Mar","Apr","May","Iyn","Iyl","Avg","Sen","Okt","Noy","Dek"];
function fmtDateUz(d: Date): string {
  return `${d.getDate()} ${UZ_MONTHS[d.getMonth()]}, ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

// Locale-aware date formatter: day + short month + time (e.g. "16 Jun, 14:05").
// Uzbek (the default) is hand-formatted; ru/en use Intl. Falls back to the
// Uzbek formatter if Intl ever throws for the requested locale.
export function fmtDate(dateStr: string, locale?: string): string {
  const d = new Date(dateStr);
  if (!locale || locale === "uz") return fmtDateUz(d);
  const tag = DATE_LOCALES[locale] ?? DATE_LOCALES.uz;
  try {
    return new Intl.DateTimeFormat(tag, {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).format(d);
  } catch {
    return fmtDateUz(d);
  }
}
