// src/app/layout.tsx — Dynamic database-driven layout
import type { Metadata, Viewport } from "next";
import dynamic from "next/dynamic";
import { QueryProvider } from "@/components/providers/QueryProvider";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { SiteConfigProvider } from "@/components/providers/SiteConfigProvider";
import { DynamicTheme } from "@/components/layout/DynamicTheme";
import { Toaster } from "react-hot-toast";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { AnnouncementBar } from "@/components/layout/AnnouncementBar";
import { SearchModal } from "@/components/layout/SearchModal";
import { getSiteConfigBundle, getSiteSettings } from "@/lib/cms/data";
import "./globals.css";

const ThemeProvider = dynamic(
  () => import("@/components/providers/ThemeProvider").then((mod) => ({ default: mod.ThemeProvider }))
);

const AIChatWidget = dynamic(
  () => import("@/components/ai/AIChatWidget").then((m) => m.AIChatWidget)
);

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  const siteUrl = settings.siteUrl || process.env.NEXT_PUBLIC_APP_URL || "https://nexmart.ma";

  return {
    title: {
      default: settings.seoTitle || settings.storeName,
      template: `%s | ${settings.storeName}`,
    },
    description: settings.seoDescription || undefined,
    keywords: settings.seoKeywords.length > 0 ? settings.seoKeywords : undefined,
    authors: [{ name: settings.storeName }],
    creator: settings.storeName,
    metadataBase: new URL(siteUrl),
    alternates: { canonical: "/" },
    openGraph: {
      type: "website",
      locale: settings.locale,
      url: siteUrl,
      siteName: settings.storeName,
      title: settings.seoTitle || settings.storeName,
      description: settings.seoDescription || undefined,
      images: settings.ogImageUrl
        ? [{ url: settings.ogImageUrl, width: 1200, height: 630, alt: settings.storeName }]
        : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: settings.seoTitle || settings.storeName,
      creator: settings.twitterHandle || undefined,
    },
    robots: { index: true, follow: true },
    icons: {
      icon: settings.faviconUrl || "/favicon.ico",
      shortcut: settings.faviconUrl || "/favicon-16x16.png",
      apple: "/apple-touch-icon.png",
    },
  };
}

export async function generateViewport(): Promise<Viewport> {
  const settings = await getSiteSettings();
  return {
    themeColor: [
      { media: "(prefers-color-scheme: light)", color: settings.themeColorLight },
      { media: "(prefers-color-scheme: dark)", color: settings.themeColorDark },
    ],
    width: "device-width",
    initialScale: 1,
    maximumScale: 5,
  };
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const siteConfig = await getSiteConfigBundle();
  const { settings } = siteConfig;

  return (
    <html lang="fr" dir="ltr" suppressHydrationWarning>
      <head>
        <DynamicTheme settings={settings} />
      </head>
      <body className="font-sans antialiased">
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          <QueryProvider>
            <AuthProvider>
              <SiteConfigProvider value={siteConfig}>
                <div className="flex min-h-screen flex-col">
                  <AnnouncementBar />
                  <Navbar />
                  <main className="flex-1 page-enter">{children}</main>
                  <Footer />
                </div>
                <CartDrawer />
                <SearchModal />
                {process.env.NEXT_PUBLIC_ENABLE_AI_CHAT !== "false" && <AIChatWidget />}
              </SiteConfigProvider>
            </AuthProvider>
            <Toaster
              position="bottom-right"
              toastOptions={{
                duration: 3500,
                style: {
                  background: settings.themeColorDark,
                  color: settings.themeColorLight,
                  borderRadius: "14px",
                  padding: "14px 18px",
                  fontSize: "14px",
                  fontWeight: "600",
                  boxShadow: "0 20px 60px rgba(15,23,42,0.25)",
                  border: `1px solid ${settings.secondaryColor}33`,
                },
                success: { iconTheme: { primary: settings.primaryColor, secondary: "#fff" } },
                error: { iconTheme: { primary: "#ef4444", secondary: "#fff" } },
              }}
            />
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
