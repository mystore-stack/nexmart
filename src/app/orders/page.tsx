"use client";
// src/app/orders/page.tsx
import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Package, ChevronRight, Search, Filter } from "lucide-react";
import { formatPrice, formatDate } from "@/utils/format";
import type { Order } from "@/types";

const STATUS_STYLES: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  CONFIRMED: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  PROCESSING: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
  SHIPPED: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-400",
  DELIVERED: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  CANCELLED: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  REFUNDED: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400",
};

const STATUS_STEPS = ["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED"];

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  useEffect(() => {
    fetch("/api/orders?limit=20")
      .then((r) => r.json())
      .then((d) => { if (d.data) setOrders(d.data); })
      .finally(() => setLoading(false));
  }, []);

  const filtered = orders.filter((o) => {
    const matchSearch = !search || o.orderNumber.toLowerCase().includes(search.toLowerCase());
    const matchStatus = !statusFilter || o.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="page-enter">
      <div className="border-b border-border bg-surface">
        <div className="container-main py-6">
          <h1 className="font-display text-3xl font-semibold">Mes Commandes</h1>
          <p className="text-muted-foreground text-sm mt-1">Track and manage all your orders</p>
        </div>
      </div>

      <div className="container-main py-8 max-w-4xl">
        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-6">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by order number..."
              className="input pl-10 py-2.5"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="input py-2.5 w-auto min-w-[160px]"
          >
            <option value="">All Statuses</option>
            {Object.keys(STATUS_STYLES).map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="skeleton h-32 rounded-2xl" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <Package className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">No orders found</h2>
            <p className="text-muted-foreground mb-6">
              {orders.length === 0 ? "You haven't placed any orders yet." : "Try adjusting your filters."}
            </p>
            {orders.length === 0 && (
              <Link href="/products" className="btn-primary">Découvrir la boutique</Link>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((order, i) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="rounded-2xl border border-gold-200/30 dark:border-gold-800/20 bg-white dark:bg-card overflow-hidden hover:shadow-card transition-shadow"
              >
                {/* Order header */}
                <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 border-b border-border">
                  <div>
                    <p className="font-bold">#{order.orderNumber}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {formatDate(order.createdAt)} · {order.items.length} item{order.items.length !== 1 ? "s" : ""}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`badge text-xs font-semibold px-3 py-1 ${STATUS_STYLES[order.status]}`}>
                      {order.status}
                    </span>
                    <span className="font-bold">{formatPrice(order.total)}</span>
                  </div>
                </div>

                {/* Order items preview */}
                <div className="px-5 py-4">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex -space-x-2">
                      {order.items.slice(0, 3).map((item, idx) => (
                        <div key={item.id} className="relative w-10 h-10 rounded-xl overflow-hidden border-2 border-background" style={{ zIndex: 3 - idx }}>
                          <Image
                            src={item.image || "/placeholder.jpg"}
                            alt={item.name}
                            fill
                            className="object-cover"
                            sizes="40px"
                          />
                        </div>
                      ))}
                      {order.items.length > 3 && (
                        <div className="w-10 h-10 rounded-xl bg-muted border-2 border-background flex items-center justify-center text-xs font-bold">
                          +{order.items.length - 3}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {order.items[0]?.name}
                        {order.items.length > 1 ? ` & ${order.items.length - 1} more` : ""}
                      </p>
                    </div>
                  </div>

                  {/* Progress for active orders */}
                  {STATUS_STEPS.includes(order.status) && (
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        {STATUS_STEPS.map((step, idx) => {
                          const currentIdx = STATUS_STEPS.indexOf(order.status);
                          const done = idx <= currentIdx;
                          return (
                            <div key={step} className="flex flex-col items-center gap-1 flex-1">
                              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs transition-all ${done ? "bg-green-500 text-white" : "bg-muted text-muted-foreground"}`}>
                                {done ? "✓" : idx + 1}
                              </div>
                              <span className="text-[9px] text-muted-foreground hidden sm:block">{step}</span>
                              {idx < STATUS_STEPS.length - 1 && (
                                <div className={`absolute h-0.5 flex-1 ${done ? "bg-green-500" : "bg-muted"}`} />
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      {order.paymentMethod === "CASH_ON_DELIVERY" ? "Cash on Delivery" : "Paid by Card"}
                    </span>
                    <Link
                      href={`/orders/${order.orderNumber}`}
                      className="flex items-center gap-1 text-sm font-semibold text-brand-500 hover:text-brand-600 transition-colors"
                    >
                      View Details <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
