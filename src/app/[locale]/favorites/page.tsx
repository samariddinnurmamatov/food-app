"use client";
import { LayoutWrapper } from "@/shared/ui/layout-wrapper";
import { RestaurantCard } from "@/components/RestaurantCard";
import { restaurants } from "@/mock/data";
import { useFavorites } from "@/context/FavoritesContext";
import { Heart } from "lucide-react";
import { Link } from "@/navigation";
import { useTranslations } from "next-intl";

export default function FavoritesPage() {
  const t = useTranslations("Favorites");
  const { favorites } = useFavorites();
  const favRestaurants = restaurants.filter((r) => favorites.includes(r.id));

  return (
    <LayoutWrapper>
      <div className="px-4 max-w-[480px] mx-auto pt-3 pb-4">
        {favRestaurants.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-5 text-center">
            <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center">
              <Heart className="w-9 h-9 text-muted-foreground" strokeWidth={1.5} />
            </div>
            <div>
              <p className="font-bold text-lg text-foreground">{t("emptyTitle")}</p>
              <p className="text-sm text-muted-foreground mt-1.5 max-w-[220px] mx-auto">
                {t("emptyHint")}
              </p>
            </div>
            <Link href="/restaurants" className="px-8 py-3.5 rounded-full bg-primary text-primary-foreground font-bold text-sm btn-press">
              {t("viewRestaurants")}
            </Link>
          </div>
        ) : (
          <div>
            <p className="text-xs text-muted-foreground mb-3">{t("restaurantsCount", { count: favRestaurants.length })}</p>
            {favRestaurants.map((r) => (
              <RestaurantCard key={r.id} restaurant={r} compact />
            ))}
          </div>
        )}
      </div>
    </LayoutWrapper>
  );
}
