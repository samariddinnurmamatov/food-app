"use client";
import { memo } from "react";
import Image from "next/image";
import type { FoodItem } from "@/types";
import { Plus, Minus, Star, UtensilsCrossed } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { Link } from "@/navigation";
import { cn, fmt } from "@/shared/lib/utils";
import { useTranslations } from "next-intl";

interface Props {
  food: FoodItem;
  compact?: boolean;
  /** "grid" renders a premium image-forward card for 2-column menu grids. */
  variant?: "grid";
  className?: string;
}

function AddButton({ food }: { food: FoodItem; size?: "sm" | "md" }) {
  const t = useTranslations("FoodCard");
  const { items, addItem, updateQuantity } = useCart();
  const qty = items.find((i) => i.food.id === food.id)?.quantity ?? 0;
  const stop = (e: React.MouseEvent) => { e.preventDefault(); e.stopPropagation(); };

  if (food.isAvailable === false) {
    return (
      <button
        disabled
        onClick={stop}
        aria-label={t("outOfStock")}
        className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center shadow-md cursor-not-allowed"
      >
        <Plus className="w-4 h-4 text-muted-foreground" strokeWidth={2.5} />
      </button>
    );
  }

  if (qty === 0) {
    return (
      <button
        onClick={(e) => { stop(e); addItem(food); }}
        aria-label={t("increaseQty", { name: food.name })}
        className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shadow-md btn-press"
      >
        <Plus className="w-4 h-4 text-primary-foreground" strokeWidth={2.5} />
      </button>
    );
  }

  return (
    <div onClick={stop} className="flex items-center gap-0.5 bg-primary rounded-full p-1 shadow-md">
      <button
        onClick={(e) => { stop(e); updateQuantity(food.id, qty - 1); }}
        aria-label={t("decreaseQty", { name: food.name })}
        className="w-6 h-6 rounded-full bg-white/25 flex items-center justify-center btn-press"
      >
        <Minus className="w-3.5 h-3.5 text-primary-foreground" strokeWidth={2.75} />
      </button>
      <span className="min-w-[20px] text-center font-black text-sm text-primary-foreground tabular-nums">{qty}</span>
      <button
        onClick={(e) => { stop(e); updateQuantity(food.id, qty + 1); }}
        aria-label={t("increaseQty", { name: food.name })}
        className="w-6 h-6 rounded-full bg-white/25 flex items-center justify-center btn-press"
      >
        <Plus className="w-3.5 h-3.5 text-primary-foreground" strokeWidth={2.75} />
      </button>
    </div>
  );
}

// Yandex/Wolt-style stepper for the grid menu card: a white circular "+" when
// empty, and a FULL-WIDTH white pill ( −  qty  + ) overlapping the photo bottom
// once the item is in the cart. `bg-background` keeps it theme-correct (white in
// light, dark surface in dark).
function GridStepper({ food }: { food: FoodItem }) {
  const t = useTranslations("FoodCard");
  const { items, addItem, updateQuantity } = useCart();
  const qty = items.find((i) => i.food.id === food.id)?.quantity ?? 0;
  const stop = (e: React.MouseEvent) => { e.preventDefault(); e.stopPropagation(); };

  if (food.isAvailable === false) {
    return (
      <button
        disabled
        onClick={stop}
        aria-label={t("outOfStock")}
        className="absolute -bottom-3 right-2 w-10 h-10 rounded-full bg-background border border-border flex items-center justify-center shadow-md cursor-not-allowed"
      >
        <Plus className="w-5 h-5 text-muted-foreground" strokeWidth={2.5} />
      </button>
    );
  }

  if (qty === 0) {
    return (
      <button
        onClick={(e) => { stop(e); addItem(food); }}
        aria-label={t("increaseQty", { name: food.name })}
        className="absolute -bottom-3 right-2 w-10 h-10 rounded-full bg-background border border-border flex items-center justify-center shadow-md btn-press"
      >
        <Plus className="w-5 h-5 text-primary" strokeWidth={2.75} />
      </button>
    );
  }

  return (
    <div
      onClick={stop}
      className="absolute -bottom-3 left-2 right-2 h-10 bg-background border border-border rounded-full shadow-md flex items-center justify-between px-1"
    >
      <button
        onClick={(e) => { stop(e); updateQuantity(food.id, qty - 1); }}
        aria-label={t("decreaseQty", { name: food.name })}
        className="w-8 h-8 rounded-full flex items-center justify-center btn-press active:bg-secondary"
      >
        <Minus className="w-4 h-4 text-primary" strokeWidth={2.75} />
      </button>
      <span className="font-black text-base text-foreground tabular-nums">{qty}</span>
      <button
        onClick={(e) => { stop(e); updateQuantity(food.id, qty + 1); }}
        aria-label={t("increaseQty", { name: food.name })}
        className="w-8 h-8 rounded-full flex items-center justify-center btn-press active:bg-secondary"
      >
        <Plus className="w-4 h-4 text-primary" strokeWidth={2.75} />
      </button>
    </div>
  );
}

