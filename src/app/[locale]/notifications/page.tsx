"use client";
import { LayoutWrapper } from "@/shared/ui/layout-wrapper";
import { Bell, Package, Tag, Store } from "lucide-react";
import { Link } from "@/navigation";
import { useTranslations } from "next-intl";
import type { LucideIcon } from "lucide-react";
import { useNotifications, type NotificationType } from "@/context/NotificationsContext";

// Icon per notification kind. Copy itself lives in the Notifications namespace
// (titleKey/bodyKey/timeKey on each notification) and is translated below.
const ICONS: Record<NotificationType, LucideIcon> = {
  order: Package,
  promo: Tag,
  restaurant: Store,
};

export default function NotificationsPage() {
  const t = useTranslations("Notifications");
  const { notifications, unreadCount, markAllRead, markRead } = useNotifications();

  return (
    <LayoutWrapper>
      <div className="px-4 max-w-[480px] mx-auto pt-3 pb-6">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-5 text-center">
            <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center">
              <Bell className="w-9 h-9 text-muted-foreground" strokeWidth={1.5} />
            </div>
            <div>
              <p className="font-bold text-lg text-foreground">{t("emptyTitle")}</p>
              <p className="text-sm text-muted-foreground mt-1.5 max-w-[220px] mx-auto">
                {t("emptyHint")}
              </p>
            </div>
            <Link
              href="/restaurants"
              className="px-8 py-3.5 rounded-full bg-primary text-primary-foreground font-bold text-sm btn-press"
            >
              {t("browse")}
            </Link>
          </div>
        ) : (
          <>
            {unreadCount > 0 && (
              <div className="flex justify-end mb-3">
                <button
                  onClick={markAllRead}
                  className="text-xs font-semibold text-primary-strong btn-press"
                >
                  {t("markAllRead")}
                </button>
              </div>
            )}
            <div className="space-y-3">
              {notifications.map((n) => {
                const Icon = ICONS[n.type];
                return (
                  <button
                    key={n.id}
                    type="button"
                    onClick={() => markRead(n.id)}
                    className="w-full text-left flex gap-3 p-4 rounded-2xl border border-border bg-card btn-press"
                  >
                    <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center flex-shrink-0">
                      <Icon className="w-5 h-5 text-foreground" strokeWidth={1.75} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start gap-2">
                        <p className="flex-1 font-bold text-sm text-card-foreground">
                          {t(n.titleKey, n.params)}
                        </p>
                        {!n.read && (
                          <span
                            className="mt-1 w-2 h-2 rounded-full bg-primary flex-shrink-0"
                            aria-hidden="true"
                          />
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mt-0.5 leading-relaxed">
                        {t(n.bodyKey, n.params)}
                      </p>
                      <p className="text-xs text-muted-foreground/70 mt-1.5">{t(n.timeKey)}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </>
        )}
      </div>
    </LayoutWrapper>
  );
}
