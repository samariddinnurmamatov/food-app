"use client";
import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { Header } from "@/widgets/header/ui/header";
import { Footer } from "@/widgets/footer/ui/footer";
import { resolveChrome } from "@/shared/lib/chrome";

// Persistent app shell, rendered ONCE in the locale layout. The Header and
// Footer stay mounted across route changes (only `children` — the page — swaps),
// so navigation never remounts/flickers the chrome. Visibility per route is
// resolved from the pathname via the shared chrome matrix, reproducing the old
// per-page LayoutWrapper behavior exactly.
//
// Content spacing (top under the sticky header is handled by the page's own
// `pt-*`; bottom above the fixed footer) is provided by LayoutWrapper, which the
// pages still wrap their content in. The shell only owns the persistent chrome.
export function AppShell({ children }: { children: ReactNode }) {
  const rawPath = usePathname();
  const { showHeader, showFooter } = resolveChrome(rawPath);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {showHeader && <Header />}
      {children}
      {showFooter && <Footer />}
    </div>
  );
}
