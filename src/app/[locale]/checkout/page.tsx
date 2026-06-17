"use client";
import { LayoutWrapper } from "@/shared/ui/layout-wrapper";
import { useCart } from "@/context/CartContext";
import { useOrders } from "@/context/OrdersContext";
import { useAddresses } from "@/context/AddressContext";
import { useNotifications } from "@/context/NotificationsContext";
import { getRestaurantById } from "@/mock/data";
import { Bike, Store, Banknote, CreditCard, Check, CheckCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { cn, fmt, computeDeliveryFee } from "@/shared/lib/utils";
import { Link } from "@/navigation";
import { useTranslations } from "next-intl";
import dynamic from "next/dynamic";

// Lazy-load the map block (mounts an OpenStreetMap <iframe>) so its machinery
// stays out of the checkout initial chunk. ssr:false — it's client-only anyway.
const LocationPicker = dynamic(
  () => import("@/components/LocationPicker").then((m) => m.LocationPicker),
  {
    ssr: false,
    loading: () => (
      <div className="rounded-2xl border border-border p-4 space-y-3">
        <div className="h-5 w-32 rounded bg-secondary" />
        <div className="h-44 rounded-2xl bg-secondary" />
        <div className="h-10 rounded-xl bg-secondary" />
        <div className="h-10 rounded-xl bg-secondary" />
      </div>
    ),
  }
);
import {
  validatePromo,
  computePromoDiscount,
  PROMO_STORAGE_KEY,
  type PromoResult,
} from "@/shared/lib/promo";

type Delivery = "delivery" | "pickup";
type Payment = "cash" | "click" | "payme";

export default function CheckoutPage() {
  const t = useTranslations("Checkout");
  const { items, total, clearCart } = useCart();
  const { addOrder } = useOrders();
  const { addresses, defaultAddress } = useAddresses();
  const { addNotification } = useNotifications();

  const [delivery, setDelivery] = useState<Delivery>("delivery");
  const [payment, setPayment] = useState<Payment>("cash");
  const [address, setAddress] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [createdId, setCreatedId] = useState<string | null>(null);
  const [promo, setPromo] = useState<PromoResult | null>(null);

  // Preselect the default saved address once it's hydrated (don't clobber edits).
  useEffect(() => {
    if (!address && defaultAddress) setAddress(defaultAddress.address);
  }, [defaultAddress, address]);

  // Read the promo applied on the cart page (shared via localStorage).
  useEffect(() => {
    try {
      const code = localStorage.getItem(PROMO_STORAGE_KEY);
      if (code) {
        const result = validatePromo(code);
        if (result.valid) setPromo(result);
      }
    } catch {}
  }, []);

  const discount = promo ? computePromoDiscount(promo, total) : 0;
  const discountedSubtotal = total - discount;
  const promoFreeDelivery = promo?.valid && promo.kind === "freeDelivery";
  const deliveryFee =
    delivery === "pickup" || promoFreeDelivery ? 0 : computeDeliveryFee(discountedSubtotal);
  const grandTotal = discountedSubtotal + deliveryFee;

  const handleOrder = async () => {
    if (items.length === 0) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 900));

    const restaurant = getRestaurantById(items[0].food.restaurantId);
    const created = addOrder({
      restaurantName: restaurant?.name ?? items[0].food.name,
      restaurantImage: restaurant?.image ?? items[0].food.image ?? "",
      restaurantId: restaurant?.id,
      items: items.map(({ food, quantity }) => ({
        name: food.name,
        quantity,
        price: food.price,
        foodId: food.id,
        image: food.image,
      })),
      total: grandTotal,
      address,
    });

    // Notify (+ ding): order accepted. Fires from this tap, a valid user gesture,
    // so the browser's autoplay policy lets the sound through.
    addNotification({
      type: "order",
      titleKey: "orderAcceptedTitle",
      bodyKey: "orderAcceptedBody",
      params: { restaurant: created.restaurantName },
    });

    try {
      localStorage.removeItem(PROMO_STORAGE_KEY);
    } catch {}
    clearCart();
    setCreatedId(created.id);
    setLoading(false);
    setDone(true);
  };

  if (done) {
    return (
      <LayoutWrapper showFooter={false}>
        <div className="flex flex-col items-center justify-center min-h-[75vh] gap-6 px-6 text-center">
          <div className="w-24 h-24 rounded-full bg-primary flex items-center justify-center shadow-xl">
            <CheckCircle className="w-12 h-12 text-primary-foreground" strokeWidth={1.5} />
          </div>
          <div>
            <h2 className="font-black text-2xl text-foreground">{t("orderPlaced")}</h2>
            <p className="text-sm text-muted-foreground mt-2 max-w-[260px] mx-auto leading-relaxed">
              {t("orderAcceptedEta")}
            </p>
          </div>
          <div className="w-full max-w-[320px] rounded-2xl bg-secondary p-4 text-left space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{t("paymentMethod")}</span>
              <span className="font-semibold text-foreground capitalize">
                {payment === "cash" ? t("cash") : payment === "click" ? "Click" : "Payme"}
              </span>
            </div>
            {delivery === "delivery" && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{t("address")}</span>
                <span className="font-semibold text-foreground text-right max-w-[160px]">{address}</span>
              </div>
            )}
          </div>
          {createdId && (
            <Link
              href={`/order/${createdId}`}
              className="w-full max-w-[320px] py-4 rounded-full bg-primary text-primary-foreground font-bold text-center text-base btn-press"
            >
              {t("trackOrder")}
            </Link>
          )}
          <Link href="/orders" className="text-sm text-foreground underline">
            {t("viewOrders")}
          </Link>
          <Link href="/" className="text-sm text-muted-foreground underline">
            {t("backToHome")}
          </Link>
        </div>
      </LayoutWrapper>
    );
  }

  return (
    <LayoutWrapper showFooter={false}>
      <div className="px-4 max-w-[480px] mx-auto pt-3 pb-32 space-y-4">
        {/* Delivery toggle */}
        <div className="flex gap-2 p-1 bg-secondary rounded-2xl">
          <button
            onClick={() => setDelivery("delivery")}
            className={cn("flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all btn-press",
              delivery === "delivery" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"
            )}
          >
            <Bike className="w-4 h-4" strokeWidth={1.75} />
            {t("delivery")}
          </button>
          <button
            onClick={() => setDelivery("pickup")}
            className={cn("flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all btn-press",
              delivery === "pickup" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"
            )}
          >
            <Store className="w-4 h-4" strokeWidth={1.75} />
            {t("pickup")}
          </button>
        </div>

        {/* Address + map */}
        {delivery === "delivery" && (
          <>
            {addresses.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-semibold text-foreground">{t("savedAddresses")}</p>
                <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-4 px-4 py-1">
                  {addresses.map((a) => (
                    <button
                      key={a.id}
                      type="button"
                      onClick={() => setAddress(a.address)}
                      aria-pressed={address === a.address}
                      className={cn(
                        "flex-shrink-0 px-4 py-2.5 rounded-2xl border text-left transition-all btn-press",
                        address === a.address ? "border-primary bg-secondary" : "border-border"
                      )}
                    >
                      <span className="block text-xs font-bold text-foreground">{a.label}</span>
                      <span className="block text-xs text-muted-foreground max-w-[180px] truncate">{a.address}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
            <LocationPicker address={address} onAddressChange={setAddress} />
          </>
        )}

        {/* Order summary */}
        <div className="rounded-2xl border border-border p-4 space-y-2">
          <p className="font-bold text-sm text-foreground mb-3">{t("order")}</p>
          {items.map(({ food, quantity }) => (
            <div key={food.id} className="flex justify-between text-sm">
              <span className="text-muted-foreground">{food.name} × {quantity}</span>
              <span className="font-semibold text-foreground">{fmt(food.price * quantity)}</span>
            </div>
          ))}
          {discount > 0 && (
            <div className="pt-2 border-t border-border flex justify-between text-sm">
              <span className="text-muted-foreground">{t("discount")}</span>
              <span className="font-semibold text-success">−{fmt(discount)}</span>
            </div>
          )}
          <div className="pt-2 border-t border-border flex justify-between text-sm">
            <span className="text-muted-foreground">{t("delivery")}</span>
            <span className="font-semibold text-foreground">{deliveryFee === 0 ? t("free") : fmt(deliveryFee)}</span>
          </div>
          <div className="flex justify-between font-bold">
            <span className="text-foreground">{t("total")}</span>
            <span className="text-foreground">{fmt(grandTotal)}</span>
          </div>
        </div>

        {/* Payment */}
        <div className="rounded-2xl border border-border p-4">
          <p className="font-bold text-sm text-foreground mb-3">{t("paymentMethod")}</p>
          <div className="space-y-2">
            {([
              { id: "cash", label: t("cash"), Icon: Banknote },
              { id: "click", label: "Click", Icon: CreditCard },
              { id: "payme", label: "Payme", Icon: CreditCard },
            ] as { id: Payment; label: string; Icon: typeof Banknote }[]).map(({ id, label, Icon }) => (
              <button
                key={id}
                onClick={() => setPayment(id)}
                className={cn("w-full flex items-center gap-3 p-3 rounded-xl border transition-all btn-press",
                  payment === id ? "border-foreground bg-secondary" : "border-border"
                )}
              >
                <div className={cn("w-8 h-8 rounded-full flex items-center justify-center",
                  payment === id ? "bg-primary" : "bg-secondary"
                )}>
                  <Icon className={cn("w-4 h-4", payment === id ? "text-primary-foreground" : "text-muted-foreground")} strokeWidth={1.75} />
                </div>
                <span className="flex-1 text-sm font-semibold text-foreground text-left">{label}</span>
                {payment === id && <Check className="w-4 h-4 text-foreground" strokeWidth={2} />}
              </button>
            ))}
          </div>
        </div>

        {/* Note */}
        <div className="rounded-2xl border border-border p-4">
          <p className="font-bold text-sm text-foreground mb-2">{t("noteOptional")}</p>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder={t("notePlaceholder")}
            rows={2}
            className="w-full bg-secondary rounded-xl px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none resize-none"
          />
        </div>
      </div>

      {/* CTA */}
      <div className="fixed bottom-0 left-0 right-0 p-4 pb-safe-4 bg-background border-t border-border z-20">
        <div className="max-w-[480px] mx-auto">
          <button
            onClick={handleOrder}
            disabled={loading || items.length === 0}
            className="w-full py-4 rounded-full bg-primary text-primary-foreground font-bold text-base btn-press disabled:opacity-60"
          >
            {loading ? t("sending") : t("placeOrderWithTotal", { total: fmt(grandTotal) })}
          </button>
        </div>
      </div>
    </LayoutWrapper>
  );
}
