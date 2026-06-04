// src/app/admin/page.tsx
"use client";
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend
} from "recharts";
import {
  TrendingUp, TrendingDown, Package, ShoppingCart, Users, DollarSign,
  AlertTriangle, ArrowRight, Eye, MoreHorizontal, Activity
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { formatPrice } from "@/utils/format";
import { formatDistanceToNow } from "date-fns";

const STATUS_COLORS: Record<string, string> = {
  PENDING: "#f59e0b",
  CONFIRMED: "#3b82f6",
  PROCESSING: "#8b5cf6",
  SHIPPED: "#06b6d4",
  DELIVERED: "#22c55e",
  CANCELLED: "#ef4444",
  REFUNDED: "#6b7280",
};

const CHART_COLORS = ["#f97316", "#3b82f6", "#22c55e", "#8b5cf6", "#ec4899"];

const RANGE_OPTIONS = [
  { label: "7D", value: 7 },
  { label: "30D", value: 30 },
  { label: "90D", value: 90 },
];

export default function AdminDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState(30);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/admin/analytics?range=${range}`)
      .then((r) => r.json())
      .then((d) => { setData(d.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [range]);

  const metrics = data?.summary;

  const StatCard = ({
    icon: Icon, label, value, change, prefix = "", color = "brand"
  }: {
    icon: React.ElementType; label: string; value: number; change: number;
    prefix?: string; color?: string;
  }) => {
    const up = change >= 0;
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card border border-border rounded-2xl p-6 space-y-4"
      >
        <div className="flex items-center justify-between">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center bg-${color}-100 dark:bg-${color}-900/30`}>
            <Icon className={`w-5 h-5 text-${color}-600 dark:text-${color}-400`} />
          </div>
          <span className={`flex items-center gap-1 text-sm font-semibold ${up ? "text-green-600" : "text-red-500"}`}>
            {up ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
            {Math.abs(change).toFixed(1)}%
          </span>
        </div>
        <div>
          <p className="text-muted-foreground text-sm">{label}</p>
          <p className="text-2xl font-bold mt-1">
            {loading ? (
              <span className="skeleton inline-block h-7 w-24 rounded" />
            ) : (
              `${prefix}${typeof value === "number" ? value.toLocaleString() : value}`
            )}
          </p>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground text-sm mt-1">Welcome back! Here&apos;s what&apos;s happening.</p>
        </div>
        <div className="flex items-center gap-2 bg-muted rounded-xl p-1">
          {RANGE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setRange(opt.value)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                range === opt.value
                  ? "bg-background shadow text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={DollarSign} label="Revenue" prefix="$"
          value={metrics?.revenue.total || 0} change={metrics?.revenue.change || 0}
          color="brand"
        />
        <StatCard
          icon={ShoppingCart} label="Orders"
          value={metrics?.orders.total || 0} change={metrics?.orders.change || 0}
          color="blue"
        />
        <StatCard
          icon={Users} label="New Users"
          value={metrics?.users.total || 0} change={metrics?.users.change || 0}
          color="purple"
        />
        <StatCard
          icon={Package} label="Products"
          value={metrics?.products.total || 0} change={0}
          color="green"
        />
      </div>

      {/* Alerts */}
      {metrics?.products.lowStock > 0 && (
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center justify-between p-4 rounded-xl bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800"
        >
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-orange-500" />
            <div>
              <p className="font-semibold text-orange-800 dark:text-orange-300 text-sm">
                {metrics.products.lowStock} products are running low on stock
              </p>
              <p className="text-xs text-orange-600 dark:text-orange-400">Review inventory to avoid stockouts</p>
            </div>
          </div>
          <Link href="/admin/products?filter=lowstock" className="text-sm font-medium text-orange-600 hover:text-orange-800 flex items-center gap-1">
            View <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </motion.div>
      )}

      {/* Charts */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Revenue chart */}
        <div className="lg:col-span-2 bg-card border border-border rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-bold">Revenue Overview</h2>
              <p className="text-muted-foreground text-sm">Last {range} days</p>
            </div>
            <Activity className="w-5 h-5 text-muted-foreground" />
          </div>
          {loading ? (
            <div className="skeleton h-64 rounded-xl" />
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={data?.chartData || []}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                  interval="preserveStartEnd"
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                  tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  contentStyle={{
                    background: "var(--background)",
                    border: "1px solid var(--border)",
                    borderRadius: "12px",
                    fontSize: 12,
                  }}
                  formatter={(v: number) => [`$${v.toFixed(2)}`, "Revenue"]}
                />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#f97316"
                  strokeWidth={2.5}
                  dot={false}
                  activeDot={{ r: 5, fill: "#f97316" }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Orders by status */}
        <div className="bg-card border border-border rounded-2xl p-6">
          <h2 className="font-bold mb-6">Orders by Status</h2>
          {loading ? (
            <div className="skeleton h-64 rounded-xl" />
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={Object.entries(data?.ordersByStatus || {}).map(([name, value]) => ({ name, value }))}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {Object.keys(data?.ordersByStatus || {}).map((key, i) => (
                    <Cell key={key} fill={STATUS_COLORS[key] || CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: "var(--background)", border: "1px solid var(--border)", borderRadius: "8px", fontSize: 12 }} />
                <Legend iconType="circle" iconSize={8} formatter={(v) => <span style={{ fontSize: 11 }}>{v}</span>} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Bottom grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Top Products */}
        <div className="bg-card border border-border rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-bold">Top Products</h2>
            <Link href="/admin/products" className="text-sm text-brand-500 hover:text-brand-600 flex items-center gap-1">
              View all <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="skeleton w-10 h-10 rounded-lg" />
                  <div className="flex-1 space-y-1">
                    <div className="skeleton h-3 rounded w-3/4" />
                    <div className="skeleton h-2 rounded w-1/4" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {(data?.topProducts || []).slice(0, 5).map((product: any, i: number) => (
                <div key={product.id} className="flex items-center gap-3">
                  <span className="text-sm font-bold text-muted-foreground w-4">{i + 1}</span>
                  <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                    <Image
                      src={product.images[0] || "/placeholder.jpg"}
                      alt={product.name}
                      fill
                      className="object-cover"
                      sizes="40px"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{product.name}</p>
                    <p className="text-xs text-muted-foreground">{product.soldCount} sold</p>
                  </div>
                  <span className="text-sm font-bold">{formatPrice(product.revenue)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Orders */}
        <div className="bg-card border border-border rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-bold">Recent Orders</h2>
            <Link href="/admin/orders" className="text-sm text-brand-500 hover:text-brand-600 flex items-center gap-1">
              View all <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="skeleton w-8 h-8 rounded-full" />
                  <div className="flex-1 space-y-1">
                    <div className="skeleton h-3 rounded w-2/3" />
                    <div className="skeleton h-2 rounded w-1/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {(data?.recentOrders || []).slice(0, 6).map((order: any) => (
                <Link
                  key={order.id}
                  href={`/admin/orders/${order.id}`}
                  className="flex items-center gap-3 p-2 rounded-xl hover:bg-muted transition-colors group"
                >
                  <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-bold flex-shrink-0">
                    {order.user?.name?.[0] || "?"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{order.user?.name || "Unknown"}</p>
                    <p className="text-xs text-muted-foreground">#{order.orderNumber}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold">{formatPrice(order.total)}</p>
                    <span
                      className="text-[10px] px-1.5 py-0.5 rounded-full font-semibold"
                      style={{
                        background: `${STATUS_COLORS[order.status]}20`,
                        color: STATUS_COLORS[order.status],
                      }}
                    >
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
