"use client";
import { LayoutWrapper } from "@/shared/ui/layout-wrapper";
import { getOrderById } from "@/mock/data";
import { CheckCircle, Clock, ChefHat, Bike, MapPin } from "lucide-react";
import { use } from "react";
import { cn, fmt } from "@/shared/lib/utils";
import { useTranslations } from "next-intl";

const statusSteps = [
  { key: "pending",    labelKey: "statusPending",   icon: CheckCircle, descKey: "descPending" },
  { key: "preparing",  labelKey: "statusPreparing", icon: ChefHat,     descKey: "descPreparing" },
  { key: "on_the_way", labelKey: "statusOnTheWay",  icon: Bike,        descKey: "descOnTheWay" },
  { key: "delivered",  labelKey: "statusDelivered", icon: MapPin,      descKey: "descDelivered" },
];

const statusIndex: Record<string, number> = {
  pending: 0, preparing: 1, on_the_way: 2, delivered: 3,
};

export default function OrderTrackingPage({ params }: { params: Promise<{ id: string }> }) {
  const t = useTranslations("OrderDetail");
  const { id } = use(params);
  const order = getOrderById(id) ?? {
    id,
    restaurantName: "Restoran",
    restaurantImage: "",
    items: [],
    total: 0,
    status: "on_the_way" as const,
    createdAt: new Date().toISOString(),
    address: "Chilonzor 12-kvartal, 5-uy",
  };

  const currentStep = statusIndex[order.status] ?? 2;

  return (
    <LayoutWrapper showFooter={false}>
      <div className="px-4 max-w-[480px] mx-auto pt-3 pb-4 space-y-5">
        {/* ETA banner */}
        <div className="rounded-2xl bg-foreground px-5 py-5 text-center">
          <div className="flex items-center justify-center gap-2 mb-1">
            <Clock className="w-5 h-5 text-background/70" strokeWidth={1.75} />
            <span className="text-sm font-semibold text-background/70">{t("estimatedTime")}</span>
          </div>
          <p className="text-4xl font-black text-background">{t("etaMinutes", { minutes: 25 })}</p>
          <p className="text-sm text-background/60 mt-1">{t("orderNumber", { id: order.id })}</p>
        </div>

        {/* Status timeline */}
        <div className="rounded-2xl border border-border p-5">
          <p className="font-bold text-base text-foreground mb-5">{t("statusHeading")}</p>
          <div className="space-y-0">
            {statusSteps.map((step, idx) => {
              const done = idx <= currentStep;
              const active = idx === currentStep;
              const Icon = step.icon;
              return (
                <div key={step.key} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0",
                      done ? "bg-primary" : "bg-secondary"
                    )}>
                      <Icon className={cn("w-5 h-5", done ? "text-primary-foreground" : "text-muted-foreground")} strokeWidth={1.75} />
                    </div>
                    {idx < statusSteps.length - 1 && (
                      <div className={cn("w-0.5 h-8 mt-1", done && idx < currentStep ? "bg-primary" : "bg-border")} />
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

        {/* Map placeholder */}
        <div className="h-48 rounded-2xl bg-secondary flex flex-col items-center justify-center gap-2 border border-border">
          <MapPin className="w-8 h-8 text-muted-foreground" strokeWidth={1.5} />
          <p className="text-sm text-muted-foreground">{t("mapComingSoon")}</p>
          <p className="text-xs text-muted-foreground">{order.address}</p>
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
      </div>
    </LayoutWrapper>
  );
}
