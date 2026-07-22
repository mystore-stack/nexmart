"use client";
// src/app/m/checkout/CheckoutPageClient.tsx
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MobileLayout } from "@/components/mobile/MobileLayout";
import { useCartStore } from "@/store/cart";
import { cn } from "@/utils/cn";

type PaymentMethod = "CASH_ON_DELIVERY" | "STRIPE";
type Step = "address" | "payment" | "review";

interface AddressForm {
  name: string;
  phone: string;
  line1: string;
  city: string;
  zip: string;
}

export function CheckoutPageClient() {
  const router = useRouter();
  const { items, getSubtotal, getDiscount, getTotal, clearCart } = useCartStore();

  const [step, setStep]   = useState<Step>("address");
  const [method, setMethod] = useState<PaymentMethod>("CASH_ON_DELIVERY");
  const [placing, setPlacing] = useState(false);
  const [address, setAddress] = useState<AddressForm>({
    name: "", phone: "", line1: "", city: "", zip: "",
  });

  const subtotal = getSubtotal();
  const discount = getDiscount();
  const total    = getTotal();
  const shipping = total > 500 ? 0 : 39;
  const grandTotal = total + shipping;

  const addressValid =
    address.name && address.phone && address.line1 && address.city;

  const handlePlaceOrder = async () => {
    setPlacing(true);
    // In production: call POST /api/orders with cart + address + paymentMethod
    await new Promise((r) => setTimeout(r, 1200)); // simulate network
    clearCart();
    router.push("/m/checkout/success");
  };

  if (items.length === 0) {
    return (
      <MobileLayout>
        <div className="flex flex-col items-center justify-center py-24 px-6 text-center">
          <h2 className="font-display text-xl font-semibold text-foreground mb-4">Nothing to checkout</h2>
          <Link href="/m" className="btn btn-primary btn-md text-sm">Back to Home</Link>
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout showNav={false}>
      {/* Header */}
      <header className="flex items-center gap-3 px-4 py-4 sticky top-0 z-30 bg-background/95 backdrop-blur border-b border-border">
        <Link href="/m/cart" className="w-8 h-8 rounded-full bg-muted flex items-center justify-center" aria-label="Back">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <h1 className="font-display text-xl font-semibold text-foreground">Checkout</h1>
      </header>

      {/* Step indicator */}
      <div className="flex items-center gap-1 px-4 py-3 border-b border-border">
        {(["address", "payment", "review"] as Step[]).map((s, i) => (
          <div key={s} className="flex items-center gap-1 flex-1">
            <div className={cn(
              "w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold flex-shrink-0",
              step === s ? "bg-primary text-primary-foreground"
                : (["address", "payment", "review"].indexOf(step) > i)
                  ? "bg-primary/20 text-primary"
                  : "bg-muted text-muted-foreground"
            )}>
              {i + 1}
            </div>
            <span className={cn("text-[11px] font-semibold capitalize",
              step === s ? "text-foreground" : "text-muted-foreground")}>
              {s}
            </span>
            {i < 2 && <div className="flex-1 h-px bg-border mx-1" />}
          </div>
        ))}
      </div>

      <div className="px-4 py-5 pb-36 space-y-5">

        {/* ── Step 1: Address ── */}
        {step === "address" && (
          <div className="space-y-4">
            <h2 className="font-display text-lg font-semibold text-foreground">Delivery Address</h2>
            {(["name", "phone", "line1", "city", "zip"] as (keyof AddressForm)[]).map((field) => (
              <div key={field}>
                <label className="block text-xs font-semibold text-muted-foreground mb-1.5 capitalize">
                  {field === "line1" ? "Address" : field}
                  {field !== "zip" && " *"}
                </label>
                <input
                  type={field === "phone" ? "tel" : "text"}
                  value={address[field]}
                  onChange={(e) => setAddress((a) => ({ ...a, [field]: e.target.value }))}
                  placeholder={PLACEHOLDERS[field]}
                  className="input-luxury w-full text-sm"
                />
              </div>
            ))}
            <button onClick={() => setStep("payment")}
              disabled={!addressValid}
              className="btn btn-primary w-full h-11 justify-center text-sm mt-2">
              Continue to Payment
            </button>
          </div>
        )}

        {/* ── Step 2: Payment ── */}
        {step === "payment" && (
          <div className="space-y-4">
            <h2 className="font-display text-lg font-semibold text-foreground">Payment Method</h2>
            {([
              { id: "CASH_ON_DELIVERY", label: "Cash on Delivery", desc: "Pay when you receive", icon: "💵" },
              { id: "STRIPE", label: "Credit / Debit Card", desc: "Secure payment via Stripe", icon: "💳" },
            ] as { id: PaymentMethod; label: string; desc: string; icon: string }[]).map((opt) => (
              <button key={opt.id} onClick={() => setMethod(opt.id)}
                className={cn(
                  "w-full flex items-center gap-3 p-4 rounded-2xl border transition-colors text-left",
                  method === opt.id
                    ? "border-primary bg-primary/5"
                    : "border-border bg-background hover:border-primary/40"
                )}>
                <span className="text-2xl">{opt.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground">{opt.label}</p>
                  <p className="text-xs text-muted-foreground">{opt.desc}</p>
                </div>
                <div className={cn(
                  "w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center",
                  method === opt.id ? "border-primary bg-primary" : "border-border"
                )}>
                  {method === opt.id && (
                    <div className="w-2 h-2 rounded-full bg-primary-foreground" />
                  )}
                </div>
              </button>
            ))}

            <div className="flex gap-3 mt-2">
              <button onClick={() => setStep("address")}
                className="btn btn-outline flex-1 h-11 text-sm justify-center">
                Back
              </button>
              <button onClick={() => setStep("review")}
                className="btn btn-primary flex-1 h-11 text-sm justify-center">
                Review Order
              </button>
            </div>
          </div>
        )}

        {/* ── Step 3: Review ── */}
        {step === "review" && (
          <div className="space-y-5">
            <h2 className="font-display text-lg font-semibold text-foreground">Order Review</h2>

            {/* Address summary */}
            <div className="card-luxury rounded-2xl p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Delivery</p>
                <button onClick={() => setStep("address")} className="text-xs text-primary font-semibold">Edit</button>
              </div>
              <p className="text-sm font-semibold text-foreground">{address.name}</p>
              <p className="text-xs text-muted-foreground">{address.line1}, {address.city}</p>
              <p className="text-xs text-muted-foreground">{address.phone}</p>
            </div>

            {/* Payment summary */}
            <div className="card-luxury rounded-2xl p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Payment</p>
                <button onClick={() => setStep("payment")} className="text-xs text-primary font-semibold">Edit</button>
              </div>
              <p className="text-sm font-semibold text-foreground">
                {method === "CASH_ON_DELIVERY" ? "💵 Cash on Delivery" : "💳 Credit / Debit Card"}
              </p>
            </div>

            {/* Items summary */}
            <div className="card-luxury rounded-2xl p-4 space-y-3">
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Items ({items.length})</p>
              {items.map((item) => (
                <div key={item.id} className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                    <img src={item.product.images[0]} alt={item.product.name}
                      className="w-full h-full object-cover" loading="lazy" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-foreground truncate">{item.product.name}</p>
                    <p className="text-[11px] text-muted-foreground">Qty {item.quantity}</p>
                  </div>
                  <p className="text-xs font-bold text-foreground flex-shrink-0">
                    {((item.variant?.price ?? item.product.price) * item.quantity).toLocaleString("fr-MA")} MAD
                  </p>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="card-luxury rounded-2xl p-4 space-y-2 text-sm">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal</span><span>{subtotal.toLocaleString("fr-MA")} MAD</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount</span><span>-{discount.toLocaleString("fr-MA")} MAD</span>
                </div>
              )}
              <div className="flex justify-between text-muted-foreground">
                <span>Shipping</span>
                <span>{shipping === 0 ? <span className="text-green-600 font-semibold">Free</span> : `${shipping} MAD`}</span>
              </div>
              <div className="border-t border-border pt-2 flex justify-between font-bold text-foreground text-base">
                <span>Total</span><span>{grandTotal.toLocaleString("fr-MA")} MAD</span>
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setStep("payment")}
                className="btn btn-outline flex-1 h-11 text-sm justify-center">
                Back
              </button>
              <button onClick={handlePlaceOrder} disabled={placing}
                className={cn("btn btn-primary flex-1 h-11 text-sm justify-center", placing && "opacity-70")}>
                {placing ? "Placing…" : "Place Order"}
              </button>
            </div>
          </div>
        )}
      </div>
    </MobileLayout>
  );
}

const PLACEHOLDERS: Record<string, string> = {
  name: "Full name", phone: "+212 6XX XXX XXX",
  line1: "Street address", city: "City", zip: "Postal code",
};
