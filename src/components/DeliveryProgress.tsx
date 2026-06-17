"use client";
import { Bike, Check } from "lucide-react";
import { useTranslations } from "next-intl";
import { fmt, FREE_DELIVERY_THRESHOLD } from "@/shared/lib/utils";

interface Props {
  /** The (discounted) subtotal that counts toward free delivery. */
  subtotal: number;
}

/**
 * Horizontal progress bar toward free delivery. Fills as the subtotal grows
 * and flips to a success state once FREE_DELIVERY_THRESHOLD is reached.
 * Themed via semantic tokens (primary + success), works in dark mode.
 */
export function DeliveryProgress({ subtotal }: Props) {
  const t = useTranslations("Cart");
  const reached = subtotal >= FREE_DELIVERY_THRESHOLD;
  const remaining = Math.max(0, FREE_DELIVERY_THRESHOLD - subtotal);
  const pct = Math.min(100, Math.round((subtotal / FREE_DELIVERY_THRESHOLD) * 100));

  return (
    <div className="mb-4 p-3.5 rounded-2xl bg-secondary">
      <div className="flex items-center gap-2 mb-2.5">
        <span
          className={`flex items-center justify-center w-6 h-6 rounded-full flex-shrink-0 ${
            reached ? "bg-success text-success-foreground" : "bg-primary text-primary-foreground"
          }`}
        >
          {reached ? <Check className="w-3.5 h-3.5" strokeWidth={3} /> : <Bike className="w-3.5 h-3.5" strokeWidth={2} />}
        </span>
        <p className="text-sm leading-snug">
          {reached ? (
            <span className="font-bold text-foreground">{t("freeDeliveryReached")}</span>
          ) : (
            <span className="text-muted-foreground">
              {t.rich("freeDeliveryProgress", {
                amount: fmt(remaining),
                b: (chunks) => <span className="font-bold text-foreground">{chunks}</span>,
              })}
            </span>
          )}
        </p>
      </div>
      <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${reached ? "bg-success" : "bg-primary"}`}
          style={{ width: `${reached ? 100 : Math.max(pct, 4)}%` }}
        />
      </div>
    </div>
  );
}
