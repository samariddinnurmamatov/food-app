"use client";
import type { ReactNode } from "react";
import { cn } from "@/shared/lib/utils";

interface Props {
  children: ReactNode;
  showFooter?: boolean;
  className?: string;
}

// Content spacing wrapper. The persistent Header/Footer now live in <AppShell>
// (mounted once in the locale layout) so they no longer remount on navigation.
// LayoutWrapper just supplies the page's <main> — reserving bottom space for the
// fixed footer when this route shows one (showFooter). The top is handled by the
// sticky header in normal flow + each page's own `pt-*`.
export function LayoutWrapper({ children, showFooter = true, className }: Props) {
  return (
    <main className={cn("flex-1", showFooter && "pb-20", className)}>
      {children}
    </main>
  );
}
