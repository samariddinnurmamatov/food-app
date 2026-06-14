"use client";
import { LayoutWrapper } from "@/shared/ui/layout-wrapper";
import { RestaurantCard } from "@/components/RestaurantCard";
import { FoodCard } from "@/components/FoodCard";
import { categories, restaurants, foodItems } from "@/mock/data";
import { Search, X } from "lucide-react";
import { useState } from "react";
import { useTranslations } from "next-intl";

export default function CategoriesPage() {
  const t = useTranslations("Search");
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const filteredRestaurants = restaurants.filter((r) => {
    const matchCat = !activeCategory || r.categoryId === activeCategory;
    const matchQ = !query || r.name.toLowerCase().includes(query.toLowerCase()) || r.cuisine.toLowerCase().includes(query.toLowerCase());
    return matchCat && matchQ;
  });

  const filteredFoods = foodItems.filter((f) =>
    query ? f.name.toLowerCase().includes(query.toLowerCase()) || f.description.toLowerCase().includes(query.toLowerCase()) : false
  );

  return (
    <LayoutWrapper>
      <div className="px-4 max-w-[480px] mx-auto pt-3 pb-4 space-y-5">
        {/* Search input */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" strokeWidth={1.75} />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("placeholder")}
            className="w-full bg-secondary rounded-2xl pl-11 pr-10 py-3.5 text-sm text-foreground placeholder:text-muted-foreground outline-none"
          />
          {query && (
            <button onClick={() => setQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-muted flex items-center justify-center">
              <X className="w-3.5 h-3.5 text-muted-foreground" strokeWidth={2} />
            </button>
          )}
        </div>

        {/* Categories grid */}
        {!query && (
          <div>
            <h2 className="font-bold text-base text-foreground mb-3">{t("categories")}</h2>
            <div className="grid grid-cols-4 gap-3">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(activeCategory === cat.id ? null : cat.id)}
                  className="flex flex-col items-center gap-2"
                >
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all ${activeCategory === cat.id ? "bg-primary" : "bg-secondary"}`}>
                    <span className="text-2xl">{cat.emoji}</span>
                  </div>
                  <span className={`text-xs font-semibold text-center leading-tight ${activeCategory === cat.id ? "text-foreground" : "text-muted-foreground"}`}>
                    {cat.name}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Results */}
        {query ? (
          <div className="space-y-4">
            {filteredFoods.length > 0 && (
              <div>
                <p className="text-xs text-muted-foreground mb-2">{t("dishesCount", { count: filteredFoods.length })}</p>
                {filteredFoods.map((f) => <FoodCard key={f.id} food={f} compact />)}
              </div>
            )}
            {filteredRestaurants.length > 0 && (
              <div>
                <p className="text-xs text-muted-foreground mb-2">{t("restaurantsCount", { count: filteredRestaurants.length })}</p>
                {filteredRestaurants.map((r) => <RestaurantCard key={r.id} restaurant={r} compact />)}
              </div>
            )}
            {filteredFoods.length === 0 && filteredRestaurants.length === 0 && (
              <div className="py-16 text-center">
                <p className="font-bold text-foreground">{t("nothingFound")}</p>
                <p className="text-sm text-muted-foreground mt-1">{t("noResultsFor", { query })}</p>
              </div>
            )}
          </div>
        ) : (
          <div>
            <p className="text-xs text-muted-foreground mb-2">
              {activeCategory ? t("restaurantsCount", { count: filteredRestaurants.length }) : t("allRestaurants")}
            </p>
            {filteredRestaurants.map((r) => <RestaurantCard key={r.id} restaurant={r} compact />)}
          </div>
        )}
      </div>
    </LayoutWrapper>
  );
}
