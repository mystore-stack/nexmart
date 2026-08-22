"use client";
// src/app/checkout/page.tsx
import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { Check, ChevronRight, Lock, CreditCard, Truck, MapPin, Tag, ArrowLeft, Sparkles, ShieldCheck, Package, Home, Plus, Clock, ShoppingBag } from "lucide-react";
import { useCartStore } from "@/store/cart";
import { useAuthStore } from "@/store/index";
import { formatPrice } from "@/utils/format";
import Image from "next/image";
import Link from "next/link";
import toast from "react-hot-toast";
import type { Address, Order } from "@/types";
import { audit } from "@/lib/audit/client";
import { generateIdempotencyKey } from "@/lib/idempotency";

const stripePromise = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY 
  ? loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) 
  : null;

const STEPS = ["Shipping", "Delivery", "Payment", "Review"] as const;
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
  paymentCompleted: boolean;
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
  isPlacingOrder: boolean;
  onBack: () => void;
  onPlace: () => void;
}

interface DeliveryStepProps {
  options: any[];
  selectedId: string;
  onSelect: (id: string, price: number) => void;
  onNext: () => void;
  onBack: () => void;
}

interface AddressStepProps {
  addresses: Address[];
  selected: string;
  onSelect: (id: string) => void;
  onNext: () => void;
  showNewForm: boolean;
  setShowNewForm: (show: boolean) => void;
  onAddAddress: (address: any) => Promise<void>;
  isAddingAddress: boolean;
}

/* Old AddressStepProps 
  addresses: Address[];
  selected: string;
  onSelect: (id: string) => void;
  onNext: () => void;
} */

interface StripePaymentFormProps {
  onSuccess: () => void;
  paymentIntentId: string;
  grandTotal: number;
}

