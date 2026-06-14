"use client";
import { LayoutWrapper } from "@/shared/ui/layout-wrapper";
import { categories, restaurants, foodItems } from "@/mock/data";
import {
  Search, SlidersHorizontal, Star, Plus, Minus, Heart, ShoppingBag,
  Clock, Bike, ChevronRight, LayoutGrid,
  UtensilsCrossed, Beef, PieChart, Gift, Coffee, Salad,
  Pizza, Sandwich, Fish,
  type LucideIcon,
} from "lucide-react";
import { Link } from "@/navigation";
import { useTranslations } from "next-intl";
import type React from "react";
import { useState, useEffect, useRef } from "react";
import { useCart } from "@/context/CartContext";
import { useFavorites } from "@/context/FavoritesContext";
import { cn, fmt } from "@/shared/lib/utils";
import type { FoodItem, Restaurant } from "@/types";

const iconMap: Record<string, LucideIcon> = {
  UtensilsCrossed, Beef, PieChart, Gift, Coffee, Salad, Pizza, Sandwich, Fish,
};

const promoSlides = [
  {
    tagKey: "promo1Tag",
    discount: "–50%",
    descKey: "promo1Desc",
    Icon: UtensilsCrossed,
    href: "/categories",
    btnKey: "promo1Btn",
  },
  {
    tagKey: "promo2Tag",
    discount: "–20%",
    descKey: "promo2Desc",
    Icon: Beef,
    href: "/restaurant/evos",
    btnKey: "promo2Btn",
  },
  {
    tagKey: "promo3Tag",
    discountKey: "promo3Discount",
    descKey: "promo3Desc",
    Icon: Bike,
    href: "/categories",
    btnKey: "promo3Btn",
  },
] satisfies { tagKey: string; discount?: string; discountKey?: string; descKey: string; Icon: LucideIcon; href: string; btnKey: string }[];

