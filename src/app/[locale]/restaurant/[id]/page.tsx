"use client";
import { FoodCard } from "@/components/FoodCard";
import { getRestaurantById, getFoodsByRestaurant } from "@/mock/data";
import { Star, Clock, Bike, Heart, UtensilsCrossed, ArrowLeft, X, ZoomIn } from "lucide-react";
import { use, useState } from "react";
import { cn, fmt } from "@/shared/lib/utils";
import { useFavorites } from "@/context/FavoritesContext";
import { useCart } from "@/context/CartContext";
import { Link, useRouter } from "@/navigation";
import { useTranslations } from "next-intl";

export default function RestaurantPage({ params }: { params: Promise<{ id: string }> }) {
  const t = useTranslations("RestaurantDetail");
  const { id } = use(params);
  const router = useRouter();
  const restaurant = getRestaurantById(id);
  const foods = getFoodsByRestaurant(id);
  const { isFavorite, toggleFavorite } = useFavorites();
  const { totalItems, total } = useCart();
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
          <img src={restaurant.image} alt={restaurant.name} className="max-w-full max-h-full object-contain" />
          <button
            className="absolute top-5 right-5 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center"
            onClick={() => setImgOpen(false)}
          >
            <X className="w-5 h-5 text-white" strokeWidth={2} />
          </button>
        </div>
      )}

      {/* Hero */}
      <div className="relative h-56 bg-secondary cursor-pointer" onClick={() => restaurant.image && setImgOpen(true)}>
        {restaurant.image ? (
          <>
            <img src={restaurant.image} alt={restaurant.name} className="w-full h-full object-cover" />
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
        >
          <ArrowLeft className="w-5 h-5 text-foreground" strokeWidth={1.75} />
        </button>

        <button
          onClick={() => toggleFavorite(restaurant.id)}
          className="absolute top-4 right-4 w-10 h-10 rounded-full bg-background/90 backdrop-blur-sm shadow flex items-center justify-center btn-press"
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
      <div className="px-4 max-w-[480px] mx-auto pb-32">
        {filtered.map((food) => (
          <FoodCard key={food.id} food={food} compact />
        ))}
        {filtered.length === 0 && (
          <div className="py-16 text-center">
            <p className="text-muted-foreground text-sm">{t("emptyCategory")}</p>
          </div>
        )}
      </div>

      {/* Cart CTA */}
      {totalItems > 0 && (
        <div className="fixed bottom-0 left-0 right-0 p-4 z-20">
          <div className="max-w-[480px] mx-auto">
            <Link
              href="/cart"
              className="flex items-center justify-between w-full px-5 py-4 rounded-full bg-primary text-primary-foreground font-bold shadow-xl btn-press"
            >
              <span className="text-sm font-semibold opacity-80">{t("itemsCount", { count: totalItems })}</span>
              <span>{t("goToCart")}</span>
              <span>{fmt(total)}</span>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
