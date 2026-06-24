// src/app/admin/page.tsx
"use client";
import React, { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  Bell,
  Brain,
  DollarSign,
  Package,
  RefreshCw,
  ShoppingCart,
  Sparkles,
  TrendingDown,
  TrendingUp,
  Users,
} from "lucide-react";
import toast from "react-hot-toast";
import { formatPrice } from "@/utils/format";

const STATUS_COLORS: Record<string, string> = {
  PENDING: "#f59e0b",
  CONFIRMED: "#0ea5e9",
  PROCESSING: "#8b5cf6",
  SHIPPED: "#06b6d4",
  DELIVERED: "#10b981",
  CANCELLED: "#f43f5e",
  REFUNDED: "#71717a",
};

const RANGE_OPTIONS = [
  { label: "7D", value: 7 },
  { label: "30D", value: 30 },
  { label: "90D", value: 90 },
];

const STAT_STYLES = {
  revenue: "from-violet-600 to-indigo-600",
  orders: "from-sky-500 to-cyan-500",
  users: "from-emerald-500 to-teal-500",
  products: "from-amber-500 to-orange-500",
};

function StatCard({
  icon: Icon,
  label,
  value,
  change,
  prefix = "",
  tone,
  loading,
}: {
  icon: React.ElementType;
  label: string;
  value: number;
  change: number;
  prefix?: string;
  tone: keyof typeof STAT_STYLES;
  loading: boolean;
}) {
  const up = change >= 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      className="card-luxury p-5"
    >
      <div className="flex items-start justify-between">
        <div className={`grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br ${STAT_STYLES[tone]} text-white shadow-lg`}>
          <Icon className="h-5 w-5" />
        </div>
        <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-black ${up ? "bg-emerald-500/10 text-emerald-600" : "bg-rose-500/10 text-rose-600"}`}>
          {up ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
          {Math.abs(change).toFixed(1)}%
        </span>
      </div>
      <div className="mt-5">
        <p className="text-sm font-semibold text-muted-foreground">{label}</p>
        <p className="mt-1 text-2xl font-black tracking-tight">
          {loading ? <span className="skeleton inline-block h-8 w-28 rounded-xl" /> : `${prefix}${typeof value === "number" ? value.toLocaleString() : value}`}
        </p>
      </div>
    </motion.div>
  );
}

export default function AdminDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState(30);
  const [isConnected, setIsConnected] = useState(false);
  const eventSourceRef = useRef<EventSource | null>(null);

  const fetchAnalytics = useCallback(() => {
    setLoading(true);
    fetch(`/api/admin/analytics?range=${range}`, {
      credentials: "include",
    })
      .then((r) => r.json())
      .then((d) => {
        setData(d.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [range]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  // SSE connection for real-time updates
  useEffect(() => {
    const eventSource = new EventSource("/api/admin/events");
    eventSourceRef.current = eventSource;

    eventSource.onopen = () => {
      setIsConnected(true);
      console.log("[SSE] Connected to admin events");
    };

    eventSource.onerror = (error) => {
      console.error("[SSE] Connection error:", error);
      setIsConnected(false);
    };

    eventSource.addEventListener("connected", (event) => {
      console.log("[SSE] Server confirmed connection");
    });

    eventSource.addEventListener("orders", (event) => {
      if (!event.data || event.data === "") return;
      try {
        const data = JSON.parse(event.data);
        if (data.type === "new_orders") {
          // Show toast notification for new orders
          data.orders.forEach((order: any) => {
            toast.success(
              `🛒 New Order #${order.orderNumber} - ${formatPrice(order.total)}`,
              {
                duration: 5000,
                icon: <ShoppingCart className="w-5 h-5" />,
              }
            );
          });
          // Refresh analytics to include new order
          fetchAnalytics();
        }
      } catch (err) {
        console.error("[SSE] Failed to parse orders event:", err);
      }
    });

    eventSource.addEventListener("inventory", (event) => {
      if (!event.data || event.data === "") return;
      try {
        const data = JSON.parse(event.data);
        if (data.type === "inventory_alert") {
          data.products.forEach((product: any) => {
            toast.error(
              `⚠️ Low Stock: ${product.name} (${product.stock} left)`,
              {
                duration: 8000,
                icon: <Bell className="w-5 h-5" />,
              }
            );
          });
          // Refresh analytics to update low stock count
          fetchAnalytics();
        }
      } catch (err) {
        console.error("[SSE] Failed to parse inventory event:", err);
      }
    });

    return () => {
      eventSource.close();
      eventSourceRef.current = null;
    };
  }, [fetchAnalytics]);

  const metrics = data?.summary;
  const ordersByStatus = Object.entries(data?.ordersByStatus || {}).map(([name, value]) => ({ name, value }));

  return (
    <div className="space-y-8">
      <div className="rounded-[1.75rem] bg-foreground p-6 text-background shadow-luxury-lg md:p-8">
        <div className="grid gap-6 lg:grid-cols-[1fr_320px] lg:items-end">
          <div>
            <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-xs font-black uppercase text-sky-100">
              <Brain className="h-3.5 w-3.5" />
              AI operations cockpit
            </span>
            <h1 className="max-w-3xl text-3xl font-black tracking-tight text-white md:text-5xl">
              Revenue, inventory, and buyer intent in one calm command center.
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-white/60">
              Monitor conversion signals, stock risk, order flow, and product momentum with a premium dark interface.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur">
            <div className="flex items-center gap-3">
              <div className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-violet-500 to-sky-400">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-black text-white">AI insight</p>
                <p className="text-xs text-white/58">Bundle low-stock winners with trending accessories today.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black tracking-tight">Performance Overview</h2>
          <p className="mt-1 text-sm text-muted-foreground">Live commercial health for the last {range} days.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium ${
            isConnected 
              ? "bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400" 
              : "bg-red-500/10 text-red-600 dark:bg-red-500/20 dark:text-red-400"
          }`}>
            <div className={`w-2 h-2 rounded-full ${isConnected ? "bg-emerald-500 animate-pulse" : "bg-red-500"}`} />
            {isConnected ? "Live Updates" : "Disconnected"}
          </div>
          <button
            onClick={() => {
              setLoading(true);
              fetch(`/api/admin/analytics?range=${range}`, {
                credentials: "include",
              })
                .then((r) => r.json())
                .then((d) => {
                  setData(d.data);
                  setLoading(false);
                })
                .catch(() => setLoading(false));
            }}
            disabled={loading}
            className="btn-outline py-2 px-3 text-sm"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
          <div className="flex items-center gap-1 rounded-2xl border border-border bg-card p-1 shadow-sm">
            {RANGE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setRange(opt.value)}
                className={`rounded-xl px-4 py-2 text-sm font-black transition-all ${
                  range === opt.value ? "bg-foreground text-background shadow" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={DollarSign} label="Revenue" prefix="DH" value={metrics?.revenue?.total || 0} change={metrics?.revenue?.change || 0} tone="revenue" loading={loading} />
        <StatCard icon={ShoppingCart} label="Orders" value={metrics?.orders?.total || 0} change={metrics?.orders?.change || 0} tone="orders" loading={loading} />
        <StatCard icon={Users} label="New Users" value={metrics?.users?.total || 0} change={metrics?.users?.change || 0} tone="users" loading={loading} />
        <StatCard icon={Package} label="Products" value={metrics?.products?.total || 0} change={0} tone="products" loading={loading} />
      </div>

      {metrics?.products?.lowStock > 0 && (
        <motion.div
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex flex-col gap-4 rounded-2xl border border-amber-500/20 bg-amber-500/10 p-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            <div>
              <p className="text-sm font-black text-amber-700 dark:text-amber-300">{metrics?.products?.lowStock} products are running low on stock</p>
              <p className="text-xs text-amber-700/70 dark:text-amber-300/70">Review inventory to avoid stockouts on high-intent items.</p>
            </div>
          </div>
          <Link href="/admin/products?filter=lowstock" className="inline-flex items-center gap-1 text-sm font-black text-amber-700 dark:text-amber-300">
            View products <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </motion.div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="card-luxury p-6 lg:col-span-2">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="font-black">Revenue Overview</h2>
              <p className="text-sm text-muted-foreground">Sales velocity and conversion demand.</p>
            </div>
            <Activity className="h-5 w-5 text-muted-foreground" />
          </div>
          {loading ? (
            <div className="skeleton h-72 rounded-2xl" />
          ) : (
            <ResponsiveContainer width="100%" height={290}>
              <AreaChart data={data?.chartData || []}>
                <defs>
                  <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.38} />
                    <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} interval="preserveStartEnd" />
                <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                <Tooltip
                  contentStyle={{
                    background: "hsl(var(--background))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "14px",
                    fontSize: 12,
                  }}
                  formatter={(v: number) => [`$${v.toFixed(2)}`, "Revenue"]}
                />
                <Area type="monotone" dataKey="revenue" stroke="#7c3aed" strokeWidth={3} fill="url(#revenueGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="card-luxury p-6">
          <h2 className="mb-2 font-black">Order Mix</h2>
          <p className="mb-6 text-sm text-muted-foreground">Fulfillment status distribution.</p>
          {loading ? (
            <div className="skeleton h-72 rounded-2xl" />
          ) : (
            <ResponsiveContainer width="100%" height={290}>
              <PieChart>
                <Pie data={ordersByStatus} cx="50%" cy="50%" innerRadius={66} outerRadius={96} paddingAngle={4} dataKey="value">
                  {ordersByStatus.map((entry, i) => (
                    <Cell key={entry.name} fill={STATUS_COLORS[entry.name] || Object.values(STATUS_COLORS)[i % Object.values(STATUS_COLORS).length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: "hsl(var(--background))", border: "1px solid hsl(var(--border))", borderRadius: "12px", fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card-luxury p-6">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="font-black">Top Products</h2>
            <Link href="/admin/products" className="inline-flex items-center gap-1 text-sm font-black text-brand-600">
              View all <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          {loading ? (
            <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="skeleton h-14 rounded-2xl" />)}</div>
          ) : (
            <div className="space-y-3">
              {(data?.topProducts || []).slice(0, 5).map((product: any, i: number) => (
                <div key={product.id} className="flex items-center gap-3 rounded-2xl border border-border/70 bg-background/70 p-2">
                  <span className="w-6 text-center text-sm font-black text-muted-foreground">{i + 1}</span>
                  <div className="relative h-11 w-11 flex-shrink-0 overflow-hidden rounded-xl bg-muted">
                    <Image src={product.images[0] || "/placeholder.jpg"} alt={product.name} fill className="object-cover" sizes="44px" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold">{product.name}</p>
                    <p className="text-xs text-muted-foreground">{product.soldCount} sold</p>
                  </div>
                  <span className="text-sm font-black">{formatPrice(product.revenue)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card-luxury p-6">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="font-black">Recent Orders</h2>
            <Link href="/admin/orders" className="inline-flex items-center gap-1 text-sm font-black text-brand-600">
              View all <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          {loading ? (
            <div className="space-y-3">{Array.from({ length: 6 }).map((_, i) => <div key={i} className="skeleton h-14 rounded-2xl" />)}</div>
          ) : (
            <div className="space-y-3">
              {(data?.recentOrders || []).slice(0, 6).map((order: any) => (
                <Link key={order.id} href={`/admin/orders/${order.id}`} className="flex items-center gap-3 rounded-2xl border border-border/70 bg-background/70 p-2 transition-colors hover:bg-muted">
                  <div className="grid h-10 w-10 flex-shrink-0 place-items-center rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 text-xs font-black text-white">
                    {order.user?.name?.[0] || "?"}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold">{order.user?.name || "Unknown"}</p>
                    <p className="text-xs text-muted-foreground">#{order.orderNumber}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-black">{formatPrice(order.total)}</p>
                    <span className="rounded-full px-2 py-0.5 text-[10px] font-black" style={{ background: `${STATUS_COLORS[order.status]}20`, color: STATUS_COLORS[order.status] }}>
                      {order.status}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
