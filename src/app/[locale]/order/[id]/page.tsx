"use client";
import { LayoutWrapper } from "@/shared/ui/layout-wrapper";
import { CheckCircle, Clock, ChefHat, Bike, MapPin, Package, Phone } from "lucide-react";
import { use, useEffect, useRef, useState } from "react";
import { cn, fmt } from "@/shared/lib/utils";
import { useTranslations } from "next-intl";
import { useOrders } from "@/context/OrdersContext";
import { useNotifications } from "@/context/NotificationsContext";
import { Link } from "@/navigation";
import { CourierMap } from "@/components/CourierMap";
import { computeOrderProgress, isFinalStatus } from "@/shared/lib/orderProgress";

const statusSteps = [
  { key: "pending",    labelKey: "statusPending",   icon: CheckCircle, descKey: "descPending" },
  { key: "preparing",  labelKey: "statusPreparing", icon: ChefHat,     descKey: "descPreparing" },
  { key: "on_the_way", labelKey: "statusOnTheWay",  icon: Bike,        descKey: "descOnTheWay" },
  { key: "delivered",  labelKey: "statusDelivered", icon: MapPin,      descKey: "descDelivered" },
];

// Mock courier shown while an order is preparing / en route. A real app would
// receive these (name, phone, live GPS) from the backend dispatch system.
const COURIER_NAME = "Akmal";
const COURIER_PHONE = "+998901234567";

