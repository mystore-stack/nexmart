"use client";
// src/app/m/cart/CartPageClient.tsx
import Link from "next/link";
import { MobileLayout } from "@/components/mobile/MobileLayout";
import { useCartStore } from "@/store/cart";
import { cn } from "@/utils/cn";
import type { CartItem } from "@/types";

export function CartPageClient() {
  const { items, removeItem, updateQuantity, getSubtotal, getDiscount, getTotal, coupon } =
    useCartStore();

  const subtotal  = getSubtotal();
  const discount  = getDiscount();
  const total     = getTotal();
  const shipping  = total > 500 ? 0 : 39;

  return (
    <MobileLayout>
      <header className="flex items-center justify-between px-5 py-5 sticky top-0 z-30 bg-background/95 backdrop-blur border-b border-border">
        <h1 className="font-display text-2xl font-semibold text-foreground">Cart</h1>
        {items.length > 0 && (
          <span className="text-xs text-muted-foreground">{items.length} item{items.length !== 1 && "s"}</span>
        )}
      </header>

      {items.length === 0 ? (
        /* Empty state */
        <div className="flex flex-col items-center justify-center py-24 px-6 text-center">
          <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-4 text-4xl">
            🛒
          </div>
          <h2 className="font-display text-xl font-semibold text-foreground mb-2">Your cart is empty</h2>
          <p className="text-sm text-muted-foreground mb-6">Add some products to get started.</p>
          <Link href="/m/products" className="btn btn-primary btn-md text-sm">
            Browse Products
          </Link>
        </div>
      ) : (
        <div className="px-4 py-5 pb-36 space-y-4">
          {/* Items */}
          {items.map((item) => (
            <CartItemRow key={item.id} item={item}
              onQuantityChange={(q) => updateQuantity(item.id, q)}
              onRemove={() => removeItem(item.id)} />
          ))}

          {/* Order summary */}
          <div className="card-luxury rounded-2xl p-5 space-y-3">
            <h3 className="font-semibold text-sm text-foreground">Order Summary</h3>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal</span>
                <span>{subtotal.toLocaleString("fr-MA")} MAD</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Coupon ({coupon?.code})</span>
                  <span>-{discount.toLocaleString("fr-MA")} MAD</span>
                </div>
              )}
              <div className="flex justify-between text-muted-foreground">
                <span>Shipping</span>
                <span>{shipping === 0 ? <span className="text-green-600 font-semibold">Free</span> : `${shipping} MAD`}</span>
              </div>
              <div className="border-t border-border pt-2 flex justify-between font-bold text-foreground">
                <span>Total</span>
                <span>{(total + shipping).toLocaleString("fr-MA")} MAD</span>
              </div>
            </div>

            {shipping > 0 && (
              <p className="text-[11px] text-muted-foreground">
                Free shipping on orders over 500 MAD
              </p>
            )}
          </div>
        </div>
      )}

      {/* Sticky checkout bar */}
      {items.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-50 px-4 py-4 bg-background/95 backdrop-blur border-t border-border"
          style={{ maxWidth: "430px", margin: "0 auto" }}>
          <Link href="/m/checkout" className="btn btn-primary w-full h-12 justify-center text-sm">
            Checkout — {(total + shipping).toLocaleString("fr-MA")} MAD
          </Link>
        </div>
      )}
    </MobileLayout>
  );
}

function CartItemRow({
  item,
  onQuantityChange,
  onRemove,
}: {
  item: CartItem;
  onQuantityChange: (q: number) => void;
  onRemove: () => void;
}) {
  const price = item.variant?.price ?? item.product.price;

  return (
    <div className="card-luxury rounded-2xl flex gap-3 p-3 items-start">
      {/* Image */}
      <Link href={`/m/products/${item.product.slug}`}
        className="flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden bg-muted">
        <img src={item.product.images[0] || "/placeholder-product.png"} alt={item.product.name}
          className="w-full h-full object-cover" loading="lazy" />
      </Link>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-sm font-semibold text-foreground truncate">{item.product.name}</p>
            {item.variant && (
              <p className="text-xs text-muted-foreground">{item.variant.label}</p>
            )}
          </div>
          <button onClick={onRemove} aria-label="Remove"
            className="flex-shrink-0 w-6 h-6 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:text-destructive transition-colors">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Price + stepper */}
        <div className="flex items-center justify-between mt-3">
          <span className="text-sm font-bold text-foreground">
            {(price * item.quantity).toLocaleString("fr-MA")} MAD
          </span>

          {/* Stepper */}
          <div className={cn(
            "flex items-center border border-border rounded-xl overflow-hidden",
            "text-sm font-semibold"
          )}>
            <button onClick={() => onQuantityChange(item.quantity - 1)}
              className="w-8 h-8 flex items-center justify-center text-muted-foreground hover:bg-muted transition-colors">
              −
            </button>
            <span className="w-6 text-center text-foreground">{item.quantity}</span>
            <button onClick={() => onQuantityChange(item.quantity + 1)}
              className="w-8 h-8 flex items-center justify-center text-muted-foreground hover:bg-muted transition-colors">
              +
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
