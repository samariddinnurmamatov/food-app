"use client";
import Image from "next/image";
import { getFoodById, getRestaurantById } from "@/mock/data";
import { Plus, Minus, ShoppingBag, UtensilsCrossed, Star, X, ZoomIn, ArrowLeft } from "lucide-react";
import { use, useState, useCallback } from "react";
import { useCart } from "@/context/CartContext";
import { Link, useRouter } from "@/navigation";
import { fmt, sized } from "@/shared/lib/utils";
import { useTranslations } from "next-intl";
import { useDialog } from "@/shared/lib/useDialog";

export default function FoodPage({ params }: { params: Promise<{ id: string }> }) {
  const t = useTranslations("FoodDetail");
  const tHeader = useTranslations("Header");
  const router = useRouter();
  const { id } = use(params);
  const food = getFoodById(id);
  const [imgOpen, setImgOpen] = useState(false);
  const closeImg = useCallback(() => setImgOpen(false), []);
  const { panelRef: imgPanelRef, initialFocusRef: imgCloseRef } =
    useDialog<HTMLDivElement, HTMLButtonElement>(imgOpen, closeImg);
  const { items, addItem, updateQuantity, total, totalItems } = useCart();

  if (!food) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-3 px-4 text-center">
        <UtensilsCrossed className="w-12 h-12 text-muted-foreground" strokeWidth={1.25} />
        <p className="font-bold text-foreground">{t("notFound")}</p>
        <button onClick={() => router.back()} className="text-sm text-muted-foreground underline">
          {tHeader("back")}
        </button>
      </div>
    );
  }

  const restaurant = getRestaurantById(food.restaurantId);
  const qty = items.find((i) => i.food.id === food.id)?.quantity ?? 0;
  const outOfStock = food.isAvailable === false;

  return (
    <div className="min-h-screen bg-background">
      {/* Fullscreen image overlay */}
      {imgOpen && food.image && (
        <div
          ref={imgPanelRef}
          role="dialog"
          aria-modal="true"
          aria-label={t("imageAlt", { name: food.name })}
          className="fixed inset-0 bg-black z-[9999] flex items-center justify-center"
          onClick={() => setImgOpen(false)}
        >
          <img
            src={food.image}
            alt={food.name}
            className="max-w-full max-h-full object-contain"
          />
          <button
            ref={imgCloseRef}
            className="absolute top-5 right-5 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center"
            onClick={() => setImgOpen(false)}
            aria-label={tHeader("close")}
          >
            <X className="w-5 h-5 text-white" strokeWidth={2} />
          </button>
        </div>
      )}

      {/* Image — full-bleed hero with a floating back button (no app header) */}
      <div className="relative h-72 bg-secondary max-w-[480px] mx-auto overflow-hidden">
        <div
          className="absolute inset-0 cursor-pointer"
          onClick={() => food.image && setImgOpen(true)}
        >
          {food.image ? (
            <>
              <Image src={food.image} alt={food.name} fill priority sizes="(max-width: 480px) 100vw, 480px" className="object-cover" />
              <div className="absolute bottom-3 right-3 w-8 h-8 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center">
                <ZoomIn className="w-4 h-4 text-white" strokeWidth={1.75} />
              </div>
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <UtensilsCrossed className="w-14 h-14 text-muted-foreground" strokeWidth={1.25} />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
        </div>

        <button
          onClick={() => router.back()}
          className="absolute top-4 left-4 w-10 h-10 rounded-full bg-background/90 backdrop-blur-sm shadow flex items-center justify-center btn-press z-10"
          aria-label={tHeader("back")}
        >
          <ArrowLeft className="w-5 h-5 text-foreground" strokeWidth={1.75} />
        </button>
      </div>

      <div className="px-4 max-w-[480px] mx-auto pt-5 pb-32 space-y-4">
        {/* Name & price */}
        <div>
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              {outOfStock ? (
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">{t("outOfStock")}</span>
              ) : food.isPopular ? (
                <span className="text-xs font-bold text-muted-foreground">⭐ {t("popularDish")}</span>
              ) : null}
              <h1 className="font-black text-2xl text-foreground mt-0.5">{food.name}</h1>
            </div>
            {food.rating && (
              <div className="flex items-center gap-1 bg-secondary px-2.5 py-1.5 rounded-xl mt-1 flex-shrink-0">
                <Star className="w-3.5 h-3.5 fill-foreground" strokeWidth={0} />
                <span className="font-bold text-sm text-foreground">{food.rating}</span>
              </div>
            )}
          </div>
          <p className="text-2xl font-black text-foreground mt-2">{fmt(food.price)}</p>
        </div>

        {/* Description */}
        <p className="text-sm text-muted-foreground leading-relaxed">{food.description}</p>

        {/* Restaurant link */}
        {restaurant && (
          <Link href={`/restaurant/${restaurant.id}`} className="flex items-center gap-3 p-3 rounded-2xl border border-border btn-press">
            <div className="w-10 h-10 rounded-xl bg-secondary overflow-hidden flex-shrink-0">
              {restaurant.image && (
                <img src={sized(restaurant.image, 80)} alt={restaurant.name} width={40} height={40} loading="lazy" decoding="async" className="w-full h-full object-cover" />
              )}
            </div>
            <div>
              <p className="font-bold text-sm text-foreground">{restaurant.name}</p>
              <p className="text-xs text-muted-foreground">{restaurant.cuisine}</p>
            </div>
          </Link>
        )}

        {/* Quantity — directly bound to the cart */}
        <div className="flex items-center justify-between py-2">
          <span className="font-semibold text-foreground">{t("quantity")}</span>
          <div className="flex items-center gap-4">
            <button
              onClick={() => updateQuantity(food.id, qty - 1)}
              disabled={qty === 0}
              aria-label={t("decreaseQty", { name: food.name })}
              className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center btn-press disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Minus className="w-4 h-4 text-foreground" strokeWidth={2} />
            </button>
            <span className="font-black text-xl w-6 text-center text-foreground tabular-nums">{qty}</span>
            <button
              onClick={() => (qty === 0 ? addItem(food) : updateQuantity(food.id, qty + 1))}
              disabled={outOfStock}
              aria-label={t("increaseQty", { name: food.name })}
              className="w-10 h-10 rounded-full bg-primary flex items-center justify-center btn-press disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Plus className="w-4 h-4 text-primary-foreground" strokeWidth={2} />
            </button>
          </div>
        </div>
      </div>

      {/* Bottom CTA — add when empty, go to cart once it has items */}
      <div className="fixed bottom-0 left-0 right-0 p-4 pb-safe-4 bg-background border-t border-border z-20">
        <div className="max-w-[480px] mx-auto">
          {outOfStock && qty === 0 ? (
            <button
              disabled
              className="flex items-center justify-center w-full px-5 py-4 rounded-full bg-secondary text-muted-foreground font-bold cursor-not-allowed"
            >
              <span>{t("outOfStock")}</span>
            </button>
          ) : qty === 0 ? (
            <button
              onClick={() => addItem(food)}
              className="flex items-center justify-between w-full px-5 py-4 rounded-full bg-primary text-primary-foreground font-bold shadow-xl btn-press"
            >
              <ShoppingBag className="w-5 h-5" strokeWidth={1.75} />
              <span>{t("addToCart")}</span>
              <span>{fmt(food.price)}</span>
            </button>
          ) : (
            <Link
              href="/cart"
              className="flex items-center justify-between w-full px-5 py-4 rounded-full bg-primary text-primary-foreground font-bold shadow-xl btn-press"
            >
              <span className="text-sm font-semibold opacity-80">{t("itemsInCart", { count: totalItems })}</span>
              <span>{t("goToCart")}</span>
              <span>{fmt(total)}</span>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
