"use client";
import { Link } from "@/navigation";
import { ShoppingBag, ChevronRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { useCart } from "@/context/CartContext";
import { cn, fmt } from "@/shared/lib/utils";

interface Props {
  /** CTA label on the right side, e.g. "Order" / "Go to cart". */
  label: string;
  /**
   * When true the bar floats just above the bottom footer (home page).
   * When false it sits flush at the bottom of the viewport (restaurant/food
   * pages that have no footer).
   */
  aboveFooter?: boolean;
}

/**
 * Shared floating cart bar shown once the cart has items. Reads the cart
 * directly and renders nothing when empty, so callers can drop it in
 * unconditionally.
 */
export function FloatingCartBar({ label, aboveFooter = false }: Props) {
  const t = useTranslations("Home");
  const { totalItems, total } = useCart();
  if (totalItems === 0) return null;

  return (
    <div
      className={cn(
        "fixed left-0 right-0 z-30 px-4 pointer-events-none",
        aboveFooter ? "" : "bottom-0 pb-safe-4"
      )}
      style={
        aboveFooter
          ? { bottom: "calc(84px + env(safe-area-inset-bottom))" }
          : undefined
      }
    >
      <div className="max-w-[480px] mx-auto pointer-events-auto">
        <Link
          href="/cart"
          className="flex items-center justify-between gap-3 bg-primary text-primary-foreground rounded-2xl pl-3 pr-4 py-2.5 shadow-lg shadow-primary/30 btn-press"
        >
          <div className="flex items-center gap-2.5">
            <span className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-white/20">
              <ShoppingBag className="w-4 h-4" strokeWidth={2} />
              {/* Chip is always white in both themes → use the fixed dark red
                  (#c81e1e ≈ 5.74:1 on white) so contrast passes regardless of theme. */}
              <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full bg-white text-[#c81e1e] text-[9px] font-black flex items-center justify-center leading-none">
                {totalItems > 9 ? "9+" : totalItems}
              </span>
            </span>
            <div className="leading-tight text-left">
              <p className="text-[11px] text-primary-foreground/75 font-medium">{t("cartItems", { count: totalItems })}</p>
              <p className="font-black text-sm">{fmt(total)}</p>
            </div>
          </div>
          <span className="flex items-center gap-1 font-bold text-sm">
            {label}
            <ChevronRight className="w-4 h-4" strokeWidth={2.25} />
          </span>
        </Link>
      </div>
    </div>
  );
}
