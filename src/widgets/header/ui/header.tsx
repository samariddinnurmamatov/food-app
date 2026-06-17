"use client";
import { useCallback, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useRouter as useIntlRouter } from "@/navigation";
import { ArrowLeft, Bell, Trash2, MapPin, ChevronDown, Search, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useCart } from "@/context/CartContext";
import { useAddresses } from "@/context/AddressContext";
import { useAuth } from "@/context/AuthContext";
import { useNotifications } from "@/context/NotificationsContext";
import { cn, stripLocale } from "@/shared/lib/utils";
import { useDialog } from "@/shared/lib/useDialog";

interface HeaderConfig {
  type: "main" | "inner";
  titleKey?: string;
  rightSlot?: "bell" | "trash" | "theme" | "search" | null;
}

function resolveConfig(clean: string): HeaderConfig {
  if (clean === "/") return { type: "main", titleKey: undefined, rightSlot: "bell" };
  if (clean === "/categories") return { type: "main", titleKey: "search", rightSlot: null };
  if (clean === "/cart") return { type: "main", titleKey: "cart", rightSlot: "trash" };
  if (clean === "/favorites") return { type: "inner", titleKey: "favorites" };
  if (clean === "/profile") return { type: "main", titleKey: "profile", rightSlot: "theme" };
  if (clean === "/restaurants") return { type: "inner", titleKey: "restaurants" };
  if (clean === "/orders") return { type: "inner", titleKey: "orders" };
  if (clean === "/checkout") return { type: "inner", titleKey: "checkout" };
  if (clean === "/addresses") return { type: "inner", titleKey: "addresses" };
  if (clean === "/notifications") return { type: "inner", titleKey: "notifications" };
  if (clean === "/help") return { type: "inner", titleKey: "help" };
  if (clean === "/settings") return { type: "inner", titleKey: "settings" };
  if (clean.startsWith("/restaurant/")) return { type: "inner", titleKey: "restaurant" };
  if (clean.startsWith("/food/")) return { type: "inner", titleKey: "dish" };
  if (clean.startsWith("/order/")) return { type: "inner", titleKey: "tracking" };
  return { type: "inner", titleKey: "" };
}

export function Header() {
  const t = useTranslations("Header");
  const rawPath = usePathname();
  const router = useRouter();
  const intlRouter = useIntlRouter();
  const { clearCart } = useCart();
  const { defaultAddress } = useAddresses();
  const { user } = useAuth();
  const { unreadCount } = useNotifications();
  const clean = stripLocale(rawPath);
  const config = resolveConfig(clean);
  const title = config.titleKey ? t(config.titleKey) : "";
  const [showClearSheet, setShowClearSheet] = useState(false);
  const closeClearSheet = useCallback(() => setShowClearSheet(false), []);
  const { panelRef: clearPanelRef, initialFocusRef: clearCloseRef } =
    useDialog<HTMLDivElement, HTMLButtonElement>(showClearSheet, closeClearSheet);

  const confirmClearCart = () => {
    clearCart();
    setShowClearSheet(false);
  };

  return (
    <>
    <header className="sticky top-0 z-30 w-full bg-background border-b border-border">
      <div className={cn("flex items-center h-16 px-4 max-w-[480px] mx-auto gap-3")}>

        {config.type === "inner" ? (
          <>
            <button
              onClick={() => router.back()}
              className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center flex-shrink-0 btn-press"
              aria-label={t("back")}
            >
              <ArrowLeft className="w-5 h-5 text-foreground" strokeWidth={1.75} />
            </button>
            <h1 className="flex-1 font-bold text-lg text-foreground">{title}</h1>
          </>

        ) : clean === "/" ? (
          <>
            {/* Avatar — current user's initial → /profile (TMA: always present) */}
            <button
              onClick={() => intlRouter.push("/profile")}
              aria-label={t("profile")}
              className="w-10 h-10 rounded-2xl bg-primary flex items-center justify-center flex-shrink-0 btn-press"
            >
              <span className="text-primary-foreground font-black text-base leading-none">
                {(user.name.charAt(0) || "?").toUpperCase()}
              </span>
            </button>

            <div className="flex-1 flex flex-col items-center">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none">
                {t("delivery")}
              </p>
              <button
                onClick={() => intlRouter.push("/addresses")}
                aria-label={t("addresses")}
                className="flex items-center gap-1 mt-0.5 btn-press"
              >
                <MapPin className="w-3 h-3 text-foreground flex-shrink-0" strokeWidth={2} />
                <span className="font-bold text-sm text-foreground max-w-[180px] truncate">
                  {defaultAddress?.address ?? t("location")}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-foreground flex-shrink-0" strokeWidth={2} />
              </button>
            </div>

            <button
              onClick={() => intlRouter.push("/notifications")}
              className="relative w-10 h-10 rounded-full border border-border flex items-center justify-center flex-shrink-0 btn-press"
              aria-label={t("notifications")}
            >
              <Bell className="w-4 h-4 text-foreground" strokeWidth={1.75} />
              {unreadCount > 0 && (
                <span
                  className="absolute -top-1 -right-1 min-w-[16px] h-4 rounded-full bg-primary text-primary-foreground text-[9px] font-black flex items-center justify-center px-1 leading-none ring-2 ring-background"
                  aria-hidden="true"
                >
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>
          </>

        ) : (
          <>
            <h1 className="flex-1 font-black text-2xl text-foreground">{title}</h1>
            {config.rightSlot === "trash" && (
              <button
                onClick={() => setShowClearSheet(true)}
                className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center btn-press"
                aria-label={t("clearCart")}
              >
                <Trash2 className="w-5 h-5 text-foreground" strokeWidth={1.75} />
              </button>
            )}
            {config.rightSlot === "search" && (
              <button className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center btn-press" aria-label={t("search")}>
                <Search className="w-5 h-5 text-foreground" strokeWidth={1.75} />
              </button>
            )}
            {config.rightSlot === "theme" && <ThemeToggle />}
          </>
        )}
      </div>
    </header>

    {/* Clear-cart confirmation bottom sheet (replaces window.confirm) */}
    {showClearSheet && (
      <>
        <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setShowClearSheet(false)} />
        <div
          ref={clearPanelRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby="clear-cart-title"
          className="fixed bottom-0 left-0 right-0 z-50 bg-background rounded-t-3xl p-5 pb-safe-4 max-w-[480px] mx-auto shadow-2xl"
        >
          <div className="flex items-center justify-between mb-2">
            <h2 id="clear-cart-title" className="font-bold text-lg text-foreground">{t("clearCartConfirm")}</h2>
            <button
              ref={clearCloseRef}
              onClick={() => setShowClearSheet(false)}
              className="w-8 h-8 rounded-full border border-border flex items-center justify-center btn-press"
              aria-label={t("close")}
            >
              <X className="w-4 h-4 text-foreground" strokeWidth={1.75} />
            </button>
          </div>
          <div className="flex flex-col gap-2 mt-4">
            <button
              onClick={confirmClearCart}
              className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl border border-destructive/30 text-destructive text-sm font-bold btn-press"
            >
              <Trash2 className="w-4 h-4" strokeWidth={1.75} />
              {t("clearCartAction")}
            </button>
            <button
              onClick={() => setShowClearSheet(false)}
              className="w-full py-4 rounded-2xl bg-secondary text-foreground text-sm font-semibold btn-press"
            >
              {t("cancel")}
            </button>
          </div>
        </div>
      </>
    )}
    </>
  );
}
