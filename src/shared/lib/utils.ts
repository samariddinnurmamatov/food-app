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

// SSR-safe price formatter
export function fmt(price: number) {
  return `${String(price).replace(/\B(?=(\d{3})+(?!\d))/g, " ")} so'm`;
}

// SSR-safe date formatter
export function fmtDate(dateStr: string): string {
  const d = new Date(dateStr);
  const months = ["Yan","Fev","Mar","Apr","May","Iyn","Iyl","Avg","Sen","Okt","Noy","Dek"];
  return `${d.getDate()} ${months[d.getMonth()]}, ${String(d.getHours()).padStart(2,"0")}:${String(d.getMinutes()).padStart(2,"0")}`;
}
