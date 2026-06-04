"use client";
// src/app/orders/[orderNumber]/page.tsx
import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  Package, MapPin, CreditCard, Truck, Check, Clock,
  RotateCcw, AlertCircle, ArrowLeft, Share2, Download
} from "lucide-react";
import { formatPrice, formatDateTime } from "@/utils/format";
import type { Order } from "@/types";
import toast from "react-hot-toast";

const STATUS_STEPS = [
  { key: "PENDING", label: "Order Placed", icon: Clock },
  { key: "CONFIRMED", label: "Confirmed", icon: Check },
  { key: "PROCESSING", label: "Processing", icon: Package },
  { key: "SHIPPED", label: "Shipped", icon: Truck },
  { key: "DELIVERED", label: "Delivered", icon: Check },
];

const STATUS_COLOR: Record<string, string> = {
  PENDING: "text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-400",
  CONFIRMED: "text-blue-600 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400",
  PROCESSING: "text-purple-600 bg-purple-100 dark:bg-purple-900/30 dark:text-purple-400",
  SHIPPED: "text-cyan-600 bg-cyan-100 dark:bg-cyan-900/30 dark:text-cyan-400",
  DELIVERED: "text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400",
  CANCELLED: "text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400",
  REFUNDED: "text-gray-600 bg-gray-100 dark:bg-gray-900/30 dark:text-gray-400",
};

