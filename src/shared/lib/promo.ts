// Promo code validation — static, no backend.
// A single source of truth shared by the cart and checkout pages.

export type PromoKind = "percent" | "freeDelivery";

export interface PromoResult {
  valid: boolean;
  /** Discount type, only present when valid. */
  kind?: PromoKind;
  /** For "percent": discount percentage (e.g. 50 = 50% off subtotal). */
  value?: number;
  /** Normalised (upper-cased) code, only present when valid. */
  code?: string;
}

interface PromoDef {
  kind: PromoKind;
  value?: number;
}

// Hardcoded promo codes. Keys must be UPPERCASE.
const PROMO_CODES: Record<string, PromoDef> = {
  HELLO50: { kind: "percent", value: 50 },
  EVOS20: { kind: "percent", value: 20 },
  BEPUL: { kind: "freeDelivery" },
};

/** Public list of codes for display (so users can see & tap them). */
export const AVAILABLE_PROMOS: { code: string; kind: PromoKind; value?: number }[] =
  Object.entries(PROMO_CODES).map(([code, def]) => ({ code, ...def }));

/** localStorage key used to share the applied code between cart & checkout. */
export const PROMO_STORAGE_KEY = "promo_code";

/** Validate a raw user-entered code against the hardcoded list. */
export function validatePromo(code: string): PromoResult {
  const normalized = code.trim().toUpperCase();
  if (!normalized) return { valid: false };
  const def = PROMO_CODES[normalized];
  if (!def) return { valid: false };
  return { valid: true, kind: def.kind, value: def.value, code: normalized };
}

/**
 * Compute the discount applied to the item subtotal for a valid promo.
 * Only "percent" promos reduce the subtotal; "freeDelivery" returns 0 here
 * (its effect is applied to the delivery fee by the caller).
 * Result is clamped to [0, subtotal] and rounded to whole so'm.
 */
export function computePromoDiscount(promo: PromoResult, subtotal: number): number {
  if (!promo.valid || promo.kind !== "percent" || !promo.value) return 0;
  const raw = Math.round((subtotal * promo.value) / 100);
  return Math.max(0, Math.min(raw, subtotal));
}
