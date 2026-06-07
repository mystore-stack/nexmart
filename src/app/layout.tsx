// src/app/layout.tsx — NexMart Moroccan Luxury (local fonts fallback)
import type { Metadata, Viewport } from "next";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { QueryProvider } from "@/components/providers/QueryProvider";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { Toaster } from "react-hot-toast";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { SearchModal } from "@/components/layout/SearchModal";
import dynamic from "next/dynamic";
import "./globals.css";

const AIChatWidget = dynamic(
  () => import("@/components/ai/AIChatWidget").then((m) => m.AIChatWidget),
  { ssr: false }
);

export const metadata: Metadata = {
  title: {
    default: "NexMart Maroc — Marketplace Premium",
    template: "%s | NexMart Maroc",
  },
  description:
    "NexMart est la marketplace premium du Maroc — shopping intelligent par IA, artisanat authentique, paiement sécurisé et livraison express.",
  keywords: ["marketplace maroc", "shopping premium maroc", "artisanat marocain", "ecommerce maroc", "nexmart"],
  authors: [{ name: "NexMart Maroc" }],
  creator: "NexMart",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://nexmart.ma"),
  alternates: { canonical: "/" },
  openGraph: {
    type: "website", locale: "fr_MA", url: "https://nexmart.ma", siteName: "NexMart Maroc",
    title: "NexMart Maroc — Marketplace Premium",
    description: "Shopping premium au Maroc avec recommandations IA et artisanat authentique.",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: "NexMart Maroc" }],
  },
  twitter: { card: "summary_large_image", title: "NexMart Maroc", creator: "@nexmart_ma" },
  robots: { index: true, follow: true },
  icons: { icon: "/favicon.ico", shortcut: "/favicon-16x16.png", apple: "/apple-touch-icon.png" },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F5F1E8" },
    { media: "(prefers-color-scheme: dark)", color: "#0F172A" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" dir="ltr" suppressHydrationWarning>
      <body className="font-sans antialiased">
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          <QueryProvider>
            <AuthProvider>
              <div className="flex min-h-screen flex-col">
                <Navbar />
                <main className="flex-1 page-enter">{children}</main>
                <Footer />
              </div>
              <CartDrawer />
              <SearchModal />
              {process.env.NEXT_PUBLIC_ENABLE_AI_CHAT !== "false" && <AIChatWidget />}
            </AuthProvider>
            <Toaster
              position="bottom-right"
              toastOptions={{
                duration: 3500,
                style: {
                  background: "var(--toast-bg, #0F172A)",
                  color: "var(--toast-fg, #F5F1E8)",
                  borderRadius: "14px",
                  padding: "14px 18px",
                  fontSize: "14px",
                  fontWeight: "600",
                  boxShadow: "0 20px 60px rgba(15,23,42,0.25), 0 2px 8px rgba(15,23,42,0.1)",
                  border: "1px solid rgba(212,175,55,0.18)",
                },
                success: { iconTheme: { primary: "#0F766E", secondary: "#fff" } },
                error: { iconTheme: { primary: "#ef4444", secondary: "#fff" } },
              }}
            />
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