export default function OrderDetailPage() {
  const { orderNumber } = useParams<{ orderNumber: string }>();
  const searchParams = useSearchParams();
  const justOrdered = searchParams.get("success") === "true";

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/orders/${orderNumber}`)
      .then((r) => r.json())
      .then((d) => { if (d.success) setOrder(d.data); })
      .finally(() => setLoading(false));
  }, [orderNumber]);

  const currentStepIdx = order
    ? STATUS_STEPS.findIndex((s) => s.key === order.status)
    : -1;

  if (loading) {
    return (
      <div className="container-main py-12 max-w-3xl">
        <div className="space-y-4">
          <div className="skeleton h-8 w-48 rounded" />
          <div className="skeleton h-32 rounded-2xl" />
          <div className="skeleton h-64 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container-main py-20 text-center">
        <AlertCircle className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
        <h2 className="text-xl font-bold mb-2">Order not found</h2>
This order doesn&apos;t exist or you don&apos;t have access.
        <Link href="/orders" className="btn-primary">View My Orders</Link>
      </div>
    );
  }

  return (
    <div className="page-enter">
      <div className="border-b border-border bg-surface">
        <div className="container-main py-4">
          <Link href="/orders" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to Orders
          </Link>
        </div>
      </div>

      <div className="container-main py-8 max-w-3xl">
        {/* Success banner */}
        {justOrdered && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-4 p-5 mb-8 rounded-2xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800"
          >
            <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
              <Check className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-green-800 dark:text-green-300 text-lg">
                Order Confirmed! 🎉
              </h2>
              <p className="text-sm text-green-700 dark:text-green-400 mt-0.5">
                Thank you for your order. You&apos;ll receive a confirmation email shortly.
              </p>
            </div>
          </motion.div>
        )}

        {/* Header */}
        <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold">Order #{order.orderNumber}</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Placed {formatDateTime(order.createdAt)}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className={`badge text-xs font-semibold px-3 py-1.5 ${STATUS_COLOR[order.status] || ""}`}>
              {order.status}
            </span>
            <button
              onClick={() => { navigator.clipboard.writeText(window.location.href); toast.success("Link copied!"); }}
              className="btn-ghost p-2"
              aria-label="Share order"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Progress tracker */}
        {STATUS_STEPS.some((s) => s.key === order.status) && (
          <div className="bg-card border border-border rounded-2xl p-6 mb-6">
            <h2 className="font-semibold mb-5">Order Progress</h2>
            <div className="relative">
              {/* Progress line */}
              <div className="absolute top-5 left-5 right-5 h-0.5 bg-border">
                <div
                  className="h-full bg-green-500 transition-all duration-700"
                  style={{
                    width: currentStepIdx >= 0
                      ? `${(currentStepIdx / (STATUS_STEPS.length - 1)) * 100}%`
                      : "0%"
                  }}
                />
              </div>

              <div className="relative flex items-start justify-between">
                {STATUS_STEPS.map((step, i) => {
                  const done = i <= currentStepIdx;
                  const active = i === currentStepIdx;
                  const Icon = step.icon;

                  return (
                    <div key={step.key} className="flex flex-col items-center gap-2 w-16 text-center">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 z-10 transition-all duration-300 ${
                        done
                          ? "bg-green-500 border-green-500 text-white"
                          : "bg-background border-border text-muted-foreground"
                      } ${active ? "ring-4 ring-green-200 dark:ring-green-900/40" : ""}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className={`text-[10px] font-medium leading-tight ${done ? "text-foreground" : "text-muted-foreground"}`}>
                        {step.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {order.trackingNumber && (
              <div className="mt-5 pt-5 border-t border-border flex items-center gap-3">
                <Truck className="w-5 h-5 text-brand-500 flex-shrink-0" />
                <div>
                  <p className="text-sm font-semibold">Tracking Number</p>
                  <p className="text-sm text-muted-foreground font-mono">{order.trackingNumber}</p>
                </div>
              </div>
            )}
          </div>
        )}

        {order.status === "CANCELLED" && (
          <div className="flex items-center gap-3 p-4 mb-6 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
            <AlertCircle className="w-5 h-5 text-red-500" />
            <p className="text-sm text-red-700 dark:text-red-400">
              This order has been cancelled.&nbsp;
              {order.paymentStatus === "PAID" && "A refund will be processed within 5–7 business days."}
            </p>
          </div>
        )}

        {/* Order items */}
        <div className="bg-card border border-border rounded-2xl overflow-hidden mb-6">
          <div className="px-6 py-4 border-b border-border">
            <h2 className="font-semibold flex items-center gap-2">
              <Package className="w-5 h-5 text-muted-foreground" />
              Items ({order.items.length})
            </h2>
          </div>
          <div className="divide-y divide-border">
            {order.items.map((item) => (
              <div key={item.id} className="flex items-center gap-4 px-6 py-4">
                <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-muted flex-shrink-0">
                  <Image
                    src={item.image || "/placeholder.jpg"}
                    alt={item.name}
                    fill
                    className="object-cover"
                    sizes="64px"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm line-clamp-2">{item.name}</p>
                  {item.variant && (
                    <p className="text-xs text-muted-foreground mt-0.5">{item.variant.label}</p>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">Qty: {item.quantity}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold">{formatPrice(item.price * item.quantity)}</p>
                  <p className="text-xs text-muted-foreground">{formatPrice(item.price)} each</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Two-col info */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          {/* Delivery address */}
          <div className="bg-card border border-border rounded-2xl p-5">
            <h2 className="font-semibold mb-3 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-muted-foreground" />
              Delivery Address
            </h2>
            {order.address && (
              <div className="text-sm text-muted-foreground space-y-0.5">
                <p className="font-semibold text-foreground">{order.address.name}</p>
                <p>{order.address.phone}</p>
                <p>{order.address.line1}</p>
                {order.address.line2 && <p>{order.address.line2}</p>}
                <p>{order.address.city}, {order.address.state} {order.address.zip}</p>
                <p>{order.address.country}</p>
              </div>
            )}
          </div>

          {/* Payment info */}
          <div className="bg-card border border-border rounded-2xl p-5">
            <h2 className="font-semibold mb-3 flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-muted-foreground" />
              Payment
            </h2>
            <div className="text-sm space-y-2">
              <div className="flex justify-between text-muted-foreground">
                <span>Method</span>
                <span className="font-medium text-foreground">
                  {order.paymentMethod === "STRIPE" ? "Credit Card" : "Cash on Delivery"}
                </span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Status</span>
                <span className={`font-semibold ${
                  order.paymentStatus === "PAID" ? "text-green-600"
                  : order.paymentStatus === "FAILED" ? "text-red-500"
                  : "text-yellow-600"
                }`}>
                  {order.paymentStatus}
                </span>
              </div>
              {order.coupon && (
                <div className="flex justify-between text-green-600">
                  <span>Coupon ({order.coupon.code})</span>
                  <span>−{formatPrice(order.discount)}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Price summary */}
        <div className="bg-card border border-border rounded-2xl p-6 mb-6">
          <h2 className="font-semibold mb-4">Price Summary</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-muted-foreground">
              <span>Subtotal</span>
              <span>{formatPrice(order.subtotal)}</span>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Discount</span>
                <span>−{formatPrice(order.discount)}</span>
              </div>
            )}
            <div className="flex justify-between text-muted-foreground">
              <span>Shipping</span>
              <span>{order.shipping === 0 ? "FREE" : formatPrice(order.shipping)}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Tax</span>
              <span>{formatPrice(order.tax)}</span>
            </div>
            <div className="pt-3 border-t border-border flex justify-between font-bold text-base">
              <span>Total</span>
              <span>{formatPrice(order.total)}</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-3">
          <Link href="/products" className="btn-primary py-3 px-6">
            Continue Shopping
          </Link>
          {order.status === "DELIVERED" && (
            <Link
              href={`/products?review=${order.items[0]?.productId}`}
              className="btn-outline py-3 px-6"
            >
              Write a Review
            </Link>
          )}
          {["PENDING", "CONFIRMED"].includes(order.status) && (
            <button
              onClick={() => toast("To cancel this order, please contact support.")}
              className="btn-ghost py-3 px-6 text-destructive"
            >
              <RotateCcw className="w-4 h-4" />
              Request Cancellation
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
