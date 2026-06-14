"use client";
import { LayoutWrapper } from "@/shared/ui/layout-wrapper";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useTheme } from "next-themes";
import { Check } from "lucide-react";
import { useRouter } from "@/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { cn } from "@/shared/lib/utils";

const languages = [
  { code: "uz", labelKey: "langUz", flag: "🇺🇿" },
  { code: "ru", labelKey: "langRu", flag: "🇷🇺" },
  { code: "en", labelKey: "langEn", flag: "🇬🇧" },
];

export default function SettingsPage() {
  const t = useTranslations("Settings");
  const { theme } = useTheme();
  const router = useRouter();
  const locale = useLocale();
  const [mounted, setMounted] = useState(false);
  const [activeLang, setActiveLang] = useState(locale);

  useEffect(() => setMounted(true), []);

  const handleLang = (code: string) => {
    setActiveLang(code);
    router.replace("/settings", { locale: code });
  };

  return (
    <LayoutWrapper showFooter={false}>
      <div className="px-4 max-w-[480px] mx-auto pt-3 pb-4 space-y-5">
        {/* Theme */}
        <div className="rounded-2xl border border-border p-4">
          <p className="font-bold text-base text-foreground mb-4">{t("theme")}</p>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-sm text-foreground">
                {mounted ? (theme === "dark" ? t("darkMode") : t("lightMode")) : "..."}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {mounted ? (theme === "dark" ? t("darkModeEnabled") : t("lightModeEnabled")) : ""}
              </p>
            </div>
            <ThemeToggle />
          </div>
        </div>

        {/* Language */}
        <div className="rounded-2xl border border-border p-4">
          <p className="font-bold text-base text-foreground mb-4">{t("language")}</p>
          <div className="space-y-2">
            {languages.map(({ code, labelKey, flag }) => (
              <button
                key={code}
                onClick={() => handleLang(code)}
                className={cn(
                  "w-full flex items-center gap-3 p-3 rounded-xl border transition-all btn-press",
                  activeLang === code ? "border-foreground bg-secondary" : "border-border"
                )}
              >
                <span className="text-xl">{flag}</span>
                <span className="flex-1 text-sm font-semibold text-foreground text-left">{t(labelKey)}</span>
                {activeLang === code && <Check className="w-4 h-4 text-foreground" strokeWidth={2} />}
              </button>
            ))}
          </div>
        </div>

        {/* App info */}
        <div className="rounded-2xl border border-border p-4 space-y-3">
          <p className="font-bold text-base text-foreground">{t("appInfo")}</p>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">{t("version")}</span>
            <span className="font-semibold text-foreground">1.0.0</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">{t("appName")}</span>
            <span className="font-semibold text-foreground">Food App</span>
          </div>
        </div>
      </div>
    </LayoutWrapper>
  );
}
