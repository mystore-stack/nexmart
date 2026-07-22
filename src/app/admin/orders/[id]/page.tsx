// src/app/admin/orders/[id]/page.tsx
'use client';

import { useState } from 'react';
import { ArrowLeft, Package, MapPin, Phone, Mail, CreditCard, Truck, CheckCircle, XCircle, Clock, Edit2, Printer } from 'lucide-react';
import Link from 'next/link';

const mockOrder = {
  id: '#12850',
  customer: {
    name: 'Ahmed Hassan',
    email: 'ahmed@example.com',
    phone: '+212 600 123 456',
  },
  shippingAddress: {
    street: '123 Rue Mohammed V',
    city: 'Casablanca',
    postalCode: '20000',
    country: 'Morocco',
  },
  date: '2024-01-15',
  time: '14:30',
  status: 'delivered',
  paymentMethod: 'card',
  paymentStatus: 'paid',
  subtotal: 24500,
  shipping: 0,
  discount: 0,
  total: 24500,
  items: [
    {
      id: '1',
      name: 'Argan Oil Premium 100ml',
      image: 'https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?w=200',
      price: 2499,
      quantity: 2,
      total: 4998,
    },
    {
      id: '2',
      name: 'Moroccan Leather Bag',
      image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=200',
      price: 8990,
      quantity: 1,
      total: 8990,
    },
    {
      id: '3',
      name: 'Rose Water 100ml',
      image: 'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=200',
      price: 499,
      quantity: 3,
      total: 1497,
    },
  ],
  timeline: [
    { status: 'pending', date: '2024-01-15 14:30', note: 'Order placed' },
    { status: 'processing', date: '2024-01-15 15:00', note: 'Payment confirmed' },
    { status: 'shipped', date: '2024-01-16 09:00', note: 'Shipped via DHL' },
    { status: 'delivered', date: '2024-01-17 14:30', note: 'Delivered to customer' },
  ],
};

const statusColors: Record<string, { bg: string; text: string; icon: any }> = {
  pending: { bg: 'bg-yellow-100', text: 'text-yellow-700', icon: Clock },
  processing: { bg: 'bg-blue-100', text: 'text-blue-700', icon: Package },
  shipped: { bg: 'bg-purple-100', text: 'text-purple-700', icon: Truck },
  delivered: { bg: 'bg-green-100', text: 'text-green-700', icon: CheckCircle },
  cancelled: { bg: 'bg-red-100', text: 'text-red-700', icon: XCircle },
};

