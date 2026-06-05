"use client";
// src/app/checkout/page.tsx
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { Check, ChevronRight, Lock, CreditCard, Truck, MapPin, Tag, ArrowLeft, Sparkles, ShieldCheck } from "lucide-react";
import { useCartStore } from "@/store/cart";
import { useAuthStore } from "@/store/index";
import { formatPrice } from "@/utils/format";
import Image from "next/image";
import Link from "next/link";
import toast from "react-hot-toast";
import type { Address, Order } from "@/types";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

const STEPS = ["Address", "Payment", "Review"] as const;
type Step = typeof STEPS[number];
type PaymentMethod = Order["paymentMethod"];

const PAYMENT_OPTIONS: Array<{
  value: PaymentMethod;
  label: string;
  sub: string;
  icon: typeof CreditCard;
}> = [
  { value: "STRIPE", label: "Credit / Debit Card", sub: "Secure payment via Stripe", icon: CreditCard },
  { value: "CASH_ON_DELIVERY", label: "Cash on Delivery", sub: "Pay when your order arrives", icon: Truck },
];

interface PaymentStepProps {
  method: PaymentMethod;
  onMethodChange: (method: PaymentMethod) => void;
  clientSecret: string;
  paymentIntentId: string;
  grandTotal: number;
  onNext: () => void;
  onStripeSuccess: () => void;
  onBack: () => void;
  creatingPaymentIntent: boolean;
}

interface ReviewStepProps {
  items: any[];
  paymentMethod: PaymentMethod;
  grandTotal: number;
  loading: boolean;
  onBack: () => void;
  onPlace: () => void;
}

interface AddressStepProps {
  addresses: Address[];
  selected: string;
  onSelect: (id: string) => void;
  onNext: () => void;
}

interface StripePaymentFormProps {
  onSuccess: () => void;
  paymentIntentId: string;
  grandTotal: number;
}

