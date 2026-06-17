"use client";
import { useState, useEffect } from "react";
import { Check, X } from "lucide-react";
import { useTranslations } from "next-intl";
import {
  validatePromo,
  AVAILABLE_PROMOS,
  PROMO_STORAGE_KEY,
  type PromoResult,
} from "@/shared/lib/promo";

interface PromoInputProps {
  /** Current applied promo (lifted to the parent so it can adjust the summary). */
  applied: PromoResult | null;
  /** Called whenever the applied promo changes (valid apply or removal). */
  onChange: (promo: PromoResult | null) => void;
}

export function PromoInput({ applied, onChange }: PromoInputProps) {
  const t = useTranslations("Cart");
  const [value, setValue] = useState(applied?.valid ? applied.code ?? "" : "");
  const [error, setError] = useState(false);

  // Reflect a promo applied/rehydrated by the parent (e.g. on cart re-entry).
  useEffect(() => {
    if (applied?.valid && applied.code) setValue(applied.code);
  }, [applied]);

  const apply = (raw: string) => {
    const result = validatePromo(raw);
    if (result.valid) {
      setError(false);
      setValue(result.code ?? raw.trim().toUpperCase());
      try {
        localStorage.setItem(PROMO_STORAGE_KEY, result.code ?? "");
      } catch {}
      onChange(result);
    } else {
      setError(true);
      onChange(null);
      try {
        localStorage.removeItem(PROMO_STORAGE_KEY);
      } catch {}
    }
  };
  const handleApply = () => apply(value);

  const handleRemove = () => {
    setValue("");
    setError(false);
    try {
      localStorage.removeItem(PROMO_STORAGE_KEY);
    } catch {}
    onChange(null);
  };

  return (
    <div className="mb-5">
      <div className="flex gap-2">
        <input
          type="text"
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            if (error) setError(false);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleApply();
          }}
          placeholder={t("promoPlaceholder")}
          aria-label={t("promoPlaceholder")}
          autoCapitalize="characters"
          autoCorrect="off"
          spellCheck={false}
          className="flex-1 bg-secondary rounded-2xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none uppercase"
        />
        <button
          type="button"
          onClick={handleApply}
          className="px-5 py-3 rounded-2xl border border-border text-sm font-bold text-foreground btn-press"
        >
          {t("apply")}
        </button>
      </div>

      {!applied?.valid && (
        <div className="flex items-center gap-2 mt-2 flex-wrap">
          <span className="text-xs text-muted-foreground">{t("availablePromos")}:</span>
          {AVAILABLE_PROMOS.map((p) => (
            <button
              key={p.code}
              type="button"
              onClick={() => apply(p.code)}
              className="text-xs font-bold px-2.5 py-1 rounded-full border border-dashed border-border text-foreground hover:bg-secondary btn-press"
            >
              {p.code}
              {p.kind === "percent" ? <span className="text-primary"> −{p.value}%</span> : null}
            </button>
          ))}
        </div>
      )}

      {applied?.valid && (
        <div className="flex items-center justify-between gap-2 mt-2 px-3 py-2 rounded-xl bg-success/10">
          <span className="flex items-center gap-1.5 text-sm font-semibold text-success">
            <Check className="w-4 h-4 flex-shrink-0" strokeWidth={2.5} />
            {applied.kind === "freeDelivery"
              ? t("promoAppliedFreeDelivery", { code: applied.code ?? "" })
              : t("promoAppliedPercent", {
                  code: applied.code ?? "",
                  percent: applied.value ?? 0,
                })}
          </span>
          <button
            type="button"
            onClick={handleRemove}
            aria-label={t("promoRemove")}
            className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 btn-press hover:bg-success/15"
          >
            <X className="w-3.5 h-3.5 text-success" strokeWidth={2.5} />
          </button>
        </div>
      )}

      {error && (
        <p className="flex items-center gap-1.5 mt-2 px-3 py-2 rounded-xl bg-destructive/10 text-sm font-semibold text-destructive">
          <X className="w-4 h-4 flex-shrink-0" strokeWidth={2.5} />
          {t("promoInvalid")}
        </p>
      )}
    </div>
  );
}
