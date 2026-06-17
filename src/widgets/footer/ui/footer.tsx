"use client";
import { Link, usePathname } from "@/navigation";
import { Home, Search, ShoppingBag, Receipt, User } from "lucide-react";
import { useTranslations } from "next-intl";
import { useCart } from "@/context/CartContext";
import { cn, stripLocale } from "@/shared/lib/utils";

const tabs = [
  { href: "/", icon: Home, labelKey: "home" },
  { href: "/categories", icon: Search, labelKey: "search" },
  { href: "/cart", icon: ShoppingBag, labelKey: "cart" },
  { href: "/orders", icon: Receipt, labelKey: "orders" },
  { href: "/profile", icon: User, labelKey: "profile" },
];

export function Footer() {
  const t = useTranslations("Footer");
  const pathname = usePathname();
  const { totalItems } = useCart();
  const clean = stripLocale(pathname);

  return (
    <footer className="fixed bottom-0 left-0 right-0 z-30 bg-background border-t border-border">
      <div className="flex items-stretch max-w-[480px] mx-auto px-1 pt-2 pb-3 pb-safe">
        {tabs.map(({ href, icon: Icon, labelKey }) => {
          const isActive =
            href === "/"
              ? clean === "/"
              : clean === href ||
                clean.startsWith(href + "/") ||
                // order detail pages belong to the Orders tab
                (href === "/orders" && clean.startsWith("/order/"));
          const isCart = href === "/cart";

          return (
            <Link
              key={href}
              href={href}
              aria-current={isActive ? "page" : undefined}
              className="relative flex-1 flex flex-col items-center gap-1 pt-1 btn-press"
            >
              {/* Active indicator: rounded top bar */}
              <span
                className={cn(
                  "absolute top-0 h-1 w-8 rounded-full bg-primary transition-all duration-200",
                  isActive ? "opacity-100 scale-100" : "opacity-0 scale-50"
                )}
              />
              <div className="flex flex-col items-center gap-1 px-3 py-1.5">
                <div className="relative">
                  <Icon
                    className={cn(
                      "transition-all",
                      isActive ? "w-[26px] h-[26px] text-primary" : "w-6 h-6 text-muted-foreground"
                    )}
                    strokeWidth={isActive ? 2.5 : 1.75}
                    fill={isActive ? "currentColor" : "none"}
                    fillOpacity={isActive ? 0.12 : 0}
                  />
                  {isCart && totalItems > 0 && (
                    <span className="absolute -top-1 -right-1.5 min-w-[16px] h-4 rounded-full bg-primary text-primary-foreground text-[9px] font-black flex items-center justify-center px-1 leading-none ring-2 ring-background">
                      {totalItems > 9 ? "9+" : totalItems}
                    </span>
                  )}
                </div>
                <span
                  className={cn(
                    "text-[10px] leading-none transition-colors",
                    isActive ? "font-bold text-primary" : "font-medium text-muted-foreground"
                  )}
                >
                  {t(labelKey)}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </footer>
  );
}