export default function CheckoutPage() {
  const { items, getSubtotal, getDiscount, coupon, applyCoupon, removeCoupon } = useCartStore();
  const { user } = useAuthStore();
  const router = useRouter();

  const [step, setStep] = useState<Step>("Address");
  const [addresses, setAddresses] = useState<any[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("STRIPE");
  const [clientSecret, setClientSecret] = useState<string>("");
  const [paymentIntentId, setPaymentIntentId] = useState<string>("");
  const [paymentIntentAmount, setPaymentIntentAmount] = useState<number | null>(null);
  const [pendingOrderNumber, setPendingOrderNumber] = useState<string>("");
  const [creatingPaymentIntent, setCreatingPaymentIntent] = useState(false);
  const [couponInput, setCouponInput] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);
  const [orderLoading, setOrderLoading] = useState(false);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [shippingCost, setShippingCost] = useState(30);
  const [shippingCarrierId, setShippingCarrierId] = useState("jibli");

  const subtotal = getSubtotal();
  const discount = getDiscount();
  const tax = 0;
  const grandTotal = subtotal - discount + shippingCost + tax;

  useEffect(() => {
    if (!user) { router.push("/login?from=/checkout"); return; }
    if (items.length === 0) { router.push("/cart"); return; }

    fetch("/api/auth/addresses")
      .then((r) => r.json())
      .then((d) => {
        if (d.data) {
          setAddresses(d.data);
          const def = d.data.find((a: any) => a.isDefault);
          if (def) setSelectedAddress(def.id);
        }
      })
      .catch(() => {});
  }, [user, items, router]);

  useEffect(() => {
    const addr = addresses.find((a: any) => a.id === selectedAddress);
    if (!addr?.city) return;
    fetch("/api/shipping/calculate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ city: addr.city, subtotal }),
    })
      .then((r) => r.json())
      .then((d) => {
        if (d.success && d.options?.length) {
          const pick = d.options.find((o: any) => o.id === shippingCarrierId) || d.options[0];
          setShippingCarrierId(pick.id);
          setShippingCost(pick.price);
        }
      })
      .catch(() => {});
  }, [selectedAddress, addresses, subtotal, shippingCarrierId]);

  const handleCoupon = async () => {
    if (!couponInput.trim()) return;
    setCouponLoading(true);
    try {
      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: couponInput, subtotal }),
      });
      const data = await res.json();
      if (data.success) {
        applyCoupon(data.data);
        setCouponInput("");
      } else {
        toast.error(data.error || "Invalid coupon");
      }
    } finally {
      setCouponLoading(false);
    }
  };

  const handlePaymentMethodChange = async (method: PaymentMethod) => {
    if (!method) {
      toast.error("Please select a payment method");
      return;
    }
    setPaymentMethod(method);
    if (method === "STRIPE" && (!clientSecret || paymentIntentAmount !== grandTotal)) {
      setCreatingPaymentIntent(true);
      try {
        const res = await fetch("/api/payments/create-intent-from-cart", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ amount: grandTotal, currency: "mad" }),
        });
        const data = await res.json();
        if (data.success && data.clientSecret) {
          setClientSecret(data.clientSecret);
          setPaymentIntentId(data.paymentIntentId);
          setPaymentIntentAmount(grandTotal);
        } else {
          toast.error(data.error || "Failed to initialize payment");
          setClientSecret("");
          setPaymentIntentId("");
          setPaymentIntentAmount(null);
          setPaymentMethod("CASH_ON_DELIVERY");
        }
      } catch (error) {
        console.error("Payment intent creation error:", error);
        toast.error("Failed to initialize payment");
        setClientSecret("");
        setPaymentIntentId("");
        setPaymentIntentAmount(null);
        setPaymentMethod("CASH_ON_DELIVERY");
      } finally {
        setCreatingPaymentIntent(false);
      }
    }
  };

  useEffect(() => {
    if (
      step !== "Payment" ||
      paymentMethod !== "STRIPE" ||
      creatingPaymentIntent ||
      (clientSecret && paymentIntentAmount === grandTotal)
    ) {
      return;
    }

    void handlePaymentMethodChange("STRIPE");
  }, [step, paymentMethod, clientSecret, paymentIntentAmount, grandTotal, creatingPaymentIntent]);

  const placeOrder = async () => {
    // Prevent duplicate submissions
    if (isPlacingOrder) {
      toast.error("Order is already being placed. Please wait.");
      return;
    }

    const addr = addresses.find((a: any) => a.id === selectedAddress);
    if (!selectedAddress || !addr?.city) {
      toast.error("Veuillez sélectionner une adresse de livraison");
      return;
    }
    if (!paymentMethod) {
      toast.error("Veuillez sélectionner un moyen de paiement");
      setStep("Payment");
      return;
    }
    if (paymentMethod === "STRIPE" && !paymentIntentId) {
      toast.error("Paiement non complété. Veuillez compléter le paiement d'abord.");
      setStep("Payment");
      return;
    }
    if (items.length === 0) {
      toast.error("Votre panier est vide");
      router.push("/cart");
      return;
    }

    setIsPlacingOrder(true);
    setOrderLoading(true);
    
    try {
      console.log("Placing order with:", {
        paymentMethod,
        paymentIntentId,
        itemCount: items.length,
        total: grandTotal,
      });

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          addressId: selectedAddress,
          paymentMethod,
          city: addr.city,
          shippingCarrierId,
          shippingCost,
          items: items.map((i) => ({
            productId: i.productId,
            variantId: i.variantId,
            quantity: i.quantity,
          })),
          couponCode: coupon?.code,
          stripePaymentId: paymentMethod === "STRIPE" ? paymentIntentId : undefined,
        }),
      });
      
      const data = await res.json();
      console.log("Order API response:", data);
      
      if (!data.success) {
        // Handle cart cleanup required error
        if (data.code === "CART_CLEANUP_REQUIRED") {
          toast.error(data.error || "Some products in your cart are no longer available. Please refresh your cart.");
          
          // Call cleanup endpoint to remove invalid items
          try {
            const cleanupRes = await fetch("/api/cart", {
              method: "DELETE",
            });
            const cleanupData = await cleanupRes.json();
            console.log("Cart cleanup response:", cleanupData);
            
            if (cleanupData.success && cleanupData.removedCount > 0) {
              // Refresh cart from database
              const cartRes = await fetch("/api/cart");
              const cartData = await cartRes.json();
              
              if (cartData.success && cartData.items) {
                // Clear local cart and sync with database
                useCartStore.getState().clearCart();
                
                // Rebuild cart from database items
                cartData.items.forEach((dbItem: any) => {
                  useCartStore.getState().addItem(
                    dbItem.product,
                    dbItem.quantity,
                    dbItem.variant || undefined
                  );
                });
                
                toast.success(`Removed ${cleanupData.removedCount} unavailable item(s) from your cart.`);
                
                // Redirect to cart page to review
                setTimeout(() => {
                  router.push("/cart");
                }, 1500);
              }
            }
          } catch (cleanupError) {
            console.error("Cart cleanup error:", cleanupError);
            toast.error("Failed to clean up cart. Please refresh the page.");
          }
          return;
        }
        
        toast.error(data.error || "Échec de la création de commande");
        return;
      }

      const order = data.order;
      setPendingOrderNumber(order.orderNumber);
      
      // Clear cart after successful order
      useCartStore.getState().clearCart();
      
      // Redirect to order success page
      router.push(`/orders/${order.orderNumber}?success=true`);
    } catch (error) {
      console.error("Order placement error:", error);
      toast.error("Échec de la commande. Veuillez réessayer.");
    } finally {
      setOrderLoading(false);
      setIsPlacingOrder(false);
    }
  };

  const currentStepIndex = STEPS.indexOf(step);

  return (
    <div className="min-h-screen bg-surface page-enter">
      <div className="border-b border-border bg-background/80 backdrop-blur-xl">
        <div className="container-main py-4">
          <div className="flex items-center justify-between">
            <Link href="/cart" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="w-4 h-4" />
              Back to Cart
            </Link>
            <div className="flex items-center gap-1 text-sm font-bold">
              <div className="w-8 h-8 bg-gradient-to-br from-violet-600 to-sky-500 rounded-xl flex items-center justify-center text-white">
                <Sparkles className="h-4 w-4" />
              </div>
              NexMart
            </div>
            <div className="flex items-center gap-1 text-xs font-bold text-muted-foreground">
              <Lock className="w-3.5 h-3.5" />
              Secure Checkout
            </div>
          </div>
        </div>
      </div>

      <div className="container-main py-8">
        {/* Step indicators */}
        <div className="flex items-center justify-center mb-8">
          {STEPS.map((s, i) => (
            <React.Fragment key={s}>
              <button
                onClick={() => i < currentStepIndex && setStep(s)}
                className={`flex items-center gap-2 text-sm font-medium transition-all ${
                  s === step ? "text-foreground" : i < currentStepIndex ? "text-brand-600 cursor-pointer" : "text-muted-foreground cursor-default"
                }`}
              >
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${
                  i < currentStepIndex
                    ? "bg-gradient-to-r from-violet-600 to-indigo-600 border-violet-600 text-white"
                    : s === step
                    ? "bg-foreground border-foreground text-background shadow-lg"
                    : "border-border text-muted-foreground"
                }`}>
                  {i < currentStepIndex ? <Check className="w-3.5 h-3.5" /> : i + 1}
                </div>
                <span className="hidden sm:block">{s}</span>
              </button>
              {i < STEPS.length - 1 && (
                <div className={`h-1 rounded-full w-12 sm:w-20 mx-2 transition-all ${i < currentStepIndex ? "bg-gradient-to-r from-violet-600 to-sky-500" : "bg-border"}`} />
              )}
            </React.Fragment>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left: Step content */}
          <div className="lg:col-span-2">
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                {step === "Address" && (
                  <AddressStep
                    addresses={addresses}
                    selected={selectedAddress}
                    onSelect={setSelectedAddress}
                    onNext={() => setStep("Payment")}
                  />
                )}
                {step === "Payment" && (
                  <PaymentStep
                    method={paymentMethod}
                    onMethodChange={handlePaymentMethodChange}
                    clientSecret={clientSecret}
                    paymentIntentId={paymentIntentId}
                    grandTotal={grandTotal}
                    onNext={() => {
                      if (!paymentMethod) {
                        toast.error("Please select a payment method");
                        return;
                      }
                      if (paymentMethod === "STRIPE") {
                        toast.error("Veuillez payer par carte avant de finaliser la commande.");
                        return;
                      }
                      setStep("Review");
                    }}
                    onStripeSuccess={() => {
                      // Payment confirmed, now create the order
                      placeOrder();
                    }}
                    onBack={() => setStep("Address")}
                    creatingPaymentIntent={creatingPaymentIntent}
                  />
                )}
                {step === "Review" && (
                  <ReviewStep
                    items={items}
                    paymentMethod={paymentMethod}
                    grandTotal={grandTotal}
                    loading={orderLoading}
                    onBack={() => setStep("Payment")}
                    onPlace={() => placeOrder()}
                  />
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Right: Order summary */}
          <div className="lg:col-span-1">
            <div className="card-luxury p-6 sticky top-24 space-y-5">
              <div className="rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 p-4 text-white">
                <div className="flex items-center gap-3">
                  <ShieldCheck className="h-5 w-5" />
                  <div>
                    <p className="text-sm font-black">Protected checkout</p>
                    <p className="text-xs text-white/70">Encrypted payment and buyer support.</p>
                  </div>
                </div>
              </div>
              <h2 className="font-bold text-lg">Order Summary</h2>

              {/* Items */}
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center gap-3">
                    <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-muted flex-shrink-0">
                      <Image
                        src={item.product.images[0] || "/placeholder.jpg"}
                        alt={item.product.name}
                        fill
                        className="object-cover"
                        sizes="56px"
                      />
                      <span className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                        {item.quantity}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium line-clamp-1">{item.product.name}</p>
                      {item.variant && (
                        <p className="text-xs text-muted-foreground">{item.variant.label}</p>
                      )}
                    </div>
                    <p className="text-sm font-bold flex-shrink-0">
                      {formatPrice((item.variant?.price ?? item.product.price) * item.quantity)}
                    </p>
                  </div>
                ))}
              </div>

              {/* Coupon */}
              <div className="space-y-2">
                {coupon ? (
                  <div className="flex items-center justify-between p-3 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                    <div className="flex items-center gap-2">
                      <Tag className="w-4 h-4 text-green-600" />
                      <span className="text-sm font-medium text-green-700 dark:text-green-400">{coupon.code}</span>
                    </div>
                    <button onClick={removeCoupon} className="text-xs text-green-600 hover:text-green-800 font-medium">Remove</button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                      placeholder="Coupon code"
                      className="input py-2 text-sm flex-1"
                      onKeyDown={(e) => e.key === "Enter" && handleCoupon()}
                    />
                    <button
                      onClick={handleCoupon}
                      disabled={couponLoading || !couponInput}
                      className="btn btn-outline btn-sm"
                    >
                      {couponLoading ? "..." : "Apply"}
                    </button>
                  </div>
                )}
              </div>

              {/* Totals */}
              <div className="space-y-2 text-sm border-t border-border pt-4">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span>-{formatPrice(discount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-muted-foreground">
                  <span>Shipping</span>
                  <span>{shippingCost === 0 ? "FREE" : formatPrice(shippingCost)}</span>
                </div>
                <div className="flex justify-between font-bold text-base pt-2 border-t border-border">
                  <span>Total</span>
                  <span>{formatPrice(grandTotal)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Sub-components ──────────────────────────────────────────

function AddressStep({ addresses, selected, onSelect, onNext }: AddressStepProps) {
  // UI-only shipping form (does not affect existing saved-address + shipping calculation flow)
  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    streetAddress: "",
    city: "",
    postalCode: "",
    country: "Maroc",
  });

  return (
    <div className="bg-card border border-zinc-200 rounded-2xl p-6 space-y-6">
      <div className="flex items-center gap-3">
        <MapPin className="w-5 h-5 text-brand-500" />
        <h2 className="text-xl font-bold">Shipping Address</h2>
      </div>

      {/* Saved addresses selection */}
      {addresses.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground mb-4">No saved addresses. Add one to continue.</p>
          <Link href="/account/addresses/new?from=/checkout" className="btn btn-primary">
            Add Address
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {addresses.map((addr: any) => (
            <button
              key={addr.id}
              onClick={() => onSelect(addr.id)}
              className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                selected === addr.id ? "border-foreground bg-foreground/5" : "border-zinc-200 hover:border-foreground/30"
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`w-5 h-5 rounded-full border-2 mt-0.5 flex-shrink-0 flex items-center justify-center ${
                    selected === addr.id ? "border-foreground bg-foreground" : "border-muted-foreground"
                  }`}
                >
                  {selected === addr.id && <div className="w-2 h-2 rounded-full bg-background" />}
                </div>
                <div>
                  <p className="font-semibold text-sm">
                    {addr.name} · {addr.phone}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {addr.line1}
                    {addr.line2 ? `, ${addr.line2}` : ""}, {addr.city}, {addr.state} {addr.zip}, {addr.country}
                  </p>
                  {addr.isDefault && (
                    <span className="badge badge-brand text-[10px] mt-1">Default</span>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Amazon/Shopify-like shipping form (non-breaking UI-only) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <p className="text-sm font-semibold text-foreground">Enter your delivery details</p>
          <p className="text-xs text-muted-foreground">You can select a saved address above.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label htmlFor="fullName" className="text-sm font-medium">Full Name</label>
            <input
              id="fullName"
              type="text"
              value={form.fullName}
              onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))}
              placeholder="Mohammed El Amrani"
              autoComplete="name"
              className="input h-11 md:h-12"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="phone" className="text-sm font-medium">Phone Number</label>
            <input
              id="phone"
              type="tel"
              value={form.phone}
              onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
              placeholder="+212 6 12 34 56 78"
              autoComplete="tel"
              className="input h-11 md:h-12"
              required
            />
          </div>

          <div className="space-y-1.5 md:col-span-2">
            <label htmlFor="streetAddress" className="text-sm font-medium">Street Address</label>
            <input
              id="streetAddress"
              type="text"
              value={form.streetAddress}
              onChange={(e) => setForm((f) => ({ ...f, streetAddress: e.target.value }))}
              placeholder="Rue de l&apos;Oasis, Bloc B, Appt 12"
              autoComplete="street-address"
              className="input h-11 md:h-12"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="city" className="text-sm font-medium">City</label>
            <input
              id="city"
              type="text"
              value={form.city}
              onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
              placeholder="Casablanca"
              autoComplete="address-level2"
              className="input h-11 md:h-12"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="postalCode" className="text-sm font-medium">Postal Code</label>
            <input
              id="postalCode"
              type="text"
              value={form.postalCode}
              onChange={(e) => setForm((f) => ({ ...f, postalCode: e.target.value }))}
              placeholder="20000"
              autoComplete="postal-code"
              inputMode="numeric"
              className="input h-11 md:h-12"
            />
          </div>

          <div className="space-y-1.5 md:col-span-2">
            <label htmlFor="country" className="text-sm font-medium">Country</label>
            <input
              id="country"
              type="text"
              value={form.country}
              onChange={(e) => setForm((f) => ({ ...f, country: e.target.value }))}
              placeholder="Maroc"
              autoComplete="country-name"
              className="input h-11 md:h-12"
              required
            />
          </div>
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <Link href="/account/addresses/new?from=/checkout" className="btn btn-outline btn-sm">
          + Add New Address
        </Link>
        <button
          onClick={onNext}
          disabled={!selected}
          className="btn btn-primary flex-1 justify-center"
        >
          Continue to Payment
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

function PaymentStep({ method, onMethodChange, clientSecret, paymentIntentId, grandTotal, onNext, onStripeSuccess, onBack, creatingPaymentIntent }: PaymentStepProps) {
  return (
    <div className="rounded-2xl border border-gold-200/30 dark:border-gold-800/20 bg-white dark:bg-card p-6 space-y-6">
      <div className="flex items-center gap-3">
        <CreditCard className="w-5 h-5 text-brand-500" />
        <h2 className="text-xl font-bold">Payment Method</h2>
      </div>

      <div className="space-y-3">
        {PAYMENT_OPTIONS.map(({ value, label, sub, icon: Icon }) => (
          <button
            key={value}
            onClick={() => onMethodChange(value)}
            className={`w-full text-left p-4 rounded-xl border-2 transition-all flex items-center gap-4 ${
              method === value ? "border-foreground bg-foreground/5" : "border-border hover:border-foreground/30"
            }`}
          >
            <div className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${
              method === value ? "border-foreground bg-foreground" : "border-muted-foreground"
            }`}>
              {method === value && <div className="w-2 h-2 rounded-full bg-background" />}
            </div>
            <Icon className="w-5 h-5 text-muted-foreground" />
            <div>
              <p className="font-semibold text-sm">{label}</p>
              <p className="text-xs text-muted-foreground">{sub}</p>
            </div>
          </button>
        ))}
      </div>

      {method === "STRIPE" && (
        <div className="p-4 rounded-xl border border-border bg-muted/30">
          <div className="mb-4 rounded-lg bg-background p-3 text-sm">
            <p className="font-semibold">Secure payment</p>
            <p className="text-muted-foreground">Amount due: {formatPrice(grandTotal)}</p>
          </div>
          {creatingPaymentIntent ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-foreground"></div>
              <span className="ml-3 text-sm text-muted-foreground">Initializing payment...</span>
            </div>
          ) : clientSecret ? (
            <Elements stripe={stripePromise} options={{ clientSecret }}>
              <StripePaymentForm 
                onSuccess={onStripeSuccess} 
                paymentIntentId={paymentIntentId}
                grandTotal={grandTotal}
              />
            </Elements>
          ) : (
            <div className="text-center py-8 text-muted-foreground text-sm">
              Select payment method above to continue
            </div>
          )}
        </div>
      )}

      <div className="flex gap-3 pt-2">
        <button onClick={onBack} className="btn btn-outline btn-sm px-5">
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
        <button 
          onClick={onNext} 
          className="btn btn-primary flex-1 justify-center"
          disabled={creatingPaymentIntent || method === "STRIPE"}
        >
          {creatingPaymentIntent ? (
            <span className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-background"></div>
              Processing...
            </span>
          ) : method === "STRIPE" ? (
            <span className="flex items-center gap-2">
              Pay with card above
            </span>
          ) : (
            <span className="flex items-center gap-2">
              Review Order
              <ChevronRight className="w-4 h-4" />
            </span>
          )}
        </button>
      </div>
    </div>
  );
}