export default function OrderDetailsPage({ params }: { params: { id: string } }) {
  const [order] = useState(mockOrder);
  const statusColor = statusColors[order.status];
  const StatusIcon = statusColor.icon;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/orders"
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Order {order.id}</h1>
            <p className="text-slate-600 mt-1">
              Placed on {order.date} at {order.time}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-2 border border-border rounded-lg text-sm font-medium hover:bg-slate-50">
            <Printer className="w-4 h-4" />
            Print
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-brand-600 text-white rounded-lg text-sm font-medium hover:bg-brand-700">
            <Edit2 className="w-4 h-4" />
            Edit Order
          </button>
        </div>
      </div>

      {/* Status Banner */}
      <div className={`p-4 rounded-lg ${statusColor.bg} border ${statusColor.text.replace('text-', 'border-')}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <StatusIcon className="w-6 h-6" />
            <div>
              <p className="font-bold text-lg capitalize">{order.status}</p>
              <p className="text-sm opacity-80">
                {order.status === 'delivered' ? 'Order successfully delivered' : 
                 order.status === 'shipped' ? 'Order is in transit' :
                 order.status === 'processing' ? 'Order is being prepared' :
                 order.status === 'pending' ? 'Waiting for confirmation' : 'Order was cancelled'}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            {order.status === 'pending' && (
              <>
                <button className="px-4 py-2 bg-white text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50">
                  Cancel Order
                </button>
                <button className="px-4 py-2 bg-brand-600 text-white rounded-lg text-sm font-medium hover:bg-brand-700">
                  Confirm Order
                </button>
              </>
            )}
            {order.status === 'processing' && (
              <button className="px-4 py-2 bg-brand-600 text-white rounded-lg text-sm font-medium hover:bg-brand-700">
                Mark as Shipped
              </button>
            )}
            {order.status === 'shipped' && (
              <button className="px-4 py-2 bg-brand-600 text-white rounded-lg text-sm font-medium hover:bg-brand-700">
                Mark as Delivered
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Customer Info */}
          <div className="bg-white rounded-lg border border-border p-6 shadow-sm">
            <h2 className="text-lg font-bold text-foreground mb-4">Customer Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Package className="w-4 h-4 text-slate-400" />
                  <p className="text-sm text-slate-600">Contact</p>
                </div>
                <p className="font-medium text-foreground">{order.customer.name}</p>
                <div className="flex items-center gap-2 mt-1 text-sm text-slate-600">
                  <Mail className="w-4 h-4" />
                  <span>{order.customer.email}</span>
                </div>
                <div className="flex items-center gap-2 mt-1 text-sm text-slate-600">
                  <Phone className="w-4 h-4" />
                  <span>{order.customer.phone}</span>
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="w-4 h-4 text-slate-400" />
                  <p className="text-sm text-slate-600">Shipping Address</p>
                </div>
                <p className="font-medium text-foreground">{order.customer.name}</p>
                <p className="text-sm text-slate-600">{order.shippingAddress.street}</p>
                <p className="text-sm text-slate-600">
                  {order.shippingAddress.city}, {order.shippingAddress.postalCode}
                </p>
                <p className="text-sm text-slate-600">{order.shippingAddress.country}</p>
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div className="bg-white rounded-lg border border-border shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-200">
              <h2 className="text-lg font-bold text-foreground">Order Items ({order.items.length})</h2>
            </div>
            <div className="divide-y divide-slate-200">
              {order.items.map((item) => (
                <div key={item.id} className="p-6 flex items-center gap-4">
                  <div className="w-20 h-20 rounded-lg overflow-hidden bg-slate-100 flex-shrink-0">
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-foreground">{item.name}</h3>
                    <p className="text-sm text-slate-600">Qty: {item.quantity}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-foreground">MAD {item.total.toLocaleString()}</p>
                    <p className="text-sm text-slate-600">MAD {item.price.toLocaleString()} each</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Order Timeline */}
          <div className="bg-white rounded-lg border border-border p-6 shadow-sm">
            <h2 className="text-lg font-bold text-foreground mb-4">Order Timeline</h2>
            <div className="space-y-4">
              {order.timeline.map((event, idx) => (
                <div key={idx} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className={`w-3 h-3 rounded-full ${
                      idx === order.timeline.length - 1 ? 'bg-brand-600' : 'bg-slate-300'
                    }`} />
                    {idx < order.timeline.length - 1 && (
                      <div className="w-0.5 h-full bg-slate-200 mt-1" />
                    )}
                  </div>
                  <div className="flex-1 pb-4">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-foreground capitalize">{event.status}</p>
                      <p className="text-xs text-slate-600">{event.date}</p>
                    </div>
                    <p className="text-sm text-slate-600">{event.note}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Order Summary */}
          <div className="bg-white rounded-lg border border-border p-6 shadow-sm">
            <h2 className="text-lg font-bold text-foreground mb-4">Order Summary</h2>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Subtotal</span>
                <span className="font-medium text-foreground">MAD {order.subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Shipping</span>
                <span className="font-medium text-foreground">
                  {order.shipping === 0 ? 'Free' : `MAD ${order.shipping.toLocaleString()}`}
                </span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Discount</span>
                  <span className="font-medium text-red-600">-MAD {order.discount.toLocaleString()}</span>
                </div>
              )}
              <div className="border-t border-slate-200 pt-3 flex justify-between">
                <span className="font-bold text-foreground">Total</span>
                <span className="font-bold text-xl text-foreground">MAD {order.total.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Payment Info */}
          <div className="bg-white rounded-lg border border-border p-6 shadow-sm">
            <h2 className="text-lg font-bold text-foreground mb-4">Payment Information</h2>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <CreditCard className="w-5 h-5 text-slate-400" />
                <div>
                  <p className="font-medium text-foreground capitalize">{order.paymentMethod}</p>
                  <p className="text-sm text-slate-600 capitalize">{order.paymentStatus}</p>
                </div>
              </div>
              <div className={`px-3 py-2 rounded-lg text-center text-sm font-bold ${
                order.paymentStatus === 'paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
              }`}>
                {order.paymentStatus === 'paid' ? 'Payment Complete' : 'Payment Pending'}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg border border-border p-6 shadow-sm">
            <h2 className="text-lg font-bold text-foreground mb-4">Quick Actions</h2>
            <div className="space-y-2">
              <button className="w-full px-4 py-2 text-left text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-lg transition-colors">
                Send invoice to customer
              </button>
              <button className="w-full px-4 py-2 text-left text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-lg transition-colors">
                Add tracking number
              </button>
              <button className="w-full px-4 py-2 text-left text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-lg transition-colors">
                Contact customer
              </button>
              <button className="w-full px-4 py-2 text-left text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                Cancel order
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
