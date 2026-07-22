// src/app/m/checkout/success/page.tsx — Order Success
import Link from "next/link";
import type { Metadata } from "next";
import { MobileLayout } from "@/components/mobile/MobileLayout";

export const metadata: Metadata = { title: "Order Placed" };

export default function SuccessPage() {
  return (
    <MobileLayout showNav={false}>
      <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
        <div className="w-20 h-20 rounded-full bg-green-50 flex items-center justify-center mb-6 text-5xl">
          ✓
        </div>
        <h1 className="font-display text-2xl font-semibold text-foreground mb-2">
          Order Placed!
        </h1>
        <p className="text-sm text-muted-foreground mb-8 leading-relaxed">
          Thank you for your order. We&apos;ll send you a confirmation email shortly with tracking information.
        </p>

        <div className="bg-muted rounded-2xl p-5 w-full mb-8 text-left">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
            What&apos;s next?
          </p>
          <ul className="space-y-2 text-sm">
            <li className="flex items-start gap-2">
              <span className="text-primary font-bold mt-0.5">1</span>
              <span className="text-muted-foreground">We&apos;ll confirm your order and prepare it for shipment</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary font-bold mt-0.5">2</span>
              <span className="text-muted-foreground">You&apos;ll receive tracking info within 24 hours</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary font-bold mt-0.5">3</span>
              <span className="text-muted-foreground">Your order will arrive in 3–5 business days</span>
            </li>
          </ul>
        </div>

        <div className="flex flex-col gap-3 w-full">
          <Link href="/m" className="btn btn-primary h-11 justify-center text-sm">
            Back to Home
          </Link>
          <Link href="/m/products" className="btn btn-outline h-11 justify-center text-sm">
            Continue Shopping
          </Link>
        </div>
      </div>
    </MobileLayout>
  );
}
