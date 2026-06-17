import { Compass } from "lucide-react";
import { Link } from "@/navigation";
import { useTranslations } from "next-intl";

export default function NotFound() {
  const t = useTranslations("Error");

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-5 px-4 text-center">
      <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center">
        <Compass className="w-9 h-9 text-muted-foreground" strokeWidth={1.5} />
      </div>
      <div>
        <p className="font-black text-3xl text-foreground">404</p>
        <p className="font-bold text-lg text-foreground mt-1">{t("notFoundTitle")}</p>
        <p className="text-sm text-muted-foreground mt-1.5 max-w-[260px] mx-auto">
          {t("notFoundSubtitle")}
        </p>
      </div>
      <Link
        href="/"
        className="px-8 py-3.5 rounded-full bg-primary text-primary-foreground font-bold text-sm btn-press"
      >
        {t("backToHome")}
      </Link>
    </div>
  );
}
