"use client";
import type { Category } from "@/types";
import {
  UtensilsCrossed, Beef, PieChart, Gift, Fish, Soup, Coffee, Salad,
  Pizza, Sandwich,
  type LucideIcon,
} from "lucide-react";
import { Link } from "@/navigation";
import { cn } from "@/shared/lib/utils";
import { useTranslations } from "next-intl";

const iconMap: Record<string, LucideIcon> = {
  UtensilsCrossed, Beef, PieChart, Gift, Fish, Soup, Coffee, Salad, Pizza, Sandwich,
};

interface Props {
  category: Category;
  size?: "sm" | "md";
  active?: boolean;
}

export function CategoryCard({ category, size = "md", active = false }: Props) {
  const t = useTranslations("CategoryCard");
  const Icon = iconMap[category.icon] ?? UtensilsCrossed;

  if (size === "sm") {
    return (
      <Link
        href={`/categories?cat=${category.id}`}
        className="flex flex-col items-center gap-2 flex-shrink-0"
      >
        <div
          className={cn(
            "w-16 h-16 rounded-2xl flex items-center justify-center transition-all",
            active ? "bg-primary" : "bg-secondary"
          )}
        >
          <Icon
            className={cn("w-7 h-7", active ? "text-primary-foreground" : "text-foreground")}
            strokeWidth={1.75}
          />
        </div>
        <span className="text-xs font-semibold text-foreground text-center leading-tight max-w-[64px] truncate">
          {category.name}
        </span>
      </Link>
    );
  }

  return (
    <Link
      href={`/categories?cat=${category.id}`}
      className={cn(
        "flex flex-col items-center gap-3 p-4 rounded-2xl border transition-all",
        active ? "border-foreground bg-secondary" : "border-border"
      )}
    >
      <div className="w-14 h-14 rounded-2xl bg-secondary flex items-center justify-center">
        <Icon className="w-7 h-7 text-foreground" strokeWidth={1.75} />
      </div>
      <div className="text-center">
        <p className="text-sm font-bold text-foreground">{category.name}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{t("itemsCount", { count: category.count })}</p>
      </div>
    </Link>
  );
}
