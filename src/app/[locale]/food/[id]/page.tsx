"use client";
import { LayoutWrapper } from "@/shared/ui/layout-wrapper";
import { getFoodById, getRestaurantById } from "@/mock/data";
import { Plus, Minus, ShoppingBag, UtensilsCrossed, Star, X, ZoomIn } from "lucide-react";
import { use, useState } from "react";
import { useCart } from "@/context/CartContext";
import { Link } from "@/navigation";
import { fmt } from "@/shared/lib/utils";
import { useTranslations } from "next-intl";

export default function FoodPage({ params }: { params: Promise<{ id: string }> }) {
  const t = useTranslations("FoodDetail");
  const { id } = use(params);
  const food = getFoodById(id);
  const [qty, setQty] = useState(1);
  const [imgOpen, setImgOpen] = useState(false);
  const { addItem, items } = useCart();

  if (!food) {
    return (
      <LayoutWrapper showFooter={false}>
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
          <UtensilsCrossed className="w-12 h-12 text-muted-foreground" strokeWidth={1.25} />
          <p className="font-bold text-foreground">{t("notFound")}</p>
        </div>
      </LayoutWrapper>
    );
  }

  const restaurant = getRestaurantById(food.restaurantId);
  const cartItem = items.find((i) => i.food.id === food.id);

  const handleAdd = () => {
    addItem(food, qty);
  };

  return (
    <LayoutWrapper showFooter={false}>
      {/* Fullscreen image overlay */}
      {imgOpen && food.image && (
        <div
          className="fixed inset-0 bg-black z-[9999] flex items-center justify-center"
          onClick={() => setImgOpen(false)}
        >
          <img
            src={food.image}
            alt={food.name}
            className="max-w-full max-h-full object-contain"
          />
          <button
            className="absolute top-5 right-5 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center"
            onClick={() => setImgOpen(false)}
          >
            <X className="w-5 h-5 text-white" strokeWidth={2} />
          </button>
        </div>
      )}

      {/* Image */}
      <div
        className="relative h-72 bg-secondary max-w-[480px] mx-auto overflow-hidden cursor-pointer"
        onClick={() => food.image && setImgOpen(true)}
      >
        {food.image ? (
          <>
            <img src={food.image} alt={food.name} className="w-full h-full object-cover" />
            <div className="absolute bottom-3 right-3 w-8 h-8 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center">
              <ZoomIn className="w-4 h-4 text-white" strokeWidth={1.75} />
            </div>
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <UtensilsCrossed className="w-14 h-14 text-muted-foreground" strokeWidth={1.25} />
          </div>
        )}
      </div>

      <div className="px-4 max-w-[480px] mx-auto pt-5 pb-32 space-y-4">
        {/* Name & price */}
        <div>
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              {food.isPopular && (
                <span className="text-xs font-bold text-muted-foreground">⭐ {t("popularDish")}</span>
              )}
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
                <img src={restaurant.image} alt={restaurant.name} className="w-full h-full object-cover" />
              )}
            </div>
            <div>
              <p className="font-bold text-sm text-foreground">{restaurant.name}</p>
              <p className="text-xs text-muted-foreground">{restaurant.cuisine}</p>
            </div>
          </Link>
        )}

        {/* Quantity */}
        <div className="flex items-center justify-between py-2">
          <span className="font-semibold text-foreground">{t("quantity")}</span>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setQty((q) => Math.max(1, q - 1))}
              className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center btn-press"
            >
              <Minus className="w-4 h-4 text-foreground" strokeWidth={2} />
            </button>
            <span className="font-black text-xl w-6 text-center text-foreground">{qty}</span>
            <button
              onClick={() => setQty((q) => q + 1)}
              className="w-10 h-10 rounded-full bg-primary flex items-center justify-center btn-press"
            >
              <Plus className="w-4 h-4 text-primary-foreground" strokeWidth={2} />
            </button>
          </div>
        </div>

        {cartItem && (
          <p className="text-xs text-muted-foreground text-center">
            {t("alreadyInCart", { count: cartItem.quantity })}
          </p>
        )}
      </div>

      {/* Add to cart CTA */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-background border-t border-border z-20">
        <div className="max-w-[480px] mx-auto">
          <button
            onClick={handleAdd}
            className="flex items-center justify-between w-full px-5 py-4 rounded-full bg-primary text-primary-foreground font-bold shadow-xl btn-press"
          >
            <ShoppingBag className="w-5 h-5" strokeWidth={1.75} />
            <span>{t("addToCart")}</span>
            <span>{fmt(food.price * qty)}</span>
          </button>
        </div>
      </div>
    </LayoutWrapper>
  );
}