export default function CheckoutPage() {
  const { items, getSubtotal, getDiscount, coupon, applyCoupon, removeCoupon } = useCartStore();
  const { user } = useAuthStore();
  const router = useRouter();
  const mounted = useRef(false);

  const [step, setStep] = useState<Step>("Shipping");
  const [isMounted, setIsMounted] = useState(false);
  const [addresses, setAddresses] = useState<any[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("STRIPE");
  const [clientSecret, setClientSecret] = useState<string>("");
  const [paymentIntentId, setPaymentIntentId] = useState<string>("");
  const [paymentIntentAmount, setPaymentIntentAmount] = useState<number | null>(null);
  const [paymentCompleted, setPaymentCompleted] = useState(false);
  const [pendingOrderNumber, setPendingOrderNumber] = useState<string>("");
  const [creatingPaymentIntent, setCreatingPaymentIntent] = useState(false);
  const [couponInput, setCouponInput] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);
  const [orderLoading, setOrderLoading] = useState(false);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const isSubmittingRef = useRef(false);
  const orderJustPlacedRef = useRef(false);
  const hasRedirectedRef = useRef(false);
  const isProcessingOrderRef = useRef(false);
  const [shippingOptions, setShippingOptions] = useState<any[]>([]);
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [shippingCost, setShippingCost] = useState(30);
  const [shippingCarrierId, setShippingCarrierId] = useState("jibli");

  const subtotal = getSubtotal();
  const discount = getDiscount();
  const tax = 0;
  const grandTotal = subtotal - discount + shippingCost + tax;

  useEffect(() => {
    mounted.current = true;
    setIsMounted(true);
    return () => {
      mounted.current = false;
    };
  }, []);

  useEffect(() => {
    console.log("[CHECKOUT] Page mounted - Cart state:", {
      itemsCount: items.length,
      userId: user?.id,
      userEmail: user?.email,
      isMounted: mounted.current,
      isProcessingOrder: isProcessingOrderRef.current,
    });

    if (!user) { if (mounted.current) router.push("/login?from=/checkout"); return; }
    
    // Sync cart from database when user is authenticated
    const syncCartFromDatabase = async () => {
      try {
        console.log("[CHECKOUT] Syncing cart from database for user:", user.id);
        const cartRes = await fetch("/api/cart");
        const cartData = await cartRes.json();
        
        console.log("[CHECKOUT] Database cart response:", {
          success: cartData.success,
          itemsCount: cartData.items?.length || 0,
        });
        
        if (cartData.success && cartData.items && cartData.items.length > 0) {
          // Only sync if local cart is empty or has fewer items
          if (items.length === 0) {
            console.log("[CHECKOUT] Local cart empty, syncing from database");
            useCartStore.getState().clearCart();
            
            cartData.items.forEach((dbItem: any) => {
              useCartStore.getState().addItem(
                dbItem.product,
                dbItem.quantity,
                dbItem.variant || undefined
              );
            });
            
            console.log("[CHECKOUT] Cart synced from database, new item count:", cartData.items.length);
          } else {
            console.log("[CHECKOUT] Local cart has items, skipping sync");
          }
        } else {
          console.log("[CHECKOUT] No items in database cart");
        }
      } catch (error) {
        console.error("[CHECKOUT] Cart sync error:", error);
      }
    };
    
    syncCartFromDatabase();
    
    // Only redirect to cart if:
    // - Cart is empty AND
    // - Order is NOT being processed AND
    // - Order was NOT just placed (check sessionStorage)
    const orderJustPlaced = typeof window !== "undefined" && sessionStorage.getItem("orderJustPlaced") === "true";
    
    console.log("[CHECKOUT] Cart validation:", {
      itemsLength: items.length,
      isProcessingOrder: isProcessingOrderRef.current,
      orderJustPlaced,
      mounted: mounted.current,
    });
    
    if (items.length === 0 && !isProcessingOrderRef.current && !orderJustPlaced && mounted.current) {
      console.log("[CART_REDIRECT_TRIGGERED] items.length === 0, redirecting to /cart");
      router.push("/cart");
      return;
    }

    fetch("/api/auth/addresses")
      .then((r) => r.json())
      .then((d) => {
        if (mounted.current && d.data) {
          setAddresses(d.data);
          const def = d.data.find((a: any) => a.isDefault);
          if (def) setSelectedAddress(def.id);
        }
      })
      .catch(() => {});

    // Initialize audit session
    audit.initSession(undefined, user?.id).catch(console.error);
  }, [user, items, router]);

  // Reset submission lock when component unmounts
  useEffect(() => {
    return () => {
      isSubmittingRef.current = false;
      hasRedirectedRef.current = false;
    };
  }, []);

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
          setShippingOptions(d.options);
        } else {
          // Fallback to Standard Delivery when no options returned
          const standardDelivery = {
            id: "standard",
            name: "Standard Delivery",
            price: shippingCost,
            estimatedDays: "3-5 business days",
          };
          setShippingOptions([standardDelivery]);
          setShippingCarrierId("standard");
        }
      })
      .catch(() => {
        // Fallback to Standard Delivery on error
        const standardDelivery = {
          id: "standard",
          name: "Standard Delivery",
          price: shippingCost,
          estimatedDays: "3-5 business days",
        };
        setShippingOptions([standardDelivery]);
        setShippingCarrierId("standard");
      });
  }, [selectedAddress, addresses, subtotal, shippingCarrierId, shippingCost]);

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
    setPaymentCompleted(false); // Reset payment completion when method changes
    
    // Clear payment intent when switching away from STRIPE
    if (method !== "STRIPE") {
      setClientSecret("");
      setPaymentIntentId("");
      setPaymentIntentAmount(null);
      // Clear idempotency key when switching payment methods to avoid lock conflicts
      localStorage.removeItem("checkout_idempotency_key");
    }
    
    // Audit: Track payment method selection
    await audit.trackStep("PAYMENT_METHOD_SELECTED");
    
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
          
          // Audit: Payment initiated
          await audit.payment.initiated(grandTotal, "STRIPE");
        } else {
          toast.error(data.error || "Failed to initialize payment");
          setClientSecret("");
          setPaymentIntentId("");
          setPaymentIntentAmount(null);
          setPaymentMethod("CASH_ON_DELIVERY");
          
          // Audit: Payment error
          await audit.payment.failed(data.error || "Failed to initialize payment", grandTotal);
        }
      } catch (error) {
        console.error("Payment intent creation error:", error);
        toast.error("Failed to initialize payment");
        setClientSecret("");
        setPaymentIntentId("");
        setPaymentIntentAmount(null);
        setPaymentMethod("CASH_ON_DELIVERY");
        
        // Audit: Payment error
        await audit.payment.failed("Payment intent creation failed", grandTotal);
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

  // Audit: Track checkout start when page loads
  useEffect(() => {
    if (items.length > 0) {
      audit.checkout.start(items).catch(console.error);
    }
  }, [items.length]);

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
      if (mounted.current) router.push("/cart");
      return;
    }

    // Validate UUIDs before sending to API
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    const invalidItems = items.filter(item => !uuidRegex.test(item.productId));
    if (invalidItems.length > 0) {
      console.error("[CHECKOUT] Invalid product IDs in cart:", invalidItems.map(i => i.productId));
      toast.error("Invalid product data in cart. Please refresh and try again.");
      // Clear local cart and redirect to cart page
      useCartStore.getState().clearCart();
      if (mounted.current) router.push("/cart");
      return;
    }

    // Force clear idempotency key if switching from STRIPE to CASH_ON_DELIVERY
    // This prevents lock conflicts when payment method changes
    if (paymentMethod === "CASH_ON_DELIVERY" && paymentIntentId) {
      console.log("[CHECKOUT] Clearing Stripe payment intent and idempotency key due to payment method switch");
      setPaymentIntentId("");
      setClientSecret("");
      setPaymentIntentAmount(null);
      localStorage.removeItem("checkout_idempotency_key");
    }

    // Strict submission lock - prevent duplicate submissions
    if (isSubmittingRef.current) {
      console.log("[PLACE_ORDER] Already submitting, blocking duplicate submission");
      toast.error("Commande en cours de traitement. Veuillez patienter.");
      return;
    }

    // Generate or retrieve idempotency key (UUID format for production-grade idempotency)
    let idempotencyKey = localStorage.getItem("checkout_idempotency_key");
    if (!idempotencyKey) {
      idempotencyKey = generateIdempotencyKey();
      localStorage.setItem("checkout_idempotency_key", idempotencyKey);
    }
    console.log("[PLACE_ORDER] Using idempotency key:", idempotencyKey);

    isSubmittingRef.current = true;
    setIsPlacingOrder(true);
    isProcessingOrderRef.current = true; // Set flag to prevent cart redirect during order processing
    setOrderLoading(true);

    try {
      console.log("Placing order with:", {
        paymentMethod,
        paymentIntentId,
        itemCount: items.length,
        total: grandTotal,
        idempotencyKey,
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
          idempotencyKey,
        }),
      });
      
      const data = await res.json();
      console.log("Order API response:", data);
      
      if (!data.success) {
        // Handle lock error (duplicate order in progress)
        if (data.code === "ORDER_LOCK_FAILED" || res.status === 429) {
          toast.error(data.error || "Order processing in progress. Please wait a moment and try again.");
          // Clear idempotency key to allow retry after lock expires
          localStorage.removeItem("checkout_idempotency_key");
          // Also clear payment intent to prevent conflicts
          setPaymentIntentId("");
          setClientSecret("");
          setPaymentIntentAmount(null);
          isProcessingOrderRef.current = false;
          setOrderLoading(false);
          setIsPlacingOrder(false);
          isSubmittingRef.current = false;
          
          // Suggest page refresh to clear any stale state
          setTimeout(() => {
            if (mounted.current) {
              toast("Please refresh the page to continue", { icon: "🔄" });
            }
          }, 2000);
          return;
        }
        
        // Handle cart cleanup required error
        if (data.code === "CART_CLEANUP_REQUIRED") {
          toast.error(data.error || "Some products in your cart are no longer available. Please refresh your cart.");

          // Set flag to prevent cart redirect during cleanup
          isProcessingOrderRef.current = true;

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
                  if (mounted.current) router.push("/cart");
                }, 1500);
              }
            }
          } catch (cleanupError) {
            console.error("Cart cleanup error:", cleanupError);
            toast.error("Failed to clean up cart. Please refresh the page.");
          } finally {
            isProcessingOrderRef.current = false; // Reset flag after cleanup
          }
          return;
        }
        
        toast.error(data.error || "Échec de la création de commande");
        return;
      }

      const order = data.order;
      const orderNumber = order.orderNumber;
      
      if (!orderNumber) {
        console.error("Missing order number after order creation");
        toast.error("Order created but order number is missing. Please contact support.");
        setOrderLoading(false);
        setIsPlacingOrder(false);
        
        // Audit: Checkout error
        await audit.checkout.error("Missing order number");
        return;
      }
      
      setPendingOrderNumber(orderNumber);

      console.log("[CHECKOUT_REDIRECT] Order created successfully, orderNumber:", orderNumber);

      // Audit: Order created successfully
      await audit.checkout.complete(orderNumber, grandTotal);

      // Set flags BEFORE any other operations to prevent cart redirect useEffect from triggering
      sessionStorage.setItem("orderJustPlaced", "true");
      orderJustPlacedRef.current = true;
      console.log("[CHECKOUT_REDIRECT] Set orderJustPlacedRef.current to true");

      // Redirect to order tracking page immediately
      console.log("[CHECKOUT_REDIRECT] Redirecting to /track-order/", orderNumber);
      if (mounted.current && orderNumber && !hasRedirectedRef.current) {
        hasRedirectedRef.current = true;

        // Remove idempotency key
        localStorage.removeItem("checkout_idempotency_key");

        // Perform redirect WITHOUT clearing cart here
        // Cart will be cleared on the track-order page instead
        router.push(`/track-order/${orderNumber}`);
        console.log("[CHECKOUT_REDIRECT] Redirect initiated");

        // Keep isProcessingOrderRef true to prevent any cart redirect during transition
        // It will be reset when component unmounts
      } else {
        console.error("[CHECKOUT_REDIRECT] Cannot redirect:", {
          mounted: mounted.current,
          orderNumber,
          hasRedirected: hasRedirectedRef.current,
        });
        isProcessingOrderRef.current = false; // Reset flag if redirect cannot happen
      }
    }
    catch (error) {
      console.error("Order placement error:", error);
      toast.error("Échec de la commande. Veuillez réessayer.");
      isProcessingOrderRef.current = false; // Reset flag on error
    } finally {
      setOrderLoading(false);
      setIsPlacingOrder(false);
      // Reset submission lock after a delay to prevent rapid retries
      setTimeout(() => {
        isSubmittingRef.current = false;
      }, 2000);
    }
  };

  const handleAddAddress = async (newAddress: any) => {
    setIsAddingAddress(true);
    try {
      console.log("[ADD ADDRESS] Sending address:", newAddress);
      const res = await fetch("/api/auth/addresses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newAddress),
      });
      const data = await res.json();
      console.log("[ADD ADDRESS] Response:", data);
      console.log("[ADD ADDRESS] Response status:", res.status);
      if (data.success && data.address) {
        setAddresses((prev) => [...prev, data.address]);
        setSelectedAddress(data.address.id);
        setShowNewAddressForm(false);
        import('react-hot-toast').then(toast => toast.default.success("Adresse ajoutée avec succès"));
      } else {
        console.error("[ADD ADDRESS] Full response data:", JSON.stringify(data, null, 2));
        import('react-hot-toast').then(toast => toast.default.error(data.error || "Erreur lors de l'ajout de l'adresse"));
      }
    } catch (error) {
      console.error("[ADD ADDRESS] Exception:", error);
      import('react-hot-toast').then(toast => toast.default.error("Erreur lors de l'ajout de l'adresse"));
    } finally {
      setIsAddingAddress(false);
    }
  };

  const currentStepIndex = STEPS.indexOf(step);

  // Prevent hydration mismatch by not rendering until mounted
  if (!isMounted) {
    return null;
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 page-enter pb-24">
      {/* Header */}
      <div className="border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 sticky top-0 z-50">
        <div className="container-main py-4">
          <div className="flex items-center justify-between">
            <Link href="/cart" className="flex items-center gap-2 text-sm text-zinc-500 hover:text-brand-600 transition-colors">
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Back to Cart</span>
            </Link>
            <Link href="/" className="flex items-center gap-2 text-sm font-bold">
              <div className="w-8 h-8 bg-brand-600 rounded-xl flex items-center justify-center text-white">
                <ShoppingBag className="h-4 w-4" />
              </div>
              <span className="text-lg">NexMart</span>
            </Link>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-500">
              <Lock className="w-4 h-4 text-brand-600" />
              <span className="hidden sm:inline">Secure Checkout</span>
            </div>
          </div>
        </div>
      </div>

      <div className="container-main py-6 sm:py-10">
        <div className="grid lg:grid-cols-12 gap-8 lg:gap-12">
          
          {/* Left: Step content */}
          <div className="lg:col-span-7 xl:col-span-8">
            
            {/* Progress indicator */}
            <div className="mb-10">
              <div className="flex items-center justify-between relative">
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-0.5 bg-zinc-200 dark:bg-zinc-800 z-0"></div>
                {STEPS.map((s, i) => {
                  const isCompleted = i < currentStepIndex;
                  const isCurrent = s === step;
                  return (
                    <div key={s} className="relative z-10 flex flex-col items-center gap-2 bg-zinc-50 dark:bg-zinc-950 px-2">
                      <button
                        onClick={() => isCompleted && setStep(s)}
                        disabled={!isCompleted && !isCurrent}
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all shadow-sm ${
                          isCompleted 
                            ? "bg-brand-600 text-white cursor-pointer hover:bg-brand-700 ring-4 ring-brand-50 dark:ring-brand-900/30" 
                            : isCurrent
                            ? "bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 ring-4 ring-zinc-200 dark:ring-zinc-800"
                            : "bg-white dark:bg-zinc-900 text-zinc-400 border border-zinc-200 dark:border-zinc-800 cursor-not-allowed"
                        }`}
                      >
                        {isCompleted ? <Check className="w-4 h-4" /> : i + 1}
                      </button>
                      <span className={`text-xs sm:text-sm font-medium ${isCurrent ? "text-zinc-900 dark:text-white" : isCompleted ? "text-brand-600" : "text-zinc-400"}`}>
                        {s}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="bg-white dark:bg-zinc-900 rounded-3xl p-6 sm:p-8 shadow-sm border border-zinc-200 dark:border-zinc-800"
              >
                {step === "Shipping" && (
                  <AddressStep
                    addresses={addresses}
                    selected={selectedAddress}
                    onSelect={setSelectedAddress}
                    onNext={() => setStep("Delivery")}
                    showNewForm={showNewAddressForm}
                    setShowNewForm={setShowNewAddressForm}
                    onAddAddress={handleAddAddress}
                    isAddingAddress={isAddingAddress}
                  />
                )}
                
                {step === "Delivery" && (
                  <DeliveryStep
                    options={shippingOptions}
                    selectedId={shippingCarrierId}
                    onSelect={(id, price) => {
                      setShippingCarrierId(id);
                      setShippingCost(price);
                    }}
                    onNext={() => setStep("Payment")}
                    onBack={() => setStep("Shipping")}
                  />
                )}
                
                {step === "Payment" && (
                  <PaymentStep
                    method={paymentMethod}
                    onMethodChange={handlePaymentMethodChange}
                    clientSecret={clientSecret}
                    paymentIntentId={paymentIntentId}
                    grandTotal={grandTotal}
                    paymentCompleted={paymentCompleted}
                    onNext={() => {
                      if (!paymentMethod) {
                        import('react-hot-toast').then(toast => toast.default.error("Please select a payment method"));
                        return;
                      }
                      if (paymentMethod === "STRIPE" && !paymentCompleted) {
                        import('react-hot-toast').then(toast => toast.default.error("Veuillez payer par carte avant de finaliser la commande."));
                        return;
                      }
                      setStep("Review");
                    }}
                    onStripeSuccess={() => {
                      setPaymentCompleted(true);
                      import('react-hot-toast').then(toast => toast.default.success("Paiement réussi! Veuillez réviser votre commande."));
                    }}
                    onBack={() => setStep("Delivery")}
                    creatingPaymentIntent={creatingPaymentIntent}
                  />
                )}
                
                {step === "Review" && (
                  <ReviewStep
                    items={items}
                    paymentMethod={paymentMethod}
                    grandTotal={grandTotal}
                    loading={orderLoading}
                    isPlacingOrder={isPlacingOrder}
                    onBack={() => setStep("Payment")}
                    onPlace={() => placeOrder()}
                  />
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Right: Order summary */}
          <div className="lg:col-span-5 xl:col-span-4 mt-8 lg:mt-0">
            <div className="bg-white dark:bg-zinc-900 rounded-3xl shadow-sm border border-zinc-200 dark:border-zinc-800 sticky top-24 overflow-hidden">
              <div className="p-6 sm:p-8 space-y-6">
                <h2 className="text-xl font-bold">Order Summary</h2>

                {/* Items */}
                <div className="space-y-4 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
                  {items.map((item) => (
                    <div key={item.id} className="flex gap-4">
                      <div className="relative w-20 h-20 rounded-2xl overflow-hidden bg-zinc-100 dark:bg-zinc-800 flex-shrink-0 border border-zinc-200 dark:border-zinc-700">
                        <Image
                          src={item.product.images[0] || "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80'%3E%3Crect width='80' height='80' fill='%23f4f4f5'/%3E%3C/svg%3E"}
                          alt={item.product.name}
                          fill
                          className="object-cover"
                          sizes="80px"
                        />
                        <span className="absolute top-0 right-0 w-6 h-6 bg-zinc-900/80 backdrop-blur text-white text-xs font-medium rounded-bl-xl flex items-center justify-center">
                          {item.quantity}
                        </span>
                      </div>
                      <div className="flex-1 flex flex-col justify-center">
                        <p className="font-semibold text-zinc-900 dark:text-white line-clamp-2 leading-tight mb-1">{item.product.name}</p>
                        {item.variant && (
                          <p className="text-sm text-zinc-500">{item.variant.label}</p>
                        )}
                        <p className="font-bold text-brand-600 mt-1">
                          {formatPrice((item.variant?.price ?? item.product.price) * item.quantity)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Coupon */}
                <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800">
                  {coupon ? (
                    <div className="flex items-center justify-between p-3.5 rounded-xl bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-900/30">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/50 flex items-center justify-center">
                          <Tag className="w-4 h-4 text-green-600 dark:text-green-400" />
                        </div>
                        <span className="font-bold text-green-700 dark:text-green-400 uppercase tracking-wide">{coupon.code}</span>
                      </div>
                      <button onClick={removeCoupon} className="text-xs font-semibold text-green-700 dark:text-green-400 hover:text-green-900 hover:underline">Remove</button>
                    </div>
                  ) : (
                    <details className="group [&_summary::-webkit-details-marker]:hidden">
                      <summary className="flex items-center justify-between cursor-pointer text-sm font-semibold text-brand-600 hover:text-brand-700 transition-colors">
                        <span className="flex items-center gap-2">
                          <Tag className="w-4 h-4" />
                          Have a promo code?
                        </span>
                        <ChevronRight className="w-4 h-4 transition-transform group-open:rotate-90" />
                      </summary>
                      <div className="flex gap-2 mt-3">
                        <input
                          type="text"
                          value={couponInput}
                          onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                          placeholder="Enter code"
                          className="flex-1 h-11 px-4 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                          onKeyDown={(e) => e.key === "Enter" && handleCoupon()}
                        />
                        <button
                          onClick={handleCoupon}
                          disabled={couponLoading || !couponInput}
                          className="h-11 px-5 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-sm font-semibold disabled:opacity-50 hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-colors"
                        >
                          {couponLoading ? "..." : "Apply"}
                        </button>
                      </div>
                    </details>
                  )}
                </div>

                {/* Totals */}
                <div className="space-y-3 pt-4 border-t border-zinc-200 dark:border-zinc-800 text-sm">
                  <div className="flex justify-between text-zinc-500">
                    <span>Subtotal</span>
                    <span className="font-medium text-zinc-900 dark:text-white">{formatPrice(subtotal)}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount</span>
                      <span className="font-medium">-{formatPrice(discount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-zinc-500">
                    <span>Shipping</span>
                    <span className="font-medium text-zinc-900 dark:text-white">{shippingCost === 0 ? "FREE" : formatPrice(shippingCost)}</span>
                  </div>
                  
                  <div className="pt-4 mt-4 border-t border-zinc-200 dark:border-zinc-800">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-lg">Total</span>
                      <span className="font-bold text-2xl text-brand-600">{formatPrice(grandTotal)}</span>
                    </div>
                    <p className="text-right text-xs text-zinc-400 mt-1">Including VAT</p>
                  </div>
                </div>
              </div>
              
              {/* Trust Section */}
              <div className="bg-zinc-50 dark:bg-zinc-950/50 p-6 border-t border-zinc-200 dark:border-zinc-800">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-zinc-400" />
                    <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Secure Payment</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Package className="w-5 h-5 text-zinc-400" />
                    <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Easy Returns</span>
                  </div>
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

function AddressStep({ addresses, selected, onSelect, onNext, showNewForm, setShowNewForm, onAddAddress, isAddingAddress }: AddressStepProps) {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    line1: "",
    line2: "",
    city: "",
    state: "",
    zip: "",
    country: "Maroc",
    isDefault: false
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.phone.startsWith("+212") && !form.phone.startsWith("0")) {
      import('react-hot-toast').then(toast => toast.default.error("Veuillez entrer un numéro de téléphone marocain valide"));
      return;
    }
    // format phone if needed
    const phoneToSave = form.phone.startsWith("0") ? "+212" + form.phone.substring(1) : form.phone;
    onAddAddress({ ...form, phone: phoneToSave });
  };

  if (showNewForm) {
    return (
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
        <div>
          <h2 className="text-2xl font-bold mb-2">Add New Address</h2>
          <p className="text-zinc-500">Where should we deliver your order?</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid sm:grid-cols-2 gap-5">
            <div className="space-y-2">
              <label className="text-sm font-semibold">Full Name</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full h-12 px-4 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-transparent focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                required
                placeholder="Mohammed El Amrani"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold">Phone Number</label>
              <div className="relative">
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full h-12 px-4 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-transparent focus:ring-2 focus:ring-brand-500 outline-none transition-all pl-14"
                  required
                  placeholder="612345678"
                />
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 font-medium">+212</span>
              </div>
            </div>
            <div className="space-y-2 sm:col-span-2">
              <label className="text-sm font-semibold">Street Address</label>
              <input
                type="text"
                value={form.line1}
                onChange={(e) => setForm({ ...form, line1: e.target.value })}
                className="w-full h-12 px-4 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-transparent focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                required
                placeholder="123 Rue de la Liberté"
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <label className="text-sm font-semibold">Apartment, suite, etc. (optional)</label>
              <input
                type="text"
                value={form.line2}
                onChange={(e) => setForm({ ...form, line2: e.target.value })}
                className="w-full h-12 px-4 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-transparent focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                placeholder="Appt 4, Étage 2"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold">City</label>
              <input
                type="text"
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                className="w-full h-12 px-4 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-transparent focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                required
                placeholder="Casablanca"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold">State/Province</label>
              <input
                type="text"
                value={form.state}
                onChange={(e) => setForm({ ...form, state: e.target.value })}
                className="w-full h-12 px-4 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-transparent focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                required
                placeholder="Casablanca-Settat"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold">Postal Code</label>
              <input
                type="text"
                value={form.zip}
                onChange={(e) => setForm({ ...form, zip: e.target.value })}
                className="w-full h-12 px-4 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-transparent focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                placeholder="20000"
              />
            </div>
          </div>
          
          <div className="pt-4 flex gap-3">
            <button
              type="button"
              onClick={() => setShowNewForm(false)}
              className="flex-1 h-12 rounded-xl border border-zinc-300 dark:border-zinc-700 font-semibold hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isAddingAddress}
              className="flex-1 h-12 rounded-xl bg-brand-600 text-white font-semibold hover:bg-brand-700 transition-colors disabled:opacity-70 flex items-center justify-center gap-2"
            >
              {isAddingAddress ? "Saving..." : "Save Address"}
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold mb-2">Shipping Address</h2>
          <p className="text-zinc-500">Select where to ship your order</p>
        </div>
      </div>

      {addresses.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-3xl">
          <MapPin className="w-12 h-12 text-zinc-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold mb-1">No addresses saved</h3>
          <p className="text-zinc-500 mb-6">Add a new address to continue checkout</p>
          <button 
            onClick={() => setShowNewForm(true)}
            className="h-12 px-8 rounded-xl bg-brand-600 text-white font-semibold hover:bg-brand-700 transition-colors"
          >
            Add New Address
          </button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {addresses.map((addr: any) => (
            <button
              key={addr.id}
              onClick={() => onSelect(addr.id)}
              className={`text-left p-5 rounded-2xl border-2 transition-all relative overflow-hidden group ${
                selected === addr.id 
                  ? "border-brand-600 bg-brand-50/50 dark:bg-brand-900/10 shadow-sm" 
                  : "border-zinc-200 dark:border-zinc-800 hover:border-brand-300"
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                    selected === addr.id ? "border-brand-600 bg-brand-600" : "border-zinc-300 dark:border-zinc-700 group-hover:border-brand-400"
                  }`}>
                    {selected === addr.id && <div className="w-2 h-2 rounded-full bg-white" />}
                  </div>
                  <span className="font-bold">{addr.name}</span>
                </div>
                {addr.isDefault && (
                  <span className="bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider">
                    Default
                  </span>
                )}
              </div>
              <div className="pl-7 space-y-1 text-sm text-zinc-600 dark:text-zinc-400">
                <p>{addr.line1} {addr.line2 && `, ${addr.line2}`}</p>
                <p>{addr.city}, {addr.zip}</p>
                <p className="font-medium mt-2">{addr.phone}</p>
              </div>
            </button>
          ))}
          
          <button
            onClick={() => setShowNewForm(true)}
            className="flex flex-col items-center justify-center p-5 rounded-2xl border-2 border-dashed border-zinc-200 dark:border-zinc-800 hover:border-brand-400 hover:bg-brand-50/50 dark:hover:bg-brand-900/10 transition-all text-zinc-500 hover:text-brand-600 group min-h-[160px]"
          >
            <div className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-800 group-hover:bg-brand-100 dark:group-hover:bg-brand-900/50 flex items-center justify-center mb-3 transition-colors">
              <Plus className="w-5 h-5" />
            </div>
            <span className="font-semibold">Add New Address</span>
          </button>
        </div>
      )}

      {addresses.length > 0 && (
        <div className="pt-4 flex justify-end">
          <button
            onClick={onNext}
            disabled={!selected}
            className="h-14 px-10 rounded-xl bg-brand-600 text-white font-bold text-lg hover:bg-brand-700 transition-colors disabled:opacity-50 flex items-center gap-2 w-full sm:w-auto justify-center shadow-xl shadow-brand-600/30"
          >
            Continue to Delivery
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
}

function DeliveryStep({ options, selectedId, onSelect, onNext, onBack }: DeliveryStepProps) {
  return (
    <div className="space-y-8 animate-in fade-in">
      <div>
        <h2 className="text-2xl font-bold mb-2">Delivery Method</h2>
        <p className="text-zinc-500">Choose how you want your order delivered</p>
      </div>

      <div className="space-y-4">
        {options.length === 0 ? (
          <div className="p-4 rounded-xl bg-yellow-50 text-yellow-800 border border-yellow-200">
            No shipping options found for this address. We will apply standard shipping.
          </div>
        ) : (
          options.map((opt) => (
            <button
              key={opt.id}
              onClick={() => onSelect(opt.id, opt.price)}
              className={`w-full text-left p-5 rounded-2xl border-2 transition-all flex items-center justify-between group ${
                selectedId === opt.id 
                  ? "border-brand-600 bg-brand-50/50 dark:bg-brand-900/10 shadow-sm" 
                  : "border-zinc-200 dark:border-zinc-800 hover:border-brand-300"
              }`}
            >
              <div className="flex items-center gap-4">
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors flex-shrink-0 ${
                  selectedId === opt.id ? "border-brand-600 bg-brand-600" : "border-zinc-300 dark:border-zinc-700 group-hover:border-brand-400"
                }`}>
                  {selectedId === opt.id && <div className="w-2 h-2 rounded-full bg-white" />}
                </div>
                <div className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center flex-shrink-0">
                  <Truck className={`w-5 h-5 ${selectedId === opt.id ? "text-brand-600" : "text-zinc-500"}`} />
                </div>
                <div>
                  <h3 className="font-bold text-lg">{opt.name}</h3>
                  <p className="text-sm text-zinc-500 flex items-center gap-1.5 mt-0.5">
                    <Clock className="w-3.5 h-3.5" />
                    {opt.estimatedDays || opt.days || "3-5 business days"}
                  </p>
                </div>
              </div>
              <div className="text-right pl-4">
                <span className={`font-bold text-lg ${opt.price === 0 ? "text-green-600" : ""}`}>
                  {opt.price === 0 ? "FREE" : formatPrice(opt.price)}
                </span>
              </div>
            </button>
          ))
        )}
      </div>

      <div className="pt-4 flex gap-4">
        <button onClick={onBack} className="h-14 px-6 rounded-xl border border-zinc-200 dark:border-zinc-800 font-semibold hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Back</span>
        </button>
        <button
          onClick={onNext}
          className="flex-1 h-14 rounded-xl bg-brand-600 text-white font-bold text-lg hover:bg-brand-700 transition-colors flex items-center justify-center gap-2 shadow-xl shadow-brand-600/30"
        >
          Continue to Payment
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}