function HomeFoodCard({ food }: { food: FoodItem }) {
  const t = useTranslations("Home");
  const { items, addItem, updateQuantity } = useCart();
  const qty = items.find((i) => i.food.id === food.id)?.quantity ?? 0;
  const displayRating = food.rating ?? 4.5;

  const stop = (e: React.MouseEvent) => { e.preventDefault(); e.stopPropagation(); };

  return (
    <Link href={`/food/${food.id}`} className="block">
      <div className="rounded-2xl overflow-hidden border border-border bg-card">
        <div className="relative h-36 bg-secondary">
          {food.image ? (
            <img src={food.image} alt={food.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <UtensilsCrossed className="w-8 h-8 text-muted-foreground" strokeWidth={1.25} />
            </div>
          )}
          <div className="absolute top-2 left-2 flex items-center gap-0.5 bg-background/90 backdrop-blur-sm rounded-lg px-2 py-1">
            <Star className="w-3 h-3 fill-foreground text-foreground" strokeWidth={0} />
            <span className="text-xs font-bold text-foreground">{displayRating}</span>
          </div>
        </div>
        <div className="p-3 space-y-2">
          <div>
            <p className="font-bold text-sm text-card-foreground leading-tight truncate">{food.name}</p>
            <p className="text-xs text-muted-foreground mt-0.5 truncate">
              {restaurants.find((r) => r.id === food.restaurantId)?.name ?? food.category}
            </p>
          </div>
          <p className="font-black text-sm text-card-foreground">{fmt(food.price)}</p>

          {qty === 0 ? (
            <button
              onClick={(e) => { stop(e); addItem(food); }}
              className="w-full h-9 rounded-xl bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center gap-1 btn-press"
            >
              <Plus className="w-4 h-4" strokeWidth={2.5} />
              {t("addToCart")}
            </button>
          ) : (
            <div className="w-full h-9 flex items-center justify-between bg-secondary rounded-xl px-1">
              <button
                onClick={(e) => { stop(e); updateQuantity(food.id, qty - 1); }}
                aria-label="−"
                className="w-7 h-7 rounded-lg bg-background flex items-center justify-center btn-press"
              >
                <Minus className="w-4 h-4 text-foreground" strokeWidth={2.5} />
              </button>
              <span className="font-black text-sm text-foreground tabular-nums">{qty}</span>
              <button
                onClick={(e) => { stop(e); updateQuantity(food.id, qty + 1); }}
                aria-label="+"
                className="w-7 h-7 rounded-lg bg-primary text-primary-foreground flex items-center justify-center btn-press"
              >
                <Plus className="w-4 h-4" strokeWidth={2.5} />
              </button>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}

function HomeRestaurantCard({ restaurant }: { restaurant: Restaurant }) {
  const t = useTranslations("Home");
  const { isFavorite, toggleFavorite } = useFavorites();
  const fav = isFavorite(restaurant.id);
  const CuisineIcon = iconMap[categories.find((c) => c.id === restaurant.categoryId)?.icon ?? ""] ?? UtensilsCrossed;
  const feeLabel = restaurant.deliveryFee === "Tekin" ? t("free") : restaurant.deliveryFee;

  return (
    <Link href={`/restaurant/${restaurant.id}`} className="block mb-4">
      <div className="rounded-2xl overflow-hidden border border-border bg-card">
        <div className="relative h-44 bg-secondary">
          {restaurant.image ? (
            <img src={restaurant.image} alt={restaurant.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <UtensilsCrossed className="w-10 h-10 text-muted-foreground" strokeWidth={1.25} />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent" />

          <div className="absolute top-3 left-3 flex gap-2 flex-wrap">
            {restaurant.tags.map((tag) => (
              <span key={tag} className="flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-background/95 text-foreground shadow-sm">
                {tag.startsWith("-") && <span className="text-xs">%</span>}
                {tag}
                {tag === "Bepul yetkazish" && <Bike className="w-3 h-3 ml-0.5" strokeWidth={1.75} />}
              </span>
            ))}
          </div>

          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleFavorite(restaurant.id); }}
            className="absolute top-3 right-3 w-9 h-9 rounded-full bg-background shadow flex items-center justify-center btn-press"
          >
            <Heart
              className={cn("w-4 h-4", fav ? "fill-red-500 text-red-500" : "text-foreground")}
              strokeWidth={1.75}
            />
          </button>

          <div className="absolute bottom-3 left-3 w-10 h-10 rounded-full bg-background shadow flex items-center justify-center">
            <CuisineIcon className="w-5 h-5 text-foreground" strokeWidth={1.75} />
          </div>
        </div>

        <div className="px-4 py-3">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className="font-black text-xl text-card-foreground leading-tight">{restaurant.name}</h3>
            <div className="flex items-center gap-1 bg-secondary px-2.5 py-1.5 rounded-xl flex-shrink-0">
              <Star className="w-3.5 h-3.5 fill-foreground text-foreground" strokeWidth={0} />
              <span className="font-black text-sm text-foreground">{restaurant.rating}</span>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">{restaurant.cuisine}</p>
          <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" strokeWidth={1.75} />
              {restaurant.deliveryTime}
            </span>
            <span>·</span>
            <span className="flex items-center gap-1">
              <Bike className="w-3 h-3" strokeWidth={1.75} />
              {feeLabel}
            </span>
            <span>·</span>
            <span>{t("reviewsCount", { count: restaurant.reviewCount })}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

// Floating "do you want to order?" bar — appears once the cart has items
function HomeCartBar() {
  const t = useTranslations("Home");
  const { totalItems, total } = useCart();
  if (totalItems === 0) return null;
  return (
    <div className="fixed bottom-[84px] left-0 right-0 z-30 px-4 pointer-events-none">
      <div className="max-w-[480px] mx-auto pointer-events-auto">
        <Link
          href="/cart"
          className="flex items-center justify-between gap-3 bg-primary text-primary-foreground rounded-2xl pl-3 pr-4 py-2.5 shadow-lg shadow-primary/30 btn-press"
        >
          <div className="flex items-center gap-2.5">
            <span className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-white/20">
              <ShoppingBag className="w-4 h-4" strokeWidth={2} />
              <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full bg-white text-primary text-[9px] font-black flex items-center justify-center leading-none">
                {totalItems > 9 ? "9+" : totalItems}
              </span>
            </span>
            <div className="leading-tight text-left">
              <p className="text-[11px] text-primary-foreground/75 font-medium">{t("cartItems", { count: totalItems })}</p>
              <p className="font-black text-sm">{fmt(total)}</p>
            </div>
          </div>
          <span className="flex items-center gap-1 font-bold text-sm">
            {t("order")}
            <ChevronRight className="w-4 h-4" strokeWidth={2.25} />
          </span>
        </Link>
      </div>
    </div>
  );
}

export default function HomePage() {
  const t = useTranslations("Home");
  const { totalItems } = useCart();
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [promoDot, setPromoDot] = useState(0);
  const touchXRef = useRef<number | null>(null);

  // Drag-to-scroll for the category slider (mouse; touch uses native scroll)
  const catScrollRef = useRef<HTMLDivElement>(null);
  const catDrag = useRef({ down: false, startX: 0, startScroll: 0, moved: false });

  const onCatMouseDown = (e: React.MouseEvent) => {
    const el = catScrollRef.current;
    if (!el) return;
    catDrag.current = { down: true, startX: e.pageX, startScroll: el.scrollLeft, moved: false };
  };
  const onCatMouseMove = (e: React.MouseEvent) => {
    const el = catScrollRef.current;
    if (!el || !catDrag.current.down) return;
    e.preventDefault();
    const dx = e.pageX - catDrag.current.startX;
    if (Math.abs(dx) > 4) catDrag.current.moved = true;
    el.scrollLeft = catDrag.current.startScroll - dx;
  };
  const endCatDrag = () => { catDrag.current.down = false; };
  const selectCategory = (id: string | null) => {
    if (catDrag.current.moved) return; // ignore click that ended a drag
    setActiveCategory(id);
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setPromoDot((d) => (d + 1) % promoSlides.length);
    }, 3500);
    return () => clearInterval(timer);
  }, []);

  const popularFoods = foodItems.filter((f) => f.isPopular);
  const openRestaurants = restaurants.filter((r) => r.isOpen);

  const filteredFoods = activeCategory
    ? popularFoods.filter((f) => {
        const rest = restaurants.find((r) => r.id === f.restaurantId);
        return rest?.categoryId === activeCategory;
      })
    : popularFoods.slice(0, 6);

  const filteredRestaurants = activeCategory
    ? openRestaurants.filter((r) => r.categoryId === activeCategory)
    : openRestaurants;

  return (
    <LayoutWrapper>
      <div className={cn("px-4 max-w-[480px] mx-auto pt-4 space-y-6", totalItems > 0 ? "pb-28" : "pb-4")}>

        {/* ── Search + Filter ── */}
        <div className="flex items-center gap-3">
          <Link
            href="/categories"
            className="flex-1 flex items-center gap-3 bg-secondary rounded-2xl px-4 py-3.5"
          >
            <Search className="w-4 h-4 text-muted-foreground flex-shrink-0" strokeWidth={1.75} />
            <span className="text-sm text-muted-foreground">{t("searchPlaceholder")}</span>
          </Link>
          <Link
            href="/categories"
            className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center flex-shrink-0 btn-press"
          >
            <SlidersHorizontal className="w-5 h-5 text-primary-foreground" strokeWidth={1.75} />
          </Link>
        </div>

        {/* ── Promo slider ── */}
        {(() => {
          const slide = promoSlides[promoDot];
          const { Icon } = slide;
          return (
            <div
              className="relative rounded-2xl bg-foreground px-5 py-5 overflow-hidden select-none"
              onTouchStart={(e) => { touchXRef.current = e.touches[0].clientX; }}
              onTouchEnd={(e) => {
                if (touchXRef.current === null) return;
                const diff = touchXRef.current - e.changedTouches[0].clientX;
                if (Math.abs(diff) > 40)
                  setPromoDot((d) => diff > 0 ? (d + 1) % 3 : (d + 2) % 3);
                touchXRef.current = null;
              }}
            >
              <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-10 text-background">
                <Icon className="w-28 h-28" strokeWidth={0.75} />
              </div>
              <p key={`tag-${promoDot}`} className="text-[10px] font-bold text-background/50 uppercase tracking-[0.15em]">
                {t(slide.tagKey)}
              </p>
              <p key={`disc-${promoDot}`} className="text-5xl font-black text-background leading-none mt-1">
                {"discountKey" in slide && slide.discountKey ? t(slide.discountKey) : slide.discount}
              </p>
              <p key={`desc-${promoDot}`} className="text-sm text-background/70 mt-1.5 max-w-[180px] leading-snug">
                {t(slide.descKey)}
              </p>
              <Link
                href={slide.href}
                className="inline-block mt-4 px-5 py-2.5 rounded-full bg-background text-foreground font-bold text-sm btn-press"
              >
                {t(slide.btnKey)}
              </Link>
              <div className="absolute bottom-4 right-4 flex items-center gap-1.5">
                {promoSlides.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setPromoDot(i)}
                    className={cn(
                      "rounded-full transition-all duration-300",
                      promoDot === i ? "w-4 h-1.5 bg-background" : "w-1.5 h-1.5 bg-background/30"
                    )}
                  />
                ))}
              </div>
            </div>
          );
        })()}

        {/* ── Categories (drag-to-scroll slider) ── */}
        <div
          ref={catScrollRef}
          onMouseDown={onCatMouseDown}
          onMouseMove={onCatMouseMove}
          onMouseUp={endCatDrag}
          onMouseLeave={endCatDrag}
          className="-mx-4 px-4 py-2 overflow-x-auto no-scrollbar touch-pan-x cursor-grab active:cursor-grabbing select-none"
        >
          <div className="flex gap-4 w-max">
            <button
              onClick={() => selectCategory(null)}
              className="flex flex-col items-center gap-2 flex-shrink-0 btn-press"
            >
              <div className={cn(
                "w-16 h-16 rounded-2xl flex items-center justify-center transition-all",
                activeCategory === null
                  ? "bg-primary ring-2 ring-primary ring-offset-2 ring-offset-background"
                  : "bg-secondary"
              )}>
                <LayoutGrid
                  className={cn("w-6 h-6", activeCategory === null ? "text-primary-foreground" : "text-foreground")}
                  strokeWidth={1.75}
                />
              </div>
              <span className={cn("text-xs font-semibold", activeCategory === null ? "text-foreground" : "text-muted-foreground")}>
                {t("all")}
              </span>
            </button>

            {categories.map((cat) => {
              const isActive = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => selectCategory(isActive ? null : cat.id)}
                  className="flex flex-col items-center gap-2 flex-shrink-0 btn-press"
                >
                  <div className={cn(
                    "relative w-16 h-16 rounded-2xl overflow-hidden bg-secondary flex items-center justify-center transition-all",
                    isActive && "ring-2 ring-primary ring-offset-2 ring-offset-background"
                  )}>
                    {/* emoji fallback sits behind the photo; shown if the image fails to load */}
                    <span className="absolute text-2xl select-none">{cat.emoji}</span>
                    <img
                      src={cat.image}
                      alt={cat.name}
                      draggable={false}
                      onError={(e) => { e.currentTarget.style.display = "none"; }}
                      className="relative w-full h-full object-cover"
                    />
                    {isActive && <div className="absolute inset-0 bg-primary/20" />}
                  </div>
                  <span className={cn("text-xs font-semibold max-w-[64px] truncate text-center", isActive ? "text-foreground" : "text-muted-foreground")}>
                    {cat.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Mashhur taomlar ── */}
        {filteredFoods.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-black text-xl text-foreground">{t("popularDishes")}</h2>
              <Link href="/categories" className="flex items-center gap-0.5 text-sm font-semibold text-muted-foreground">
                {t("all")} <ChevronRight className="w-4 h-4" strokeWidth={1.75} />
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {filteredFoods.map((food) => (
                <HomeFoodCard key={food.id} food={food} />
              ))}
            </div>
          </div>
        )}

        {/* ── Oshxonalar ── */}
        {filteredRestaurants.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-black text-xl text-foreground">{t("restaurants")}</h2>
              <Link href="/restaurants" className="flex items-center gap-0.5 text-sm font-semibold text-muted-foreground">
                {t("allCount", { count: filteredRestaurants.length })} <ChevronRight className="w-4 h-4" strokeWidth={1.75} />
              </Link>
            </div>
            {filteredRestaurants.map((r) => (
              <HomeRestaurantCard key={r.id} restaurant={r} />
            ))}
          </div>
        )}

        {filteredFoods.length === 0 && filteredRestaurants.length === 0 && (
          <div className="py-16 text-center">
            <p className="font-bold text-foreground">{t("emptyCategory")}</p>
            <button onClick={() => setActiveCategory(null)} className="mt-3 text-sm text-muted-foreground underline">
              {t("viewAll")}
            </button>
          </div>
        )}

      </div>
      <HomeCartBar />
    </LayoutWrapper>
  );
}
