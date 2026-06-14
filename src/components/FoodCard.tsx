"use client";
import type { FoodItem } from "@/types";
import { Plus, Check, Star, UtensilsCrossed } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { Link } from "@/navigation";
import { cn, fmt } from "@/shared/lib/utils";
import { useState } from "react";
import { useTranslations } from "next-intl";

interface Props {
  food: FoodItem;
  compact?: boolean;
  className?: string;
}

function AddButton({ food, size = "md" }: { food: FoodItem; size?: "sm" | "md" }) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (added) return;
    addItem(food);
    setAdded(true);
    setTimeout(() => setAdded(false), 1200);
  };

  const sm = size === "sm";
  return (
    <button
      onClick={handleAdd}
      className={cn(
        "rounded-full flex items-center justify-center shadow-md btn-press transition-colors",
        added ? "bg-green-500" : "bg-primary",
        sm ? "w-8 h-8" : "w-8 h-8"
      )}
    >
      {added
        ? <Check className={cn("text-white", sm ? "w-3.5 h-3.5" : "w-4 h-4")} strokeWidth={2.5} />
        : <Plus className={cn("text-primary-foreground", sm ? "w-3.5 h-3.5" : "w-4 h-4")} strokeWidth={2.5} />
      }
    </button>
  );
}

export function FoodCard({ food, compact = false, className }: Props) {
  const t = useTranslations("FoodCard");
  if (compact) {
    return (
      <Link href={`/food/${food.id}`} className={cn("block", className)}>
        <div className="flex items-center gap-3 py-4 border-b border-border">
          <div className="flex-1 min-w-0">
            <p className="font-bold text-sm text-foreground">{food.name}</p>
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
            <div className="w-20 h-20 rounded-xl bg-secondary overflow-hidden">
              {food.image ? (
                <img src={food.image} alt={food.name} className="w-full h-full object-cover" />
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
        <div className="h-36 bg-secondary relative">
          {food.image ? (
            <img src={food.image} alt={food.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <UtensilsCrossed className="w-8 h-8 text-muted-foreground" strokeWidth={1.5} />
            </div>
          )}
        </div>
        <div className="p-3">
          <p className="font-bold text-sm text-card-foreground">{food.name}</p>
          <div className="flex items-center justify-between mt-2">
            <p className="font-bold text-sm text-card-foreground">{fmt(food.price)}</p>
            <AddButton food={food} size="sm" />
          </div>
        </div>
      </div>
    </Link>
  );
}