function PaymentStep({ method, onMethodChange, clientSecret, paymentIntentId, grandTotal, paymentCompleted, onNext, onStripeSuccess, onBack, creatingPaymentIntent }: PaymentStepProps) {
  return (
    <div className="space-y-8 animate-in fade-in">
      <div>
        <h2 className="text-2xl font-bold mb-2">Payment Method</h2>
        <p className="text-zinc-500">All transactions are secure and encrypted.</p>
      </div>

      <div className="space-y-4">
        {PAYMENT_OPTIONS.map(({ value, label, sub, icon: Icon }) => (
          <div key={value} className={`rounded-2xl border-2 overflow-hidden transition-all ${
            method === value ? "border-brand-600" : "border-zinc-200 dark:border-zinc-800"
          }`}>
            <button
              onClick={() => onMethodChange(value)}
              className={`w-full text-left p-5 flex items-center justify-between ${
                method === value ? "bg-brand-50/30 dark:bg-brand-900/10" : "hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
              }`}
            >
              <div className="flex items-center gap-4">
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors flex-shrink-0 ${
                  method === value ? "border-brand-600 bg-brand-600" : "border-zinc-300 dark:border-zinc-700"
                }`}>
                  {method === value && <div className="w-2 h-2 rounded-full bg-white" />}
                </div>
                <div>
                  <h3 className="font-bold">{label}</h3>
                  <p className="text-sm text-zinc-500">{sub}</p>
                </div>
              </div>
              
              {value === "STRIPE" && (
                <div className="flex gap-1.5 opacity-60">
                  <div className="w-8 h-5 bg-[#1434CB] rounded text-white flex items-center justify-center font-bold text-[8px] italic">VISA</div>
                  <div className="w-8 h-5 bg-[#EB001B] rounded text-white flex items-center justify-center font-bold text-[8px]">MC</div>
                </div>
              )}
            </button>
            
            {/* Stripe Element Expansion */}
            {method === "STRIPE" && value === "STRIPE" && (
              <div className="p-5 border-t border-brand-100 dark:border-brand-900/30 bg-zinc-50 dark:bg-zinc-900/50">
                {creatingPaymentIntent ? (
                  <div className="flex flex-col items-center justify-center py-10 space-y-4">
                    <div className="w-10 h-10 border-4 border-zinc-200 border-t-brand-600 rounded-full animate-spin"></div>
                    <p className="text-sm text-zinc-500 font-medium">Initializing secure payment...</p>
                  </div>
                ) : paymentCompleted ? (
                  <div className="flex flex-col items-center justify-center py-8 space-y-3 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-100 dark:border-green-900/30">
                    <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-800 flex items-center justify-center text-green-600 dark:text-green-400">
                      <Check className="w-6 h-6" />
                    </div>
                    <p className="font-bold text-green-700 dark:text-green-400">Payment successful!</p>
                  </div>
                ) : clientSecret && stripePromise ? (
                  <div className="bg-white dark:bg-zinc-900 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
                    <Elements stripe={stripePromise} options={{ clientSecret }}>
                      <StripePaymentForm 
                        onSuccess={onStripeSuccess} 
                        paymentIntentId={paymentIntentId}
                        grandTotal={grandTotal}
                      />
                    </Elements>
                  </div>
                ) : (
                  <div className="text-center py-8 text-zinc-500 text-sm">
                    Unable to load payment processor
                  </div>
                )}
              </div>
            )}
            
            {/* COD Expansion */}
            {method === "CASH_ON_DELIVERY" && value === "CASH_ON_DELIVERY" && (
              <div className="p-5 border-t border-brand-100 dark:border-brand-900/30 bg-brand-50/30 dark:bg-brand-900/10">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-white dark:bg-zinc-800 flex items-center justify-center flex-shrink-0 shadow-sm">
                    <Truck className="w-5 h-5 text-brand-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Pay when you receive it</h4>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">
                      You will pay {formatPrice(grandTotal)} in cash when your order is delivered to your address. Please have the exact amount ready if possible.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="pt-4 flex gap-4">
        <button onClick={onBack} className="h-14 px-6 rounded-xl border border-zinc-200 dark:border-zinc-800 font-semibold hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Back</span>
        </button>
        <button 
          onClick={onNext} 
          className="flex-1 h-14 rounded-xl bg-brand-600 text-white font-bold text-lg hover:bg-brand-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 shadow-md shadow-brand-600/20"
          disabled={creatingPaymentIntent || (method === "STRIPE" && !paymentCompleted)}
        >
          {method === "STRIPE" && !paymentCompleted ? "Complete Payment First" : "Review Order"}
          <ChevronRight className="w-5 h-5" />
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
    if (!stripe || !elements || !paymentIntentId) return;
    setLoading(true);
    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        redirect: "if_required",
        confirmParams: { return_url: `${window.location.origin}/checkout` },
      });
      if (error) {
        import('react-hot-toast').then(toast => toast.default.error(error.message || "Échec du paiement"));
      } else if (paymentIntent?.status === "succeeded") {
        import('react-hot-toast').then(toast => toast.default.success("Paiement réussi!"));
        onSuccess();
      }
    } catch (error) {
      import('react-hot-toast').then(toast => toast.default.error("Une erreur s'est produite lors du paiement."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      <PaymentElement options={{ layout: "tabs" }} />
      <button
        onClick={handleSubmit}
        disabled={!stripe || !elements || loading || !paymentIntentId}
        className="w-full h-12 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-bold hover:bg-zinc-800 transition-colors disabled:opacity-50 flex items-center justify-center"
      >
        {loading ? (
          <div className="w-5 h-5 border-2 border-zinc-400 border-t-white dark:border-t-zinc-900 rounded-full animate-spin"></div>
        ) : (
          `Pay ${formatPrice(grandTotal)}`
        )}
      </button>
    </div>
  );
}

function ReviewStep({ items, paymentMethod, grandTotal, loading, isPlacingOrder, onBack, onPlace }: ReviewStepProps) {
  return (
    <div className="space-y-8 animate-in fade-in">
      <div>
        <h2 className="text-2xl font-bold mb-2">Review & Place Order</h2>
        <p className="text-zinc-500">Please review your order details before final submission.</p>
      </div>

      <div className="bg-zinc-50 dark:bg-zinc-900/50 rounded-2xl p-6 border border-zinc-200 dark:border-zinc-800 space-y-6">
        <div>
          <h3 className="font-bold text-zinc-900 dark:text-white mb-3 flex items-center gap-2">
            <Lock className="w-4 h-4 text-brand-600" />
            Final Confirmation
          </h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700">
              <span className="text-xs text-zinc-500 font-bold uppercase tracking-wider mb-1 block">Payment Method</span>
              <p className="font-semibold">{paymentMethod === "STRIPE" ? "Credit Card (Paid)" : "Cash on Delivery"}</p>
            </div>
            <div className="p-4 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700">
              <span className="text-xs text-zinc-500 font-bold uppercase tracking-wider mb-1 block">Total to Pay</span>
              <p className="font-bold text-brand-600 text-lg">{formatPrice(grandTotal)}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="pt-4 flex gap-4">
        <button onClick={onBack} className="h-14 px-6 rounded-xl border border-zinc-200 dark:border-zinc-800 font-semibold hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Back</span>
        </button>
        <button
          onClick={onPlace}
          disabled={loading || isPlacingOrder}
          className="flex-1 h-16 rounded-xl bg-brand-600 text-white font-bold text-xl hover:bg-brand-700 transition-all disabled:opacity-70 flex items-center justify-center gap-3 shadow-xl shadow-brand-600/30 transform active:scale-[0.98]"
        >
          {loading || isPlacingOrder ? (
            <>
              <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
              Processing...
            </>
          ) : (
            <>
              {paymentMethod === "CASH_ON_DELIVERY" ? "Place Order" : "Place Order"}
              <Check className="w-6 h-6" />
            </>
          )}
        </button>
      </div>
      <p className="text-center text-xs text-zinc-500 max-w-sm mx-auto">
        By placing your order, you agree to our Terms of Service and Privacy Policy.
      </p>
    </div>
  );
}
