"use client";
import { useEffect } from "react";
import { AlertTriangle, RotateCw } from "lucide-react";
import { Link } from "@/navigation";
import { useTranslations } from "next-intl";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations("Error");

  useEffect(() => {
    // Surface the error for debugging; replace with real reporting in prod.
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-5 px-4 text-center">
      <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center">
        <AlertTriangle className="w-9 h-9 text-muted-foreground" strokeWidth={1.5} />
      </div>
      <div>
        <p className="font-bold text-lg text-foreground">{t("title")}</p>
        <p className="text-sm text-muted-foreground mt-1.5 max-w-[260px] mx-auto">
          {t("subtitle")}
        </p>
      </div>
      <div className="flex flex-col items-center gap-2.5 w-full max-w-[260px]">
        <button
          onClick={() => reset()}
          className="w-full flex items-center justify-center gap-2 px-8 py-3.5 rounded-full bg-primary text-primary-foreground font-bold text-sm btn-press"
        >
          <RotateCw className="w-4 h-4" strokeWidth={2} />
          {t("retry")}
        </button>
        <Link
          href="/"
          className="text-sm font-semibold text-muted-foreground btn-press"
        >
          {t("backToHome")}
        </Link>
      </div>
    </div>
  );
}
