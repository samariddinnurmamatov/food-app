"use client";
import { memo } from "react";
import Image from "next/image";
import useEmblaCarousel from "embla-carousel-react";
import { LayoutWrapper } from "@/shared/ui/layout-wrapper";
import { categories, restaurants, foodItems } from "@/mock/data";
import {
  Search, Star, Plus, Minus, Heart,
  Clock, Bike, ChevronRight, LayoutGrid,
  UtensilsCrossed, Beef, PieChart, Gift, Coffee, Salad,
  Pizza, Sandwich, Fish,
  type LucideIcon,
} from "lucide-react";
import { Link } from "@/navigation";
import { useTranslations } from "next-intl";
import type React from "react";
import { useState, useEffect, useCallback, useRef } from "react";
import { useCart } from "@/context/CartContext";
import { useFavorites } from "@/context/FavoritesContext";
import { cn, fmt, sized } from "@/shared/lib/utils";
import type { FoodItem, Restaurant } from "@/types";
import { FloatingCartBar } from "@/components/FloatingCartBar";

const iconMap: Record<string, LucideIcon> = {
  UtensilsCrossed, Beef, PieChart, Gift, Coffee, Salad, Pizza, Sandwich, Fish,
};

interface BannerSlide {
  titleKey: string;
  subtitleKey: string;
  ctaKey: string;
  href: string;
  image: string;
}

const bannerSlides: BannerSlide[] = [
  {
    titleKey: "banner1Title",
    subtitleKey: "banner1Subtitle",
    ctaKey: "banner1Cta",
    href: "/categories",
    image: "/banners/banner1.jpg",
  },
  {
    titleKey: "banner2Title",
    subtitleKey: "banner2Subtitle",
    ctaKey: "banner2Cta",
    href: "/restaurant/evos",
    image: "/banners/banner2.jpg",
  },
  {
    titleKey: "banner3Title",
    subtitleKey: "banner3Subtitle",
    ctaKey: "banner3Cta",
    href: "/categories",
    image: "/banners/banner3.jpg",
  },
  {
    titleKey: "banner4Title",
    subtitleKey: "banner4Subtitle",
    ctaKey: "banner4Cta",
    href: "/categories",
    image: "/banners/banner4.jpg",
  },
];

