import { stripLocale } from "@/shared/lib/utils";

// Single source of truth for which app chrome each route shows. Used by the
// persistent AppShell (to decide what to mount) AND by LayoutWrapper (for the
// matching content spacing). Mirrors the pre-shell per-page behavior EXACTLY:
//   - full-bleed detail pages (restaurant/[id], food/[id]) → NO header, NO footer
//     (they render their own floating back button)
//   - showFooter={false} routes (restaurants, checkout, addresses, settings,
//     order/[id]) → shared header, NO footer
//   - everything else → shared header + footer

export interface RouteChrome {
  showHeader: boolean;
  showFooter: boolean;
}

// Routes that are full-bleed: no shared header and no footer.
function isFullBleed(clean: string): boolean {
  return clean.startsWith("/restaurant/") || clean.startsWith("/food/");
}

// Routes that show the header but hide the footer.
function isFooterless(clean: string): boolean {
  return (
    clean === "/restaurants" ||
    clean === "/checkout" ||
    clean === "/addresses" ||
    clean === "/settings" ||
    clean.startsWith("/order/")
  );
}

// Resolve chrome from a raw (possibly locale-prefixed) pathname.
export function resolveChrome(rawPath: string): RouteChrome {
  const clean = stripLocale(rawPath);
  if (isFullBleed(clean)) return { showHeader: false, showFooter: false };
  if (isFooterless(clean)) return { showHeader: true, showFooter: false };
  return { showHeader: true, showFooter: true };
}
