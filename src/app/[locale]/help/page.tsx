"use client";
import { LayoutWrapper } from "@/shared/ui/layout-wrapper";
import { ChevronDown, MessageCircle, Phone } from "lucide-react";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { cn } from "@/shared/lib/utils";

const FAQ_KEYS = [
  { q: "q1", a: "a1" },
  { q: "q2", a: "a2" },
  { q: "q3", a: "a3" },
  { q: "q4", a: "a4" },
] as const;

// Placeholder contact channels (no real secrets).
const TELEGRAM_URL = "https://t.me/foodapp_support";
const SUPPORT_PHONE = "+998901234567";

export default function HelpPage() {
  const t = useTranslations("Help");
  const [open, setOpen] = useState<string | null>(null);

  const toggle = (q: string) => setOpen((cur) => (cur === q ? null : q));

  return (
    <LayoutWrapper>
      <div className="px-4 max-w-[480px] mx-auto pt-3 pb-6 space-y-5">
        {/* FAQ */}
        <div>
          <h2 className="font-bold text-base text-foreground mb-2">{t("faqHeading")}</h2>
          <div className="rounded-2xl border border-border overflow-hidden">
            {FAQ_KEYS.map(({ q, a }, idx) => {
              const isOpen = open === q;
              return (
                <div
                  key={q}
                  className={idx < FAQ_KEYS.length - 1 ? "border-b border-border" : ""}
                >
                  <button
                    onClick={() => toggle(q)}
                    aria-expanded={isOpen}
                    className="w-full flex items-center gap-3 px-4 py-4 text-left hover:bg-secondary transition-colors btn-press"
                  >
                    <span className="flex-1 font-semibold text-sm text-foreground">{t(q)}</span>
                    <ChevronDown
                      className={cn(
                        "w-4 h-4 text-muted-foreground flex-shrink-0 transition-transform",
                        isOpen && "rotate-180"
                      )}
                      strokeWidth={1.75}
                    />
                  </button>
                  {isOpen && (
                    <p className="px-4 pb-4 -mt-1 text-sm text-muted-foreground leading-relaxed">
                      {t(a)}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Contact */}
        <div>
          <h2 className="font-bold text-base text-foreground mb-2">{t("contactHeading")}</h2>
          <div className="rounded-2xl border border-border overflow-hidden">
            <a
              href={TELEGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 px-4 py-4 border-b border-border hover:bg-secondary transition-colors btn-press"
            >
              <div className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center flex-shrink-0">
                <MessageCircle className="w-4 h-4 text-foreground" strokeWidth={1.75} />
              </div>
              <span className="flex-1 font-semibold text-sm text-foreground">{t("contactTelegram")}</span>
            </a>
            <a
              href={`tel:${SUPPORT_PHONE}`}
              className="flex items-center gap-3 px-4 py-4 hover:bg-secondary transition-colors btn-press"
            >
              <div className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center flex-shrink-0">
                <Phone className="w-4 h-4 text-foreground" strokeWidth={1.75} />
              </div>
              <div className="flex-1 min-w-0">
                <span className="font-semibold text-sm text-foreground block">{t("contactPhone")}</span>
                <span className="text-xs text-muted-foreground">{SUPPORT_PHONE}</span>
              </div>
            </a>
          </div>
        </div>
      </div>
    </LayoutWrapper>
  );
}
