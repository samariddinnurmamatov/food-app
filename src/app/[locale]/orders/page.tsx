"use client";
import { LayoutWrapper } from "@/shared/ui/layout-wrapper";
import { orders, restaurants } from "@/mock/data";
import { Clock, ChevronRight, Package } from "lucide-react";
import { Link } from "@/navigation";
import { useState } from "react";
import { cn, fmt, fmtDate } from "@/shared/lib/utils";
import { useTranslations } from "next-intl";
import type { Order } from "@/types";

const statusLabelKey: Record<Order["status"], string> = {
  pending: "statusPending",
  preparing: "statusPreparing",
  on_the_way: "statusOnTheWay",
  delivered: "statusDelivered",
  cancelled: "statusCancelled",
};

const statusColor: Record<Order["status"], string> = {
  pending: "text-primary",
  preparing: "text-primary",
  on_the_way: "text-primary",
  delivered: "text-muted-foreground",
  cancelled: "text-destructive",
};

function getRestaurantHref(restaurantName: string): string {
  const r = restaurants.find((r) => r.name === restaurantName);
  return r ? `/restaurant/${r.id}` : "/";
}

export default function OrdersPage() {
  const t = useTranslations("Orders");
  const [tab, setTab] = useState<"active" | "history">("active");

  const active = orders.filter((o) => ["pending", "preparing", "on_the_way"].includes(o.status));
  const history = orders.filter((o) => ["delivered", "cancelled"].includes(o.status));
  const list = tab === "active" ? active : history;

  return (
    <LayoutWrapper>
      <div className="px-4 max-w-[480px] mx-auto pt-3 pb-6">
        {/* Tabs */}
        <div className="flex gap-2 p-1 bg-secondary rounded-2xl mb-4">
          <button
            onClick={() => setTab("active")}
            className={cn("flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all btn-press",
              tab === "active" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground")}
          >
            {t("tabActive")} {active.length > 0 && `(${active.length})`}
          </button>
          <button
            onClick={() => setTab("history")}
            className={cn("flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all btn-press",
              tab === "history" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground")}
          >
            {t("tabHistory")}
          </button>
        </div>

        {list.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
            <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center">
              <Package className="w-7 h-7 text-muted-foreground" strokeWidth={1.5} />
            </div>
            <div>
              <p className="font-bold text-foreground">{t("emptyTitle")}</p>
              <p className="text-sm text-muted-foreground mt-1">
                {tab === "active" ? t("emptyActive") : t("emptyHistory")}
              </p>
            </div>
            <Link href="/" className="px-6 py-3 rounded-full bg-primary text-primary-foreground font-bold text-sm btn-press">
              {t("placeOrder")}
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {list.map((order) => (
              <div key={order.id} className="rounded-2xl border border-border bg-card p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-secondary overflow-hidden flex-shrink-0">
                    {order.restaurantImage && (
                      <img src={order.restaurantImage} alt={order.restaurantName} className="w-full h-full object-cover" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm text-card-foreground">{order.restaurantName}</p>
                    <div className="flex items-center gap-1 mt-0.5">
                      <Clock className="w-3 h-3 text-muted-foreground" strokeWidth={1.75} />
                      <span className="text-xs text-muted-foreground">{fmtDate(order.createdAt)}</span>
                    </div>
                  </div>
                  <span className={cn("text-xs font-bold", statusColor[order.status])}>
                    {t(statusLabelKey[order.status])}
                  </span>
                </div>

                <div className="text-sm text-muted-foreground mb-3 line-clamp-2">
                  {order.items.map((item, i) => (
                    <span key={i}>{item.name} × {item.quantity}{i < order.items.length - 1 ? ", " : ""}</span>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-border">
                  <span className="font-bold text-sm text-card-foreground">{fmt(order.total)}</span>
                  {["pending", "preparing", "on_the_way"].includes(order.status) ? (
                    <Link
                      href={`/order/${order.id}`}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-primary text-primary-foreground text-xs font-bold btn-press"
                    >
                      {t("track")} <ChevronRight className="w-3.5 h-3.5" strokeWidth={2} />
                    </Link>
                  ) : (
                    <Link
                      href={getRestaurantHref(order.restaurantName)}
                      className="px-3 py-1.5 rounded-xl border border-border text-xs font-semibold text-foreground btn-press"
                    >
                      {t("reorder")}
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </LayoutWrapper>
  );
}