// Swipeable, autoplaying promo banner carousel (embla).
function BannerCarousel() {
  const t = useTranslations("Home");
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: "center" });
  const [selectedIndex, setSelectedIndex] = useState(0);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
    return () => {
      emblaApi.off("select", onSelect);
      emblaApi.off("reInit", onSelect);
    };
  }, [emblaApi, onSelect]);

  // Autoplay: advance every 4s, pause on pointer interaction.
  useEffect(() => {
    if (!emblaApi) return;
    let timer: ReturnType<typeof setInterval> | null = null;
    const start = () => {
      stop();
      timer = setInterval(() => emblaApi.scrollNext(), 4000);
    };
    function stop() {
      if (timer) { clearInterval(timer); timer = null; }
    }
    start();
    emblaApi.on("pointerDown", stop);
    emblaApi.on("pointerUp", start);
    return () => {
      stop();
      emblaApi.off("pointerDown", stop);
      emblaApi.off("pointerUp", start);
    };
  }, [emblaApi]);

  const scrollTo = useCallback((i: number) => emblaApi?.scrollTo(i), [emblaApi]);

  return (
    <div className="relative">
      <div className="overflow-hidden rounded-2xl" ref={emblaRef}>
        <div className="flex">
          {bannerSlides.map((slide, i) => (
            <div key={slide.titleKey} className="relative flex-[0_0_100%] min-w-0 h-44">
              <Image
                src={slide.image}
                alt={t(slide.titleKey)}
                fill
                priority={i === 0}
                fetchPriority={i === 0 ? "high" : "auto"}
                loading={i === 0 ? "eager" : "lazy"}
                quality={40}
                sizes="(max-width: 480px) 100vw, 480px"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/20" />
              <div className="absolute inset-0 flex flex-col justify-center p-5 max-w-[80%]">
                <h2 className="text-white font-black text-2xl leading-tight drop-shadow">
                  {t(slide.titleKey)}
                </h2>
                <p className="text-white/85 text-sm mt-1.5 leading-snug drop-shadow">
                  {t(slide.subtitleKey)}
                </p>
                <Link
                  href={slide.href}
                  className="inline-flex items-center self-start gap-1 mt-3 px-4 py-2 rounded-full bg-white text-foreground font-bold text-sm btn-press"
                >
                  {t(slide.ctaKey)}
                  <ChevronRight className="w-4 h-4" strokeWidth={2.25} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pagination dots */}
      <div className="absolute bottom-3 left-0 right-0 flex items-center justify-center gap-1.5">
        {bannerSlides.map((slide, i) => (
          <button
            key={slide.titleKey}
            onClick={() => scrollTo(i)}
            aria-label={t("bannerSlide", { n: i + 1 })}
            aria-current={selectedIndex === i ? "true" : undefined}
            className={cn(
              "h-1.5 rounded-full transition-all duration-300",
              selectedIndex === i ? "w-5 bg-white" : "w-1.5 bg-white/40"
            )}
          />
        ))}
      </div>
    </div>
  );
}

const HomeFoodCard = memo(function HomeFoodCard({ food }: { food: FoodItem }) {
  const t = useTranslations("Home");
  const tCard = useTranslations("FoodCard");
  const { items, addItem, updateQuantity } = useCart();
  const qty = items.find((i) => i.food.id === food.id)?.quantity ?? 0;
  const displayRating = food.rating ?? 4.5;
  const outOfStock = food.isAvailable === false;

  const stop = (e: React.MouseEvent) => { e.preventDefault(); e.stopPropagation(); };

  return (
    <Link href={`/food/${food.id}`} className="block">
      <div className="rounded-2xl overflow-hidden border border-border bg-card">
        <div className="relative h-36 bg-secondary overflow-hidden">
          {food.image ? (
            <Image src={food.image} alt={food.name} fill sizes="(max-width: 480px) 50vw, 240px" className={cn("object-cover", outOfStock && "opacity-50")} />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <UtensilsCrossed className="w-8 h-8 text-muted-foreground" strokeWidth={1.25} />
            </div>
          )}
          {outOfStock ? (
            <div className="absolute top-2 left-2 bg-background/90 backdrop-blur-sm rounded-lg px-2 py-1">
              <span className="text-xs font-bold text-foreground">{tCard("outOfStock")}</span>
            </div>
          ) : (
            <div className="absolute top-2 left-2 flex items-center gap-0.5 bg-background/90 backdrop-blur-sm rounded-lg px-2 py-1">
              <Star className="w-3 h-3 fill-foreground text-foreground" strokeWidth={0} />
              <span className="text-xs font-bold text-foreground">{displayRating}</span>
            </div>
          )}
        </div>
        <div className="p-3 space-y-2">
          <div className={cn(outOfStock && "opacity-50")}>
            <p className="font-bold text-sm text-card-foreground leading-tight truncate">{food.name}</p>
            <p className="text-xs text-muted-foreground mt-0.5 truncate">
              {restaurants.find((r) => r.id === food.restaurantId)?.name ?? food.category}
            </p>
          </div>
          <p className={cn("font-black text-sm text-card-foreground", outOfStock && "opacity-50")}>{fmt(food.price)}</p>

          {outOfStock ? (
            <button
              disabled
              onClick={stop}
              className="w-full h-9 rounded-xl bg-secondary text-muted-foreground text-xs font-bold flex items-center justify-center gap-1 cursor-not-allowed"
            >
              {tCard("outOfStock")}
            </button>
          ) : qty === 0 ? (
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
                aria-label={t("decreaseQty", { name: food.name })}
                className="w-7 h-7 rounded-lg bg-background flex items-center justify-center btn-press"
              >
                <Minus className="w-4 h-4 text-foreground" strokeWidth={2.5} />
              </button>
              <span className="font-black text-sm text-foreground tabular-nums">{qty}</span>
              <button
                onClick={(e) => { stop(e); updateQuantity(food.id, qty + 1); }}
                aria-label={t("increaseQty", { name: food.name })}
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
});

const HomeRestaurantCard = memo(function HomeRestaurantCard({ restaurant }: { restaurant: Restaurant }) {
  const t = useTranslations("Home");
  const tCard = useTranslations("RestaurantCard");
  const { isFavorite, toggleFavorite } = useFavorites();
  const fav = isFavorite(restaurant.id);
  const CuisineIcon = iconMap[categories.find((c) => c.id === restaurant.categoryId)?.icon ?? ""] ?? UtensilsCrossed;
  const feeLabel = restaurant.deliveryFee === "Tekin" ? t("free") : restaurant.deliveryFee;

  return (
    <Link href={`/restaurant/${restaurant.id}`} className="block mb-4">
      <div className="rounded-2xl overflow-hidden border border-border bg-card">
        <div className="relative h-44 bg-secondary overflow-hidden">
          {restaurant.image ? (
            <Image src={restaurant.image} alt={restaurant.name} fill sizes="(max-width: 480px) 100vw, 480px" className="object-cover" />
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
            aria-label={fav ? tCard("unfavorite", { name: restaurant.name }) : tCard("favorite", { name: restaurant.name })}
            aria-pressed={fav}
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
});

export default function HomePage() {
  const t = useTranslations("Home");
  const { totalItems } = useCart();
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

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

        {/* ── Search ── */}
        <Link
          href="/categories"
          className="flex items-center gap-3 bg-secondary rounded-2xl px-4 py-3.5"
        >
          <Search className="w-4 h-4 text-muted-foreground flex-shrink-0" strokeWidth={1.75} />
          <span className="text-sm text-muted-foreground">{t("searchPlaceholder")}</span>
        </Link>

        {/* ── Promo banner carousel ── */}
        <BannerCarousel />

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
                      src={sized(cat.image, 128)}
                      alt={cat.name}
                      draggable={false}
                      decoding="async"
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
      <FloatingCartBar label={t("order")} aboveFooter />
    </LayoutWrapper>
  );
}
