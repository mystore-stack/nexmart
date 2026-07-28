// src/app/admin/page.tsx — Dashboard Overview
'use client';

import { TrendingUp, ShoppingCart, DollarSign, Users, BarChart3, ArrowUpRight, Plus, Package, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';

interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  totalUsers: number;
  totalProducts: number;
  recentOrders: Array<{
    id: string;
    orderNumber: string;
    user: { name: string; email: string };
    total: number;
    status: string;
    createdAt: string;
  }>;
  topProducts: Array<{
    id: string;
    name: string;
    soldCount: number;
    price: number;
  }>;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState<'7d' | '30d' | '90d'>('30d');

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/analytics');
      if (!response.ok) throw new Error('Failed to fetch stats');
      const data = await response.json();
      setStats(data.data || null);
    } catch (error) {
      console.error('Error fetching stats:', error);
      setStats(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [dateFilter]);

  const KPIs = stats ? [
    {
      label: 'Revenue',
      value: `MAD ${(stats.totalRevenue || 0).toLocaleString()}`,
      change: '+0%',
      icon: DollarSign,
      color: 'from-blue-500 to-blue-600',
    },
    {
      label: 'Orders',
      value: (stats.totalOrders || 0).toString(),
      change: '+0%',
      icon: ShoppingCart,
      color: 'from-green-500 to-green-600',
    },
    {
      label: 'Users',
      value: (stats.totalUsers || 0).toString(),
      change: '+0%',
      icon: Users,
      color: 'from-purple-500 to-purple-600',
    },
    {
      label: 'Products',
      value: (stats.totalProducts || 0).toString(),
      change: '+0%',
      icon: BarChart3,
      color: 'from-orange-500 to-orange-600',
    },
  ] : [];

  // Loading State
  if (loading) {
    return (
      <div className="space-y-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-950">Dashboard</h1>
            <p className="mt-1 text-sm text-slate-500">Loading...</p>
          </div>
        </div>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
        </div>
      </div>
    );
  }

  // Empty State
  if (!stats) {
    return (
      <div className="space-y-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-950">Dashboard</h1>
            <p className="mt-1 text-sm text-slate-500">No data available</p>
          </div>
        </div>
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
            <Package className="w-8 h-8 text-slate-400" />
          </div>
          <h2 className="text-lg font-medium text-foreground mb-2">No data yet</h2>
          <p className="text-sm text-slate-500 text-center max-w-md">
            Start by adding products and making sales to see your dashboard come to life.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.16em] text-blue-600">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
          <h1 className="text-3xl font-bold tracking-tight text-slate-950">Good morning, Admin.</h1>
          <p className="mt-1 text-sm text-slate-500">Here&apos;s the pulse of your marketplace today.</p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/admin/products/new"
            className="flex items-center gap-2 rounded-xl bg-slate-900 px-3 py-2 text-sm font-semibold text-white shadow-sm transition-transform hover:-translate-y-0.5"
          >
            <Plus className="h-4 w-4" /> Add product
          </Link>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-slate-500">Performance window</p>
        <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white p-1 shadow-sm">
          {(['7d', '30d', '90d'] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setDateFilter(filter)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                dateFilter === filter
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-500 hover:bg-slate-100'
              }`}
            >
              {filter === '7d' ? '7 Days' : filter === '30d' ? '30 Days' : '90 Days'}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {KPIs.map(({ label, value, change, icon: Icon, color }) => (
          <div key={label} className="group rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.03)] transition-all hover:-translate-y-0.5 hover:shadow-lg">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-xs font-semibold text-slate-500">{label}</p>
                <p className="mt-2 text-2xl font-bold tracking-tight text-slate-950">{value}</p>
              </div>
              <div className={`rounded-xl bg-gradient-to-br ${color} p-2.5 shadow-sm`}>
                <Icon className="w-5 h-5 text-white" />
              </div>
            </div>
            <p className="mt-5 flex items-center gap-1 text-xs font-semibold text-emerald-600"><TrendingUp className="h-3.5 w-3.5" />{change} from last month</p>
          </div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Products */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Performance</p>
              <h2 className="mt-1 text-lg font-bold text-slate-950">Top products</h2>
            </div>
            <ArrowUpRight className="h-5 w-5 text-emerald-500" />
          </div>
          <div className="space-y-3">
            {stats.topProducts?.slice(0, 5).map((product) => (
              <div key={product.id} className="flex items-center justify-between pb-3 border-b border-slate-100 last:border-0">
                <div>
                  <p className="text-sm font-medium text-foreground">{product.name}</p>
                  <p className="text-xs text-slate-600">{product.soldCount} sales</p>
                </div>
                <p className="text-sm font-bold text-slate-900">MAD {(product.price * product.soldCount).toLocaleString()}</p>
              </div>
            ))}
            {(!stats.topProducts || stats.topProducts.length === 0) && (
              <p className="text-sm text-slate-500 text-center py-4">No products yet</p>
            )}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
          <h2 className="mb-1 text-lg font-bold text-slate-950">Quick Stats</h2>
          <p className="mb-4 text-xs text-slate-500">Current performance</p>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">Total Revenue</span>
              <span className="text-sm font-bold text-slate-900">MAD {(stats.totalRevenue || 0).toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">Total Orders</span>
              <span className="text-sm font-bold text-slate-900">{stats.totalOrders || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">Active Users</span>
              <span className="text-sm font-bold text-slate-900">{stats.totalUsers || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">Products</span>
              <span className="text-sm font-bold text-slate-900">{stats.totalProducts || 0}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-lg border border-border p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-foreground">Recent Orders</h2>
          <Link href="/admin/orders" className="text-sm font-semibold text-brand-600 hover:text-brand-700">
            View All →
          </Link>
        </div>
        <div className="space-y-3">
          {stats.recentOrders?.slice(0, 5).map((order) => (
            <div key={order.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
              <div>
                <p className="text-sm font-medium text-foreground">{order.orderNumber}</p>
                <p className="text-xs text-slate-600">{order.user.name}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-bold text-slate-900">MAD {order.total}</span>
                <span
                  className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    order.status === 'DELIVERED'
                      ? 'bg-green-100 text-green-700'
                      : order.status === 'SHIPPED'
                      ? 'bg-blue-100 text-blue-700'
                      : order.status === 'PENDING'
                      ? 'bg-yellow-100 text-yellow-700'
                      : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  {order.status.charAt(0) + order.status.slice(1).toLowerCase()}
                </span>
              </div>
            </div>
          ))}
          {(!stats.recentOrders || stats.recentOrders.length === 0) && (
            <p className="text-sm text-slate-500 text-center py-4">No orders yet</p>
          )}
        </div>
      </div>
    </div>
  );
}