export const FoodCard = memo(function FoodCard({ food, compact = false, variant, className }: Props) {
  const t = useTranslations("FoodCard");
  const outOfStock = food.isAvailable === false;

  if (variant === "grid") {
    return (
      <Link href={`/food/${food.id}`} className={cn("block", className)}>
        <div className="rounded-2xl bg-card">
          {/* Photo + inline stepper */}
          <div className="relative">
            <div className={cn("relative h-32 sm:h-36 rounded-2xl bg-secondary overflow-hidden", outOfStock && "opacity-50")}>
              {food.image ? (
                <Image src={food.image} alt={food.name} fill quality={60} sizes="(max-width: 480px) 50vw, 240px" className="object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <UtensilsCrossed className="w-8 h-8 text-muted-foreground" strokeWidth={1.5} />
                </div>
              )}
              {outOfStock && (
                <span className="absolute top-2 left-2 text-[10px] font-bold px-2 py-1 rounded-full bg-background/90 text-foreground shadow-sm">{t("outOfStock")}</span>
              )}
            </div>
            {/* Stepper: white "+" when empty, full-width white pill when in cart */}
            <GridStepper food={food} />
          </div>

          {/* Details */}
          <div className="pt-5 px-0.5">
            <p className={cn("font-black text-base text-card-foreground tabular-nums", outOfStock && "opacity-50")}>{fmt(food.price)}</p>
            <p className={cn("font-semibold text-sm text-card-foreground mt-0.5 line-clamp-2 leading-snug", outOfStock && "opacity-50")}>{food.name}</p>
            <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
              {food.weight && <span>{food.weight}</span>}
              {food.weight && food.rating != null && <span className="opacity-50">·</span>}
              {food.rating != null && (
                <span className="flex items-center gap-0.5">
                  <Star className="w-3 h-3 fill-muted-foreground" strokeWidth={0} />
                  {food.rating}
                </span>
              )}
            </div>
          </div>
        </div>
      </Link>
    );
  }

  if (compact) {
    return (
      <Link href={`/food/${food.id}`} className={cn("block", className)}>
        <div className="flex items-center gap-3 py-4 border-b border-border">
          <div className={cn("flex-1 min-w-0", outOfStock && "opacity-50")}>
            <div className="flex items-center gap-2">
              <p className="font-bold text-sm text-foreground">{food.name}</p>
              {outOfStock && (
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-secondary text-muted-foreground">{t("outOfStock")}</span>
              )}
            </div>
            {food.isPopular && (
              <span className="text-[10px] font-bold text-muted-foreground">⭐ {t("popular")}</span>
            )}
            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{food.description}</p>
            <div className="flex items-center gap-2 mt-1.5">
              <p className="font-bold text-sm text-foreground">{fmt(food.price)}</p>
              {food.rating && (
                <span className="flex items-center gap-0.5 text-xs text-muted-foreground">
                  <Star className="w-3 h-3 fill-muted-foreground" strokeWidth={0} />
                  {food.rating}
                </span>
              )}
            </div>
          </div>
          <div className="relative flex-shrink-0">
            <div className={cn("relative w-20 h-20 rounded-xl bg-secondary overflow-hidden", outOfStock && "opacity-50")}>
              {food.image ? (
                <Image src={food.image} alt={food.name} fill sizes="80px" className="object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <UtensilsCrossed className="w-7 h-7 text-muted-foreground" strokeWidth={1.5} />
                </div>
              )}
            </div>
            <div className="absolute -bottom-2 -right-2">
              <AddButton food={food} size="sm" />
            </div>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link href={`/food/${food.id}`} className={cn("block", className)}>
      <div className="rounded-2xl overflow-hidden border border-border bg-card">
        <div className="h-36 bg-secondary relative overflow-hidden">
          {food.image ? (
            <Image src={food.image} alt={food.name} fill quality={60} sizes="(max-width: 480px) 50vw, 240px" className={cn("object-cover", outOfStock && "opacity-50")} />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <UtensilsCrossed className="w-8 h-8 text-muted-foreground" strokeWidth={1.5} />
            </div>
          )}
          {outOfStock && (
            <span className="absolute top-2 left-2 text-[10px] font-bold px-2 py-1 rounded-full bg-background/90 text-foreground shadow-sm">{t("outOfStock")}</span>
          )}
        </div>
        <div className="p-3">
          <p className={cn("font-bold text-sm text-card-foreground", outOfStock && "opacity-50")}>{food.name}</p>
          <div className="flex items-center justify-between mt-2">
            <p className={cn("font-bold text-sm text-card-foreground", outOfStock && "opacity-50")}>{fmt(food.price)}</p>
            <AddButton food={food} size="sm" />
          </div>
        </div>
      </div>
    </Link>
  );
});
