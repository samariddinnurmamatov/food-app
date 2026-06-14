"use client";
import { LayoutWrapper } from "@/shared/ui/layout-wrapper";
import { RestaurantCard } from "@/components/RestaurantCard";
import { restaurants } from "@/mock/data";
import { useState } from "react";
import { cn } from "@/shared/lib/utils";
import { useTranslations } from "next-intl";

type Filter = "all" | "open" | "free" | "top";

const filterKeys: Record<Filter, string> = {
  all: "filterAll",
  open: "filterOpen",
  free: "filterFree",
  top: "filterTop",
};

export default function RestaurantsPage() {
  const t = useTranslations("Restaurants");
  const [filter, setFilter] = useState<Filter>("all");
  const [sort, setSort] = useState<"rating" | "time">("rating");

  const filtered = restaurants
    .filter((r) => {
      if (filter === "open") return r.isOpen;
      if (filter === "free") return r.deliveryFee === "Tekin";
      if (filter === "top") return r.rating >= 4.7;
      return true;
    })
    .sort((a, b) => {
      if (sort === "rating") return b.rating - a.rating;
      return a.deliveryTime.localeCompare(b.deliveryTime);
    });

  return (
    <LayoutWrapper showFooter={false}>
      <div className="px-4 max-w-[480px] mx-auto pt-3 pb-4">
        {/* Filter chips */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-3 -mx-4 px-4">
          {(Object.keys(filterKeys) as Filter[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "flex-shrink-0 px-4 py-2 rounded-full text-sm font-semibold border transition-all btn-press",
                filter === f ? "bg-primary text-primary-foreground border-primary" : "border-border text-foreground"
              )}
            >
              {t(filterKeys[f])}
            </button>
          ))}
        </div>

        {/* Sort */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setSort("rating")}
            className={cn("px-3 py-1.5 rounded-xl text-xs font-semibold transition-all", sort === "rating" ? "bg-secondary text-foreground" : "text-muted-foreground")}
          >
            {t("sortByRating")}
          </button>
          <button
            onClick={() => setSort("time")}
            className={cn("px-3 py-1.5 rounded-xl text-xs font-semibold transition-all", sort === "time" ? "bg-secondary text-foreground" : "text-muted-foreground")}
          >
            {t("sortByTime")}
          </button>
        </div>

        <p className="text-xs text-muted-foreground mb-3">{t("restaurantsCount", { count: filtered.length })}</p>

        {filtered.map((r) => (
          <RestaurantCard key={r.id} restaurant={r} compact />
        ))}
      </div>
    </LayoutWrapper>
  );
}
