// src/app/admin/page.tsx — Dashboard Overview
'use client';

import { TrendingUp, ShoppingCart, DollarSign, Zap, AlertCircle, Users, BarChart3, ArrowUpRight, Plus } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

// Mock data
const KPIs = [
  {
    label: 'Revenue',
    value: 'MAD 124,580',
    change: '+12.5%',
    icon: DollarSign,
    color: 'from-blue-500 to-blue-600',
  },
  {
    label: 'Orders',
    value: '2,847',
    change: '+8.2%',
    icon: ShoppingCart,
    color: 'from-green-500 to-green-600',
  },
  {
    label: 'Users',
    value: '1,245',
    change: '+15.3%',
    icon: Users,
    color: 'from-purple-500 to-purple-600',
  },
  {
    label: 'Conversion',
    value: '3.2%',
    change: '+0.8%',
    icon: BarChart3,
    color: 'from-orange-500 to-orange-600',
  },
];

const revenueData = [
  { month: 'Jan', revenue: 45000, orders: 420 },
  { month: 'Feb', revenue: 52000, orders: 490 },
  { month: 'Mar', revenue: 48000, orders: 450 },
  { month: 'Apr', revenue: 61000, orders: 580 },
  { month: 'May', revenue: 55000, orders: 520 },
  { month: 'Jun', revenue: 89250, orders: 847 },
];

const topProducts = [
  { id: '1', name: 'Argan Oil Premium', sales: 1240, revenue: 24800 },
  { id: '2', name: 'Moroccan Leather Bag', sales: 890, revenue: 26700 },
  { id: '3', name: 'Berber Carpet', sales: 650, revenue: 32500 },
  { id: '4', name: 'Rose Water 100ml', sales: 2100, revenue: 10500 },
  { id: '5', name: 'Tagine Pot', sales: 420, revenue: 12600 },
];

const activeDeals = [
  { id: '1', product: 'Argan Oil', discount: 30, expiresIn: '2h' },
  { id: '2', product: 'Leather Bag', discount: 25, expiresIn: '5h' },
  { id: '3', product: 'Rose Water', discount: 15, expiresIn: '12h' },
  { id: '4', product: 'Tagine Pot', discount: 20, expiresIn: '1d' },
];

const ordersToday = [
  { id: '#12845', customer: 'Ahmed Hassan', total: 2540, status: 'shipped' },
  { id: '#12844', customer: 'Fatima Belaid', total: 1890, status: 'pending' },
  { id: '#12843', customer: 'Karim Loubna', total: 3450, status: 'delivered' },
  { id: '#12842', customer: 'Sara Mansouri', total: 1250, status: 'processing' },
];

export default function AdminDashboard() {
  const [dateFilter, setDateFilter] = useState<'7d' | '30d' | '90d'>('30d');

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.16em] text-blue-600">Thursday, July 24, 2026</p>
          <h1 className="text-3xl font-bold tracking-tight text-slate-950">Good morning, Admin.</h1>
          <p className="mt-1 text-sm text-slate-500">Here&apos;s the pulse of your marketplace today.</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="hidden items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm transition-colors hover:border-slate-300 sm:flex"><Zap className="h-4 w-4 text-blue-600" /> View storefront</button>
          <button className="flex items-center gap-2 rounded-xl bg-slate-900 px-3 py-2 text-sm font-semibold text-white shadow-sm transition-transform hover:-translate-y-0.5"><Plus className="h-4 w-4" /> Add product</button>
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
        {/* Revenue Chart */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
          <div className="mb-5 flex items-center justify-between"><div><p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Gross merchandise value</p><h2 className="mt-1 text-lg font-bold text-slate-950">Revenue trend</h2></div><ArrowUpRight className="h-5 w-5 text-emerald-500" /></div>
          <div className="space-y-4">
            {revenueData.map((month) => (
              <div key={month.month}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-slate-600">{month.month}</span>
                  <span className="text-sm font-bold text-slate-900">MAD {month.revenue.toLocaleString()}</span>
                </div>
                <div className="w-full h-8 bg-slate-100 rounded-lg overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg transition-all"
                    style={{ width: `${(month.revenue / 89250) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Products */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
          <h2 className="mb-1 text-lg font-bold text-slate-950">Top products</h2>
          <p className="mb-4 text-xs text-slate-500">Best performers this period</p>
          <div className="space-y-3">
            {topProducts.slice(0, 5).map((product) => (
              <div key={product.id} className="flex items-center justify-between pb-3 border-b border-slate-100 last:border-0">
                <div>
                  <p className="text-sm font-medium text-foreground">{product.name}</p>
                  <p className="text-xs text-slate-600">{product.sales} sales</p>
                </div>
                <p className="text-sm font-bold text-slate-900">${(product.revenue / 1000).toFixed(1)}k</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Active Deals & Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Deals */}
        <div className="bg-white rounded-lg border border-border p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-foreground">Active Flash Deals</h2>
            <Link href="/admin/deals" className="text-sm font-semibold text-brand-600 hover:text-brand-700">
              View All →
            </Link>
          </div>
          <div className="space-y-3">
            {activeDeals.map((deal) => (
              <div key={deal.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="px-2 py-1 bg-orange-100 text-orange-700 rounded text-xs font-bold">
                    -{deal.discount}%
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{deal.product}</p>
                    <p className="text-xs text-slate-600">Expires in {deal.expiresIn}</p>
                  </div>
                </div>
                <AlertCircle className="w-4 h-4 text-orange-500" />
              </div>
            ))}
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
            {ordersToday.map((order) => (
              <div key={order.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-foreground">{order.id}</p>
                  <p className="text-xs text-slate-600">{order.customer}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-slate-900">MAD {order.total}</span>
                  <span
                    className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      order.status === 'shipped'
                        ? 'bg-blue-100 text-blue-700'
                        : order.status === 'delivered'
                        ? 'bg-green-100 text-green-700'
                        : order.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
