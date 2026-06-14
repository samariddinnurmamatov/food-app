"use client";
import type { ReactNode } from "react";
import { Header } from "@/widgets/header/ui/header";
import { Footer } from "@/widgets/footer/ui/footer";
import { cn } from "@/shared/lib/utils";

interface Props {
  children: ReactNode;
  showFooter?: boolean;
  className?: string;
}

export function LayoutWrapper({ children, showFooter = true, className }: Props) {
  return (
    <div className={cn("min-h-screen bg-background flex flex-col", className)}>
      <Header />
      <main className={cn("flex-1", showFooter && "pb-20")}>{children}</main>
      {showFooter && <Footer />}
    </div>
  );
}
