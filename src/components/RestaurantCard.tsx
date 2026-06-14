"use client";
import type { Restaurant } from "@/types";
import { Star, Clock, Bike, Heart, UtensilsCrossed } from "lucide-react";
import { useFavorites } from "@/context/FavoritesContext";
import { Link } from "@/navigation";
import { cn } from "@/shared/lib/utils";
import { useTranslations } from "next-intl";

interface Props {
  restaurant: Restaurant;
  compact?: boolean;
}

export function RestaurantCard({ restaurant, compact = false }: Props) {
  const t = useTranslations("RestaurantCard");
  const { isFavorite, toggleFavorite } = useFavorites();
  const fav = isFavorite(restaurant.id);

  const handleFav = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite(restaurant.id);
  };

  const feeLabel =
    restaurant.deliveryFee === "Free" || restaurant.deliveryFee === "Tekin"
      ? t("free")
      : restaurant.deliveryFee;

  if (compact) {
    return (
      <Link href={`/restaurant/${restaurant.id}`} className="block">
        <div className="flex gap-3 py-4 border-b border-border">
          <div className="w-20 h-20 rounded-2xl bg-secondary flex-shrink-0 overflow-hidden relative">
            {restaurant.image ? (
              <img src={restaurant.image} alt={restaurant.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <UtensilsCrossed className="w-7 h-7 text-muted-foreground" strokeWidth={1.5} />
              </div>
            )}
            {!restaurant.isOpen && (
              <div className="absolute inset-0 bg-background/70 flex items-center justify-center rounded-2xl">
                <span className="text-[10px] font-bold text-muted-foreground">{t("closed")}</span>
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0 py-0.5">
            <div className="flex items-start justify-between gap-2">
              <p className="font-bold text-base text-foreground leading-tight">{restaurant.name}</p>
              <div className="flex items-center gap-0.5 bg-secondary px-2 py-1 rounded-lg flex-shrink-0">
                <Star className="w-3 h-3 fill-foreground text-foreground" strokeWidth={0} />
                <span className="text-xs font-bold text-foreground ml-0.5">{restaurant.rating}</span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5 truncate">{restaurant.cuisine}</p>
            <div className="flex items-center gap-2 mt-1.5 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" strokeWidth={1.75} />
                {restaurant.deliveryTime}
              </span>
              <span>·</span>
              <span className="flex items-center gap-1">
                <Bike className="w-3 h-3" strokeWidth={1.75} />
                {feeLabel}
              </span>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link href={`/restaurant/${restaurant.id}`} className="block mb-3">
      <div className="rounded-2xl overflow-hidden border border-border bg-card">
        <div className="relative h-48 bg-secondary">
          {restaurant.image ? (
            <img src={restaurant.image} alt={restaurant.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <UtensilsCrossed className="w-10 h-10 text-muted-foreground" strokeWidth={1.25} />
            </div>
          )}
          {!restaurant.isOpen && (
            <div className="absolute inset-0 bg-background/60 flex items-center justify-center">
              <span className="text-sm font-bold text-foreground bg-background/90 px-4 py-1.5 rounded-full">{t("closed")}</span>
            </div>
          )}
          <button
            onClick={handleFav}
            className="absolute top-3 right-3 w-9 h-9 rounded-full bg-background shadow flex items-center justify-center"
          >
            <Heart
              className={cn("w-4 h-4", fav ? "fill-red-500 text-red-500" : "text-foreground")}
              strokeWidth={1.75}
            />
          </button>
          {restaurant.tags.length > 0 && (
            <div className="absolute bottom-3 left-3 flex gap-1.5">
              {restaurant.tags.slice(0, 2).map((tag) => (
                <span key={tag} className="text-[10px] font-bold px-2 py-1 rounded-full bg-background/90 text-foreground">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
        <div className="px-3 py-3">
          <div className="flex items-center justify-between gap-2">
            <p className="font-bold text-base text-card-foreground">{restaurant.name}</p>
            <div className="flex items-center gap-0.5 bg-secondary px-2.5 py-1.5 rounded-xl flex-shrink-0">
              <Star className="w-3.5 h-3.5 fill-foreground text-foreground" strokeWidth={0} />
              <span className="text-sm font-bold text-foreground ml-0.5">{restaurant.rating}</span>
            </div>
          </div>
          <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
            <span>{restaurant.cuisine}</span>
            <span>·</span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" strokeWidth={1.75} />
              {restaurant.deliveryTime}
            </span>
            <span>·</span>
            <span className="flex items-center gap-1">
              <Bike className="w-3 h-3" strokeWidth={1.75} />
              {feeLabel}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
