// src/app/admin/orders/page.tsx
'use client';

import { useState } from 'react';
import { Eye, MoreVertical, Search } from 'lucide-react';
import Link from 'next/link';

const mockOrders = [
  {
    id: '#12850',
    customer: 'Ahmed Hassan',
    email: 'ahmed@example.com',
    phone: '+212 600 123 456',
    date: '2024-01-15',
    time: '14:30',
    total: 24500,
    items: 3,
    status: 'delivered',
    paymentMethod: 'card',
    shippingAddress: 'Casablanca, Morocco',
  },
  {
    id: '#12849',
    customer: 'Fatima Belaid',
    email: 'fatima@example.com',
    phone: '+212 655 987 654',
    date: '2024-01-15',
    time: '11:45',
    total: 8900,
    items: 2,
    status: 'shipped',
    paymentMethod: 'cash',
    shippingAddress: 'Rabat, Morocco',
  },
  {
    id: '#12848',
    customer: 'Karim Loubna',
    email: 'karim@example.com',
    phone: '+212 670 456 789',
    date: '2024-01-14',
    time: '16:20',
    total: 32100,
    items: 5,
    status: 'processing',
    paymentMethod: 'card',
    shippingAddress: 'Marrakech, Morocco',
  },
  {
    id: '#12847',
    customer: 'Sara Mansouri',
    email: 'sara@example.com',
    phone: '+212 661 234 567',
    date: '2024-01-14',
    time: '09:15',
    total: 15900,
    items: 2,
    status: 'pending',
    paymentMethod: 'card',
    shippingAddress: 'Tangier, Morocco',
  },
  {
    id: '#12846',
    customer: 'Mohamed Bennani',
    email: 'mohamed@example.com',
    phone: '+212 685 321 098',
    date: '2024-01-13',
    time: '13:00',
    total: 5490,
    items: 1,
    status: 'delivered',
    paymentMethod: 'cash',
    shippingAddress: 'Fes, Morocco',
  },
  {
    id: '#12845',
    customer: 'Amina El Fassi',
    email: 'amina@example.com',
    phone: '+212 690 876 543',
    date: '2024-01-13',
    time: '10:30',
    total: 42500,
    items: 4,
    status: 'cancelled',
    paymentMethod: 'card',
    shippingAddress: 'Agadir, Morocco',
  },
];

const statusColors: Record<string, { bg: string; text: string; icon: string }> = {
  pending: { bg: 'bg-yellow-100', text: 'text-yellow-700', icon: '⏳' },
  processing: { bg: 'bg-blue-100', text: 'text-blue-700', icon: '⚙️' },
  shipped: { bg: 'bg-purple-100', text: 'text-purple-700', icon: '🚚' },
  delivered: { bg: 'bg-green-100', text: 'text-green-700', icon: '✅' },
  cancelled: { bg: 'bg-red-100', text: 'text-red-700', icon: '❌' },
};

const paymentIcons: Record<string, string> = {
  card: '💳',
  cash: '💵',
};

export default function OrdersPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [orders] = useState(mockOrders);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.id.includes(searchTerm) ||
      order.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Orders</h1>
          <p className="text-slate-600 mt-1">{orders.length} total orders</p>
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 border border-border rounded-lg text-sm font-medium hover:bg-slate-50">
            Export
          </button>
          <button className="px-4 py-2 bg-brand-600 text-white rounded-lg text-sm font-medium hover:bg-brand-700">
            Create Order
          </button>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="bg-white rounded-lg border border-border p-4 shadow-sm space-y-4">
        {/* Search */}
        <div className="flex items-center gap-3 bg-slate-50 rounded-lg px-4 py-2">
          <Search className="w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by order ID, customer, or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-transparent flex-1 outline-none text-foreground placeholder:text-slate-400"
          />
        </div>

        {/* Status Filter */}
        <div className="flex gap- flex-wrap">
          {['all', 'pending', 'processing', 'shipped', 'delivered', 'cancelled'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                statusFilter === status
                  ? 'bg-brand-100 text-brand-700'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {status === 'all' ? 'All Orders' : status.charAt(0).toUpperCase() + status.slice(1)}
              {status !== 'all' && ` (${orders.filter((o) => o.status === status).length})`}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-lg border border-border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="px-6 py-3 text-left text-xs font-bold text-slate-700 uppercase">Order ID</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-slate-700 uppercase">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-slate-700 uppercase">Date & Time</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-slate-700 uppercase">Items</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-slate-700 uppercase">Total</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-slate-700 uppercase">Payment</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-slate-700 uppercase">Status</th>
                <th className="px-6 py-3 text-right text-xs font-bold text-slate-700 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredOrders.map((order) => {
                const statusColor = statusColors[order.status];
                return (
                  <tr key={order.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm font-bold text-brand-600">{order.id}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-foreground">{order.customer}</p>
                        <p className="text-xs text-slate-600">{order.email}</p>
                        <p className="text-xs text-slate-500">{order.phone}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm text-slate-700">{order.date}</p>
                        <p className="text-xs text-slate-500">{order.time}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 bg-slate-100 text-slate-700 text-sm font-medium rounded-full">
                        {order.items} items
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-bold text-foreground">MAD {order.total.toLocaleString()}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-lg" title={order.paymentMethod}>
                        {paymentIcons[order.paymentMethod] || '💳'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-full ${statusColor.bg} ${statusColor.text}`}>
                        <span>{statusColor.icon}</span>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/admin/orders/${order.id}`}
                          className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                        >
                          <Eye className="w-4 h-4 text-slate-600" />
                        </Link>
                        <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                          <MoreVertical className="w-4 h-4 text-slate-600" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
