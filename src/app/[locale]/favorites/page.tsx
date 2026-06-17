"use client";
import { LayoutWrapper } from "@/shared/ui/layout-wrapper";
import { RestaurantCard } from "@/components/RestaurantCard";
import { FoodCard } from "@/components/FoodCard";
import { restaurants, foodItems } from "@/mock/data";
import { useFavorites } from "@/context/FavoritesContext";
import { Heart } from "lucide-react";
import { Link } from "@/navigation";
import { useTranslations } from "next-intl";

export default function FavoritesPage() {
  const t = useTranslations("Favorites");
  const { favorites } = useFavorites();
  const favRestaurants = restaurants.filter((r) => favorites.includes(r.id));
  const favFoods = foodItems.filter((f) => favorites.includes(f.id));
  const isEmpty = favRestaurants.length === 0 && favFoods.length === 0;

  return (
    <LayoutWrapper>
      <div className="px-4 max-w-[480px] mx-auto pt-3 pb-4">
        {isEmpty ? (
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
          <div className="space-y-5">
            {favFoods.length > 0 && (
              <div>
                <h2 className="font-bold text-base text-foreground mb-1">{t("dishes")}</h2>
                <p className="text-xs text-muted-foreground mb-2">{t("dishesCount", { count: favFoods.length })}</p>
                {favFoods.map((f) => (
                  <FoodCard key={f.id} food={f} compact />
                ))}
              </div>
            )}
            {favRestaurants.length > 0 && (
              <div>
                <h2 className="font-bold text-base text-foreground mb-1">{t("restaurants")}</h2>
                <p className="text-xs text-muted-foreground mb-2">{t("restaurantsCount", { count: favRestaurants.length })}</p>
                {favRestaurants.map((r) => (
                  <RestaurantCard key={r.id} restaurant={r} compact />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </LayoutWrapper>
  );
}