export default function OrderTrackingPage({ params }: { params: Promise<{ id: string }> }) {
  const t = useTranslations("OrderDetail");
  const { id } = use(params);
  const { getOrderById } = useOrders();
  const { addNotification } = useNotifications();
  const order = getOrderById(id);

  // Fire the "on the way" notification (+ ding) exactly once, the first time the
  // live status crosses into on_the_way. The status recomputes every second, so a
  // ref guards against re-firing on every tick. Seeded final orders never enter
  // the live timeline (see `final` below), so they're skipped automatically.
  const onTheWayNotified = useRef(false);

  // Live clock: re-tick every second so the status, ETA countdown and courier
  // position advance while the page is open. Only runs for non-final orders.
  const final = order ? isFinalStatus(order.status) : true;
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!order || final) return;
    if (typeof window === "undefined") return;
    // Recompute ~once per second (demo timeline; backend would push real events).
    const interval = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(interval);
  }, [order, final]);

  // Notify (+ ding) once when the live status first reaches on_the_way. Skipped
  // for final orders (delivered/cancelled seeds never enter the live timeline).
  // The ref prevents re-firing on every per-second `now` tick.
  useEffect(() => {
    if (!order || final) return;
    if (onTheWayNotified.current) return;
    if (computeOrderProgress(order, now).status !== "on_the_way") return;
    onTheWayNotified.current = true;
    addNotification({
      type: "order",
      titleKey: "onTheWayTitle",
      bodyKey: "onTheWayBody",
      params: { restaurant: order.restaurantName },
    });
  }, [order, final, now, addNotification]);

  if (!order) {
    return (
      <LayoutWrapper showFooter={false}>
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 px-6 text-center">
          <Package className="w-12 h-12 text-muted-foreground" strokeWidth={1.25} />
          <p className="font-bold text-foreground">{t("notFound")}</p>
          <Link
            href="/orders"
            className="px-6 py-3 rounded-full bg-primary text-primary-foreground font-bold text-sm btn-press"
          >
            {t("backToOrders")}
          </Link>
        </div>
      </LayoutWrapper>
    );
  }

  const progress = computeOrderProgress(order, now);
  const { stepIndex, delivered, remainingSeconds, courierProgress, status } = progress;

  const remainingMin = Math.floor(remainingSeconds / 60);
  const remainingSec = remainingSeconds % 60;
  const etaLabel = remainingMin > 0
    ? t("etaMinutes", { minutes: remainingMin })
    : t("etaSeconds", { seconds: remainingSec });

  // Courier card visible while the order is being prepared or delivered.
  const showCourier = !delivered && (status === "preparing" || status === "on_the_way");
  const courierStatusKey = status === "on_the_way" ? "courierOnTheWay" : "courierPreparing";

  return (
    <LayoutWrapper showFooter={false}>
      <div className="px-4 max-w-[480px] mx-auto pt-3 pb-4 space-y-5">
        {/* ETA banner */}
        <div className="rounded-2xl bg-foreground px-5 py-5 text-center">
          <div className="flex items-center justify-center gap-2 mb-1">
            <Clock className="w-5 h-5 text-background/70" strokeWidth={1.75} />
            <span className="text-sm font-semibold text-background/70">{t("estimatedTime")}</span>
          </div>
          {delivered ? (
            <p className="text-3xl font-black text-background">{t("statusDelivered")}</p>
          ) : (
            <p className="text-4xl font-black text-background tabular-nums">{etaLabel}</p>
          )}
          <p className="text-sm text-background/60 mt-1">{t("orderNumber", { id: order.id })}</p>
        </div>

        {/* Live map with the moving courier */}
        <CourierMap progress={courierProgress} mapTitle={t("mapTitle")} />

        {/* Courier card (preparing / en route) */}
        {showCourier && (
          <div className="rounded-2xl border border-border p-4 flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
              <span className="text-lg font-black text-primary-foreground">{COURIER_NAME.charAt(0)}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-sm text-foreground truncate">{COURIER_NAME}</p>
              <p className="text-xs text-muted-foreground truncate">{t(courierStatusKey)}</p>
            </div>
            <a
              href={`tel:${COURIER_PHONE}`}
              aria-label={t("callCourier")}
              className="w-11 h-11 rounded-full bg-secondary flex items-center justify-center flex-shrink-0 btn-press"
            >
              <Phone className="w-5 h-5 text-foreground" strokeWidth={2} />
            </a>
          </div>
        )}

        {/* Status timeline */}
        <div className="rounded-2xl border border-border p-5">
          <p className="font-bold text-base text-foreground mb-5">{t("statusHeading")}</p>
          <div className="space-y-0">
            {statusSteps.map((step, idx) => {
              const done = idx <= stepIndex;
              const active = idx === stepIndex;
              const Icon = step.icon;
              return (
                <div key={step.key} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-colors",
                      done ? "bg-primary" : "bg-secondary",
                      active && !delivered && "ring-4 ring-primary/20"
                    )}>
                      <Icon className={cn("w-5 h-5", done ? "text-primary-foreground" : "text-muted-foreground")} strokeWidth={1.75} />
                    </div>
                    {idx < statusSteps.length - 1 && (
                      <div className={cn("w-0.5 h-8 mt-1 transition-colors", done && idx < stepIndex ? "bg-primary" : "bg-border")} />
                    )}
                  </div>
                  <div className="pb-8 pt-2">
                    <p className={cn("font-bold text-sm", done ? "text-foreground" : "text-muted-foreground")}>{t(step.labelKey)}</p>
                    {active && <p className="text-xs text-muted-foreground mt-0.5">{t(step.descKey)}</p>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Order items */}
        <div className="rounded-2xl border border-border p-4">
          <p className="font-bold text-sm text-foreground mb-3">{order.restaurantName}</p>
          {order.items.map((item, idx) => (
            <div key={idx} className="flex justify-between text-sm py-1">
              <span className="text-muted-foreground">{item.name} × {item.quantity}</span>
              <span className="font-semibold text-foreground">{fmt(item.price * item.quantity)}</span>
            </div>
          ))}
          <div className="pt-3 mt-2 border-t border-border flex justify-between font-bold">
            <span className="text-foreground">{t("total")}</span>
            <span className="text-foreground">{fmt(order.total)}</span>
          </div>
        </div>

        {/* Delivery address */}
        <div className="rounded-2xl border border-border p-4 flex items-start gap-3">
          <MapPin className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" strokeWidth={1.75} />
          <div>
            <p className="text-xs text-muted-foreground">{t("deliveryAddress")}</p>
            <p className="text-sm font-semibold text-foreground">{order.address}</p>
          </div>
        </div>
      </div>
    </LayoutWrapper>
  );
}