function StripePaymentForm({ onSuccess, paymentIntentId, grandTotal }: StripePaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!stripe || !elements) {
      toast.error("Stripe non chargé. Veuillez rafraîchir la page.");
      return;
    }
    if (!paymentIntentId) {
      toast.error("Intent de paiement non trouvé. Veuillez réessayer.");
      return;
    }
    setLoading(true);
    try {
      console.log("Confirming payment with intent ID:", paymentIntentId);
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        redirect: "if_required",
        confirmParams: {
          return_url: `${window.location.origin}/checkout`,
        },
      });
      
      console.log("Payment confirmation result:", { error, paymentIntent });
      
      if (error) {
        toast.error(error.message || "Échec du paiement");
      } else if (paymentIntent?.status === "succeeded") {
        console.log("Payment succeeded, calling onSuccess");
        toast.success("Paiement réussi!");
        onSuccess();
      } else if (paymentIntent?.status === "processing") {
        toast.error("Le paiement est en cours de traitement. Veuillez patienter.");
      } else {
        toast.error("Paiement non complété");
      }
    } catch (error) {
      console.error("Stripe payment error:", error);
      toast.error("Une erreur s'est produite lors du paiement. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <PaymentElement />
      <button
        onClick={handleSubmit}
        disabled={!stripe || !elements || loading || !paymentIntentId}
        className={`btn btn-brand w-full justify-center ${loading ? "loading" : ""}`}
      >
        {loading ? <span className="opacity-0">Traitement...</span> : "Payer " + formatPrice(grandTotal)}
      </button>
    </div>
  );
}

