"use client";
import { LayoutWrapper } from "@/shared/ui/layout-wrapper";
import { useCart } from "@/context/CartContext";
import { Plus, Minus, Trash2, ShoppingBag, UtensilsCrossed } from "lucide-react";
import { Link } from "@/navigation";
import { fmt, sized, computeDeliveryFee } from "@/shared/lib/utils";
import { useTranslations } from "next-intl";
import { useState, useEffect } from "react";
import { PromoInput } from "@/components/PromoInput";
import { DeliveryProgress } from "@/components/DeliveryProgress";
import {
  computePromoDiscount,
  validatePromo,
  PROMO_STORAGE_KEY,
  type PromoResult,
} from "@/shared/lib/promo";

export default function CartPage() {
  const t = useTranslations("Cart");
  const { items, total, totalItems, updateQuantity, removeItem } = useCart();
  const [promo, setPromo] = useState<PromoResult | null>(null);

  // Re-hydrate the applied promo on mount so it persists across navigation.
  useEffect(() => {
    try {
      const code = localStorage.getItem(PROMO_STORAGE_KEY);
      if (code) {
        const result = validatePromo(code);
        if (result.valid) setPromo(result);
      }
    } catch {}
  }, []);

  const discount = promo ? computePromoDiscount(promo, total) : 0;
  const discountedSubtotal = total - discount;
  const freeDelivery = promo?.valid && promo.kind === "freeDelivery";
  const deliveryFee = freeDelivery ? 0 : computeDeliveryFee(discountedSubtotal);
  const grandTotal = discountedSubtotal + deliveryFee;

  if (items.length === 0) {
    return (
      <LayoutWrapper>
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-5 px-4 text-center">
          <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center">
            <ShoppingBag className="w-9 h-9 text-muted-foreground" strokeWidth={1.5} />
          </div>
          <div>
            <p className="font-bold text-lg text-foreground">{t("emptyTitle")}</p>
            <p className="text-sm text-muted-foreground mt-1.5">{t("emptySubtitle")}</p>
          </div>
          <Link href="/" className="px-8 py-3.5 rounded-full bg-primary text-primary-foreground font-bold text-sm btn-press">
            {t("home")}
          </Link>
        </div>
      </LayoutWrapper>
    );
  }

  return (
    <LayoutWrapper>
      <div className="px-4 max-w-[480px] mx-auto pt-3 pb-6">
        {/* Delivery progress toward free delivery */}
        <DeliveryProgress subtotal={discountedSubtotal} />

        <p className="text-xs text-muted-foreground mb-3">{t("itemsCount", { count: totalItems })}</p>

        {/* Items */}
        <div className="space-y-3 mb-6">
          {items.map(({ food, quantity }) => (
            <div key={food.id} className="flex gap-3 p-3 rounded-2xl border border-border bg-card">
              <div className="w-16 h-16 rounded-xl bg-secondary overflow-hidden flex-shrink-0">
                {food.image ? (
                  <img src={sized(food.image, 128)} alt={food.name} width={64} height={64} loading="lazy" decoding="async" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <UtensilsCrossed className="w-6 h-6 text-muted-foreground" strokeWidth={1.5} />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm text-card-foreground">{food.name}</p>
                <p className="font-bold text-sm text-card-foreground mt-1">
                  {fmt(food.price * quantity)}
                </p>
                <div className="flex items-center gap-3 mt-2">
                  <button
                    onClick={() => updateQuantity(food.id, quantity - 1)}
                    aria-label={t("decreaseQty", { name: food.name })}
                    className="w-7 h-7 rounded-full bg-secondary flex items-center justify-center btn-press"
                  >
                    <Minus className="w-3.5 h-3.5 text-foreground" strokeWidth={2} />
                  </button>
                  <span className="font-bold text-sm text-foreground w-4 text-center">{quantity}</span>
                  <button
                    onClick={() => updateQuantity(food.id, quantity + 1)}
                    aria-label={t("increaseQty", { name: food.name })}
                    className="w-7 h-7 rounded-full bg-primary flex items-center justify-center btn-press"
                  >
                    <Plus className="w-3.5 h-3.5 text-primary-foreground" strokeWidth={2} />
                  </button>
                </div>
              </div>
              <button
                onClick={() => removeItem(food.id)}
                aria-label={t("removeItem", { name: food.name })}
                className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center self-start flex-shrink-0 btn-press"
              >
                <Trash2 className="w-3.5 h-3.5 text-muted-foreground" strokeWidth={1.75} />
              </button>
            </div>
          ))}
        </div>

        {/* Promo code */}
        <PromoInput applied={promo} onChange={setPromo} />

        {/* Summary */}
        <div className="rounded-2xl border border-border p-4 space-y-3 mb-5">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">{t("items")}</span>
            <span className="font-semibold text-foreground">{fmt(total)}</span>
          </div>
          {discount > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{t("discount")}</span>
              <span className="font-semibold text-success">−{fmt(discount)}</span>
            </div>
          )}
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">{t("delivery")}</span>
            <span className="font-semibold text-foreground">
              {deliveryFee === 0 ? t("free") : fmt(deliveryFee)}
            </span>
          </div>
          <div className="pt-3 border-t border-border flex justify-between text-foreground">
            <span className="font-bold">{t("total")}</span>
            <span className="font-black text-lg">{fmt(grandTotal)}</span>
          </div>
        </div>

        <Link
          href="/checkout"
          className="block w-full py-4 rounded-full bg-primary text-primary-foreground font-bold text-center text-base btn-press"
        >
          {t("checkout")}
        </Link>
      </div>
    </LayoutWrapper>
  );
}
