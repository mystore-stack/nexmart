// src/app/layout.tsx
import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans, Cormorant_Garamond } from "next/font/google";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { QueryProvider } from "@/components/providers/QueryProvider";
import { Toaster } from "react-hot-toast";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { SearchModal } from "@/components/layout/SearchModal";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-display",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "NexMart — السوق الإلكتروني المغربي الأول | الأول في المغرب",
    template: "%s | NexMart Maroc",
  },
  description:
    "NexMart — La marketplace e-commerce premium du Maroc. Achetez et vendez des millions de produits. Livraison rapide partout au Maroc avec Amana, Chrono Diali et Jibli.",
  keywords: [
    "e-commerce maroc", "marketplace maroc", "acheter en ligne maroc",
    "vendre en ligne maroc", "livraison maroc", "artisanat marocain",
    "shopping maroc", "boutique en ligne maroc", "avito maroc", "shopify maroc"
  ],
  authors: [{ name: "NexMart Maroc" }],
  creator: "NexMart",
  publisher: "NexMart SARL",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://nexmart.ma"),
  alternates: {
    canonical: "/",
    languages: {
      "fr-MA": "/fr",
      "ar-MA": "/ar",
    },
  },
  openGraph: {
    type: "website",
    locale: "fr_MA",
    alternateLocale: "ar_MA",
    url: "https://nexmart.ma",
    siteName: "NexMart Maroc",
    title: "NexMart — Marketplace Premium du Maroc 🇲🇦",
    description: "Achetez et vendez des millions de produits. Livraison rapide partout au Maroc.",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: "NexMart Maroc" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "NexMart Maroc 🇲🇦",
    description: "La marketplace premium du Maroc",
    images: ["/og-image.jpg"],
    creator: "@nexmart_ma",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
  category: "e-commerce",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#faf8f5" },
    { media: "(prefers-color-scheme: dark)", color: "#0d0b08" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" dir="ltr" suppressHydrationWarning>
      <body className={`${jakarta.variable} ${cormorant.variable} font-sans antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          <QueryProvider>
            <div className="flex min-h-screen flex-col">
              <Navbar />
              <main className="flex-1 page-enter">{children}</main>
              <Footer />
            </div>

            {/* Global overlays */}
            <CartDrawer />
            <SearchModal />

            <Toaster
              position="bottom-right"
              toastOptions={{
                duration: 3500,
                style: {
                  background: "var(--toast-bg, #1a1209)",
                  color: "var(--toast-fg, #f5ede0)",
                  borderRadius: "12px",
                  padding: "14px 18px",
                  fontSize: "14px",
                  fontWeight: "600",
                  boxShadow: "0 8px 40px rgba(0,0,0,0.25), 0 2px 8px rgba(0,0,0,0.1)",
                  border: "1px solid rgba(200,137,58,0.2)",
                },
                success: { iconTheme: { primary: "#C8893A", secondary: "#fff" } },
                error: { iconTheme: { primary: "#ef4444", secondary: "#fff" } },
              }}
            />
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