function ReviewStep({ items, paymentMethod, grandTotal, loading, onBack, onPlace }: ReviewStepProps) {
  return (
    <div className="rounded-2xl border border-gold-200/30 dark:border-gold-800/20 bg-white dark:bg-card p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Check className="w-5 h-5 text-brand-500" />
        <h2 className="text-xl font-bold">Réviser votre commande</h2>
      </div>

      <div className="space-y-3">
        {items.map((item: any) => (
          <div key={item.id} className="flex items-center gap-4 p-3 rounded-xl bg-muted/40">
            <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
              <Image src={item.product.images[0] || "/placeholder.jpg"} alt={item.product.name} fill className="object-cover" sizes="64px" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-sm">{item.product.name}</p>
              {item.variant && <p className="text-xs text-muted-foreground">{item.variant.label}</p>}
              <p className="text-xs text-muted-foreground">Qté: {item.quantity}</p>
            </div>
            <p className="font-bold">{formatPrice((item.variant?.price ?? item.product.price) * item.quantity)}</p>
          </div>
        ))}
      </div>

      <div className="p-4 rounded-xl bg-muted/50 flex items-center gap-3">
        {paymentMethod === "STRIPE" ? <CreditCard className="w-5 h-5" /> : <Truck className="w-5 h-5" />}
        <div>
          <p className="text-sm font-medium">{paymentMethod === "STRIPE" ? "Paiement par carte via Stripe" : "Paiement à la livraison"}</p>
          <p className="text-xs text-muted-foreground">{paymentMethod === "STRIPE" ? `Paiement sécurisé de ${formatPrice(grandTotal)}` : "Payez à la réception de votre commande"}</p>
        </div>
      </div>

      <div className="flex gap-3">
        <button onClick={onBack} className="btn btn-outline btn-sm px-6">
          <ArrowLeft className="w-4 h-4" />
          Retour
        </button>
        <button
          onClick={onPlace}
          disabled={loading}
          className={`btn btn-brand flex-1 justify-center ${loading ? "loading" : ""}`}
        >
          {loading ? (
            <span className="opacity-0 flex items-center gap-2">
              Traitement...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <Lock className="w-4 h-4" />
              Passer la commande
            </span>
          )}
        </button>
      </div>
    </div>
  );
}
