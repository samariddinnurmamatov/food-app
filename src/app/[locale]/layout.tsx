import type React from "react";
import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "../../styles/globals.css";
import { getLocale, getMessages } from "next-intl/server";
import { NextIntlClientProvider } from "next-intl";
import { ThemeProvider } from "@/components/ThemeProvider";
import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import { FavoritesProvider } from "@/context/FavoritesContext";
import { OrdersProvider } from "@/context/OrdersContext";
import { AddressProvider } from "@/context/AddressContext";
import { NotificationsProvider } from "@/context/NotificationsContext";
import { AppShell } from "@/shared/ui/app-shell";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
const siteDescription =
  "Food App — Toshkentdagi eng yaxshi restoranlardan mazali taomlarni tez va qulay buyurtma qiling. Yetkazib berish bir necha daqiqada.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Food App — Mazali taomlarni buyurtma qiling",
    template: "%s · Food App",
  },
  description: siteDescription,
  applicationName: "Food App",
  keywords: [
    "ovqat yetkazib berish",
    "taom buyurtma",
    "restoran",
    "Toshkent",
    "food delivery",
    "Food App",
  ],
  authors: [{ name: "Food App" }],
  creator: "Food App",
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    siteName: "Food App",
    title: "Food App — Mazali taomlarni buyurtma qiling",
    description: siteDescription,
    locale: "uz_UZ",
    url: siteUrl,
  },
  twitter: {
    card: "summary",
    title: "Food App — Mazali taomlarni buyurtma qiling",
    description: siteDescription,
  },
};

export const viewport: Viewport = {
  // Match the theme background per color scheme so the iOS status/URL bar
  // tint blends with the app chrome.
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
  // Let content extend under the notch / home indicator so env(safe-area-*)
  // insets resolve to real values for the .pb-safe utilities.
  viewportFit: "cover",
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const locale = await getLocale();
  const messages = await getMessages({ locale });

  return (
    <html lang={locale} suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          <NextIntlClientProvider messages={messages}>
            <AuthProvider>
              <CartProvider>
                <FavoritesProvider>
                  <OrdersProvider>
                    <AddressProvider>
                      <NotificationsProvider>
                        <AppShell>{children}</AppShell>
                      </NotificationsProvider>
                    </AddressProvider>
                  </OrdersProvider>
                </FavoritesProvider>
              </CartProvider>
            </AuthProvider>
          </NextIntlClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
