"use client";
// src/app/admin/analytics/page.tsx
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend
} from "recharts";
import { TrendingUp, TrendingDown, DollarSign, ShoppingCart, Users, Package } from "lucide-react";
import { formatPrice } from "@/utils/format";

const RANGE_OPTIONS = [{ label: "7 jours", value: 7 }, { label: "30 jours", value: 30 }, { label: "90 jours", value: 90 }];
const COLORS = ["#f97316", "#3b82f6", "#22c55e", "#8b5cf6", "#ec4899"];

export default function AdminAnalyticsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState(30);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/admin/analytics?range=${range}`, {
      credentials: "include",
    })
      .then((r) => r.json())
      .then((d) => { setData(d.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [range]);

  const metrics = data?.summary;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Analytics</h1>
          <p className="text-muted-foreground text-sm mt-1">Performance détaillée de la boutique</p>
        </div>
        <div className="flex items-center gap-2 bg-muted rounded-xl p-1">
          {RANGE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setRange(opt.value)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                range === opt.value ? "bg-background shadow text-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {loading ? Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="skeleton h-28 rounded-2xl" />
        )) : [
          { icon: DollarSign, label: "Chiffre d'affaires", value: formatPrice(metrics?.revenue.total || 0), change: metrics?.revenue.change || 0 },
          { icon: ShoppingCart, label: "Commandes", value: (metrics?.orders.total || 0).toLocaleString(), change: metrics?.orders.change || 0 },
          { icon: Users, label: "Nouveaux clients", value: (metrics?.users.total || 0).toLocaleString(), change: metrics?.users.change || 0 },
          { icon: Package, label: "Produits", value: (metrics?.products.total || 0).toLocaleString(), change: 0 },
        ].map(({ icon: Icon, label, value, change }, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
            className="bg-card border border-border rounded-2xl p-5"
          >
            <div className="flex items-center justify-between mb-3">
              <Icon className="w-5 h-5 text-muted-foreground" />
              <span className={`flex items-center gap-1 text-xs font-semibold ${change >= 0 ? "text-green-600" : "text-red-500"}`}>
                {change >= 0 ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                {Math.abs(change).toFixed(1)}%
              </span>
            </div>
            <p className="text-xs text-muted-foreground mb-1">{label}</p>
            <p className="text-2xl font-bold">{value}</p>
          </motion.div>
        ))}
      </div>

      {/* Revenue chart */}
      <div className="bg-card border border-border rounded-2xl p-6">
        <h2 className="font-bold mb-5">Évolution du chiffre d&apos;affaires</h2>
        {loading ? (
          <div className="skeleton h-64 rounded-xl" />
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={data?.chartData || []}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} interval="preserveStartEnd" />
              <YAxis tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} tickFormatter={(v) => `$${(v/1000).toFixed(0)}k`} />
              <Tooltip
                contentStyle={{ background: "var(--background)", border: "1px solid var(--border)", borderRadius: "12px", fontSize: 12 }}
                formatter={(v: number) => [`$${v.toFixed(2)}`, "Revenue"]}
              />
              <Line type="monotone" dataKey="revenue" stroke="#f97316" strokeWidth={2.5} dot={false} activeDot={{ r: 5 }} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Charts row */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Orders bar chart */}
        <div className="bg-card border border-border rounded-2xl p-6">
          <h2 className="font-bold mb-5">Commandes par jour</h2>
          {loading ? <div className="skeleton h-52 rounded-xl" /> : (
            <ResponsiveContainer width="100%" height={210}>
              <BarChart data={data?.chartData || []}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} interval="preserveStartEnd" />
                <YAxis tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} />
                <Tooltip contentStyle={{ background: "var(--background)", border: "1px solid var(--border)", borderRadius: "10px", fontSize: 11 }} />
                <Bar dataKey="orders" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Top products */}
        <div className="bg-card border border-border rounded-2xl p-6">
          <h2 className="font-bold mb-5">Top Produits</h2>
          {loading ? <div className="skeleton h-52 rounded-xl" /> : (
            <div className="space-y-3">
              {(data?.topProducts || []).slice(0, 5).map((p: any, i: number) => {
                const maxRevenue = data.topProducts[0]?.revenue || 1;
                return (
                  <div key={p.id} className="flex items-center gap-3">
                    <span className="text-sm font-bold text-muted-foreground w-4">{i + 1}</span>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-xs font-medium truncate max-w-[60%]">{p.name}</p>
                        <p className="text-xs font-bold">{formatPrice(p.revenue)}</p>
                      </div>
                      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{ width: `${(p.revenue / maxRevenue) * 100}%`, background: COLORS[i % COLORS.length] }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
