"use client";
import Image from "next/image";
import { FoodCard } from "@/components/FoodCard";
import { getRestaurantById, getFoodsByRestaurant } from "@/mock/data";
import { Star, Clock, Bike, Heart, UtensilsCrossed, ArrowLeft, X, ZoomIn } from "lucide-react";
import { use, useState } from "react";
import { cn, fmt } from "@/shared/lib/utils";
import { useFavorites } from "@/context/FavoritesContext";
import { useRouter } from "@/navigation";
import { useTranslations } from "next-intl";
import { FloatingCartBar } from "@/components/FloatingCartBar";

export default function RestaurantPage({ params }: { params: Promise<{ id: string }> }) {
  const t = useTranslations("RestaurantDetail");
  const { id } = use(params);
  const router = useRouter();
  const restaurant = getRestaurantById(id);
  const foods = getFoodsByRestaurant(id);
  const { isFavorite, toggleFavorite } = useFavorites();
  const [activeTab, setActiveTab] = useState("Barchasi");
  const [imgOpen, setImgOpen] = useState(false);

  if (!restaurant) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-3 px-4 text-center">
        <UtensilsCrossed className="w-12 h-12 text-muted-foreground" strokeWidth={1.25} />
        <p className="font-bold text-foreground">{t("notFound")}</p>
        <button onClick={() => router.back()} className="text-sm text-muted-foreground underline">
          {t("back")}
        </button>
      </div>
    );
  }

  const fav = isFavorite(restaurant.id);
  const tabs = ["Barchasi", ...Array.from(new Set(foods.map((f) => f.category)))];
  const filtered = activeTab === "Barchasi" ? foods : foods.filter((f) => f.category === activeTab);
  const feeLabel = restaurant.deliveryFee === "Tekin" ? t("free") : restaurant.deliveryFee;

  return (
    <div className="min-h-screen bg-background">
      {/* Fullscreen image overlay */}
      {imgOpen && restaurant.image && (
        <div
          className="fixed inset-0 bg-black z-[9999] flex items-center justify-center"
          onClick={() => setImgOpen(false)}
        >
          <img src={restaurant.image} alt={restaurant.name} decoding="async" className="max-w-full max-h-full object-contain" />
          <button
            className="absolute top-5 right-5 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center"
            onClick={() => setImgOpen(false)}
            aria-label={t("back")}
          >
            <X className="w-5 h-5 text-white" strokeWidth={2} />
          </button>
        </div>
      )}

      {/* Hero */}
      <div className="relative h-56 bg-secondary cursor-pointer overflow-hidden" onClick={() => restaurant.image && setImgOpen(true)}>
        {restaurant.image ? (
          <>
            <Image src={restaurant.image} alt={restaurant.name} fill priority sizes="(max-width: 480px) 100vw, 480px" className="object-cover" />
            <div className="absolute bottom-3 right-16 w-8 h-8 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center">
              <ZoomIn className="w-4 h-4 text-white" strokeWidth={1.75} />
            </div>
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <UtensilsCrossed className="w-14 h-14 text-muted-foreground" strokeWidth={1.25} />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />

        <button
          onClick={() => router.back()}
          className="absolute top-4 left-4 w-10 h-10 rounded-full bg-background/90 backdrop-blur-sm shadow flex items-center justify-center btn-press"
          aria-label={t("back")}
        >
          <ArrowLeft className="w-5 h-5 text-foreground" strokeWidth={1.75} />
        </button>

        <button
          onClick={() => toggleFavorite(restaurant.id)}
          className="absolute top-4 right-4 w-10 h-10 rounded-full bg-background/90 backdrop-blur-sm shadow flex items-center justify-center btn-press"
          aria-label={restaurant.name}
          aria-pressed={fav}
        >
          <Heart
            className={cn("w-5 h-5", fav ? "fill-red-500 text-red-500" : "text-foreground")}
            strokeWidth={1.75}
          />
        </button>

        {!restaurant.isOpen && (
          <div className="absolute inset-0 bg-background/60 flex items-center justify-center">
            <span className="text-sm font-bold text-foreground bg-background/90 px-4 py-1.5 rounded-full">{t("closed")}</span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="px-4 pt-4 pb-3 max-w-[480px] mx-auto border-b border-border">
        <div className="flex items-start justify-between gap-3">
          <h1 className="font-black text-2xl text-foreground">{restaurant.name}</h1>
          <span className={cn(
            "px-3 py-1 rounded-full text-xs font-bold flex-shrink-0 mt-1",
            restaurant.isOpen ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
          )}>
            {restaurant.isOpen ? t("open") : t("closed")}
          </span>
        </div>
        <p className="text-sm text-muted-foreground mt-1">{restaurant.cuisine}</p>
        <div className="flex items-center gap-3 mt-2 text-sm text-muted-foreground flex-wrap">
          <span className="flex items-center gap-1 font-semibold text-foreground">
            <Star className="w-3.5 h-3.5 fill-foreground" strokeWidth={0} />
            {restaurant.rating}
            <span className="font-normal text-muted-foreground">({restaurant.reviewCount})</span>
          </span>
          <span>·</span>
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" strokeWidth={1.75} />
            {restaurant.deliveryTime}
          </span>
          <span>·</span>
          <span className="flex items-center gap-1">
            <Bike className="w-3.5 h-3.5" strokeWidth={1.75} />
            {feeLabel}
          </span>
        </div>
        <div className="mt-3 rounded-xl border border-border p-3 flex justify-between items-center">
          <span className="text-sm text-muted-foreground">{t("minOrder")}</span>
          <span className="font-bold text-sm text-foreground">{fmt(restaurant.minOrder)}</span>
        </div>
      </div>

      {/* Category tabs */}
      <div className="sticky top-0 bg-background z-10 border-b border-border max-w-[480px] mx-auto">
        <div className="flex gap-2 px-4 py-3 overflow-x-auto no-scrollbar">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "flex-shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition-all btn-press capitalize",
                activeTab === tab
                  ? "bg-primary text-primary-foreground"
                  : "border border-border text-foreground"
              )}
            >
              {tab === "Barchasi" ? t("all") : tab}
            </button>
          ))}
        </div>
      </div>

      {/* Foods */}
      <div className="px-4 max-w-[480px] mx-auto pt-4 pb-32">
        <div className="grid grid-cols-2 gap-x-3 gap-y-5">
          {filtered.map((food) => (
            <FoodCard key={food.id} food={food} variant="grid" />
          ))}
        </div>
        {filtered.length === 0 && (
          <div className="py-16 text-center">
            <p className="text-muted-foreground text-sm">{t("emptyCategory")}</p>
          </div>
        )}
      </div>

      {/* Cart CTA */}
      <FloatingCartBar label={t("goToCart")} />
    </div>
  );
}
