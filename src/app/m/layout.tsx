// src/app/m/layout.tsx — Mobile app shell
import type { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  title: { default: "NexMart", template: "%s | NexMart" },
  description: "NexMart — Premium Moroccan marketplace.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function MobileRootLayout({ children }: { children: React.ReactNode }) {
  // Outer shell: centers the 390px frame on desktop, fills on mobile
  return (
    <div className="mx-auto w-full max-w-[430px] min-h-screen bg-background shadow-luxury-lg">
      {children}
    </div>
  );
}
