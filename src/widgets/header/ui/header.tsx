"use client";
import { usePathname, useRouter } from "next/navigation";
import { ArrowLeft, Bell, Trash2, MapPin, ChevronDown, Search } from "lucide-react";
import { useTranslations } from "next-intl";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useCart } from "@/context/CartContext";
import { cn, stripLocale } from "@/shared/lib/utils";

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
  const { clearCart } = useCart();
  const clean = stripLocale(rawPath);
  const config = resolveConfig(clean);
  const title = config.titleKey ? t(config.titleKey) : "";

  return (
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
            {/* Avatar — rounded square, design ga mos */}
            <div className="w-10 h-10 rounded-2xl bg-primary flex items-center justify-center flex-shrink-0">
              <span className="text-primary-foreground font-black text-sm leading-none">AK</span>
            </div>

            <div className="flex-1 flex flex-col items-center">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none">
                {t("delivery")}
              </p>
              <button className="flex items-center gap-1 mt-0.5 btn-press">
                <MapPin className="w-3 h-3 text-foreground flex-shrink-0" strokeWidth={2} />
                <span className="font-bold text-sm text-foreground">{t("location")}</span>
                <ChevronDown className="w-3.5 h-3.5 text-foreground" strokeWidth={2} />
              </button>
            </div>

            <button
              className="w-10 h-10 rounded-full border border-border flex items-center justify-center flex-shrink-0 btn-press"
              aria-label={t("notifications")}
            >
              <Bell className="w-4 h-4 text-foreground" strokeWidth={1.75} />
            </button>
          </>

        ) : (
          <>
            <h1 className="flex-1 font-black text-2xl text-foreground">{title}</h1>
            {config.rightSlot === "trash" && (
              <button
                onClick={() => { if (confirm(t("clearCartConfirm"))) clearCart(); }}
                className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center btn-press"
              >
                <Trash2 className="w-5 h-5 text-foreground" strokeWidth={1.75} />
              </button>
            )}
            {config.rightSlot === "search" && (
              <button className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center btn-press">
                <Search className="w-5 h-5 text-foreground" strokeWidth={1.75} />
              </button>
            )}
            {config.rightSlot === "theme" && <ThemeToggle />}
          </>
        )}
      </div>
    </header>
  );
}
