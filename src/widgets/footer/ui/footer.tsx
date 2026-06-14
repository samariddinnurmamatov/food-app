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
      <div className="flex items-end max-w-[480px] mx-auto px-1 pt-2 pb-3">
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
              className="flex-1 flex flex-col items-center gap-1 btn-press"
            >
              <div className="relative">
                <Icon
                  className={cn(
                    "w-6 h-6 transition-colors",
                    isActive ? "text-foreground" : "text-muted-foreground"
                  )}
                  strokeWidth={isActive ? 2 : 1.5}
                />
                {isCart && totalItems > 0 && (
                  <span className="absolute -top-1 -right-1.5 min-w-[16px] h-4 rounded-full bg-primary text-primary-foreground text-[9px] font-black flex items-center justify-center px-1 leading-none">
                    {totalItems > 9 ? "9+" : totalItems}
                  </span>
                )}
              </div>
              <span
                className={cn(
                  "text-[10px] leading-none transition-colors",
                  isActive ? "font-bold text-foreground" : "font-medium text-muted-foreground"
                )}
              >
                {t(labelKey)}
              </span>
            </Link>
          );
        })}
      </div>
    </footer>
  );
}
