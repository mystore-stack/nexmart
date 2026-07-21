"use client";

import { useState, useEffect } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";

interface OrderData {
  orderNumber: string;
  status: string;
  paymentStatus: string;
  paymentMethod: string;
  subtotal: number;
  discount: number;
  shipping: number;
  tax: number;
  total: number;
  currency: string;
  trackingNumber?: string;
  courier?: string;
  estimatedDelivery?: string;
  createdAt: string;
  items: Array<{
    name: string;
    image: string;
    price: number;
    quantity: number;
    product: { name: string; images: string[] };
    variant?: { name: string; value: string };
  }>;
  address: {
    name: string;
    phone: string;
    line1: string;
    line2?: string;
    city: string;
    state: string;
    country: string;
    zip: string;
  };
  timeline: Array<{
    status: string;
    label: string;
    completed: boolean;
    date?: string;
  }>;
}

export default function TrackOrderPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const [orderData, setOrderData] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [email, setEmail] = useState(searchParams.get("email") || "");
  const [phone, setPhone] = useState(searchParams.get("phone") || "");
  const [searched, setSearched] = useState(false);

  console.log("[TRACKING_PAGE_LOADED] orderNumber:", params.orderNumber);

  const fetchOrder = async () => {
    setLoading(true);
    setError("");
    
    try {
      const queryParams = new URLSearchParams();
      if (email) queryParams.append("email", email);
      if (phone) queryParams.append("phone", phone);
      
      const response = await fetch(
        `/api/orders/track/${params.orderNumber}?${queryParams.toString()}`
      );
      const data = await response.json();
      
      if (data.success) {
        setOrderData(data.order);
        setSearched(true);
      } else {
        setError(data.error || "Order not found");
      }
    } catch (err) {
      setError("Failed to fetch order. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (email || phone) {
      fetchOrder();
    }
  }, [params.orderNumber]);

  // Clear the orderJustPlaced flag and cart when order tracking page loads
  useEffect(() => {
    if (typeof window !== "undefined") {
      sessionStorage.removeItem("orderJustPlaced");
      // Clear cart after successful order
      const { useCartStore } = require("@/store/cart");
      useCartStore.getState().clearCart();
    }
  }, []);

  // Poll for updates every 30 seconds if order is found
  useEffect(() => {
    if (orderData && (orderData.status === "PROCESSING" || orderData.status === "SHIPPED")) {
      const interval = setInterval(fetchOrder, 30000);
      return () => clearInterval(interval);
    }
  }, [orderData]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchOrder();
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      PENDING: "bg-yellow-500",
      CONFIRMED: "bg-blue-500",
      PROCESSING: "bg-purple-500",
      SHIPPED: "bg-indigo-500",
      DELIVERED: "bg-green-500",
      CANCELLED: "bg-red-500",
      REFUNDED: "bg-orange-500",
    };
    return colors[status] || "bg-gray-500";
  };

  if (!searched) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0F172A] to-[#1E293B] py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-[#D4AF37]/20"
          >
            <h1 className="text-3xl font-bold text-white mb-2">Track Your Order</h1>
            <p className="text-gray-300 mb-8">Enter your email or phone number to track your order</p>
            
            <form onSubmit={handleSearch} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full px-4 py-3 bg-white/5 border border-[#D4AF37]/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#D4AF37]"
                />
              </div>
              
              <div className="text-center text-gray-400">or</div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+212 6XX XXX XXX"
                  className="w-full px-4 py-3 bg-white/5 border border-[#D4AF37]/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#D4AF37]"
                />
              </div>
              
              <button
                type="submit"
                disabled={!email && !phone}
                className="w-full py-3 bg-[#D4AF37] hover:bg-[#B8962E] text-[#0F172A] font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Track Order
              </button>
            </form>
          </motion.div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0F172A] to-[#1E293B] flex items-center justify-center">
        <div className="text-white text-xl">Loading order details...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0F172A] to-[#1E293B] flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-red-500/20 max-w-md w-full"
        >
          <div className="text-red-400 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-white mb-2">Order Not Found</h2>
          <p className="text-gray-300 mb-6">{error}</p>
          <button
            onClick={() => setSearched(false)}
            className="w-full py-3 bg-[#D4AF37] hover:bg-[#B8962E] text-[#0F172A] font-semibold rounded-lg transition-colors"
          >
            Try Again
          </button>
        </motion.div>
      </div>
    );
  }

  if (!orderData) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0F172A] to-[#1E293B] py-12 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-[#D4AF37]/20"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-white">Order #{orderData.orderNumber}</h1>
              <p className="text-gray-300 mt-1">
                Placed on {new Date(orderData.createdAt).toLocaleDateString()}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span
                className={`px-4 py-2 rounded-full text-white font-semibold ${getStatusColor(
                  orderData.status
                )}`}
              >
                {orderData.status}
              </span>
            </div>
          </div>
        </motion.div>

        {/* Timeline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-[#D4AF37]/20"
        >
          <h2 className="text-xl font-bold text-white mb-6">Order Progress</h2>
          <div className="space-y-4">
            {orderData.timeline.map((step, index) => (
              <div key={step.status} className="flex items-start gap-4">
                <div className="relative">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      step.completed ? "bg-[#D4AF37]" : "bg-gray-600"
                    }`}
                  >
                    {step.completed && (
                      <svg className="w-5 h-5 text-[#0F172A]" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                  </div>
                  {index < orderData.timeline.length - 1 && (
                    <div
                      className={`absolute top-8 left-4 w-0.5 h-12 ${
                        step.completed ? "bg-[#D4AF37]" : "bg-gray-600"
                      }`}
                    />
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-white font-semibold">{step.label}</p>
                  {step.date && (
                    <p className="text-gray-400 text-sm">
                      {new Date(step.date).toLocaleString()}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Tracking Info */}
        {(orderData.trackingNumber || orderData.courier) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-[#D4AF37]/20"
          >
            <h2 className="text-xl font-bold text-white mb-4">Shipping Information</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {orderData.trackingNumber && (
                <div>
                  <p className="text-gray-400 text-sm">Tracking Number</p>
                  <p className="text-white font-semibold">{orderData.trackingNumber}</p>
                </div>
              )}
              {orderData.courier && (
                <div>
                  <p className="text-gray-400 text-sm">Courier</p>
                  <p className="text-white font-semibold">{orderData.courier}</p>
                </div>
              )}
              {orderData.estimatedDelivery && (
                <div>
                  <p className="text-gray-400 text-sm">Estimated Delivery</p>
                  <p className="text-white font-semibold">
                    {new Date(orderData.estimatedDelivery).toLocaleDateString()}
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Order Items */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-[#D4AF37]/20"
        >
          <h2 className="text-xl font-bold text-white mb-4">Order Items</h2>
          <div className="space-y-4">
            {orderData.items.map((item) => (
              <div key={item.name} className="flex items-center gap-4 bg-white/5 rounded-lg p-4">
                <img
                  src={item.image || item.product.images[0]}
                  alt={item.name}
                  className="w-20 h-20 object-cover rounded-lg"
                />
                <div className="flex-1">
                  <p className="text-white font-semibold">{item.name}</p>
                  {item.variant && (
                    <p className="text-gray-400 text-sm">
                      {item.variant.name}: {item.variant.value}
                    </p>
                  )}
                  <p className="text-gray-400 text-sm">Qty: {item.quantity}</p>
                </div>
                <p className="text-white font-semibold">
                  {orderData.currency} {(item.price * item.quantity).toFixed(2)}
                </p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Order Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-[#D4AF37]/20"
        >
          <h2 className="text-xl font-bold text-white mb-4">Order Summary</h2>
          <div className="space-y-2">
            <div className="flex justify-between text-gray-300">
              <span>Subtotal</span>
              <span>{orderData.currency} {orderData.subtotal.toFixed(2)}</span>
            </div>
            {orderData.discount > 0 && (
              <div className="flex justify-between text-green-400">
                <span>Discount</span>
                <span>-{orderData.currency} {orderData.discount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-gray-300">
              <span>Shipping</span>
              <span>{orderData.currency} {orderData.shipping.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-300">
              <span>Tax</span>
              <span>{orderData.currency} {orderData.tax.toFixed(2)}</span>
            </div>
            <div className="border-t border-gray-600 pt-2 flex justify-between text-white font-bold text-lg">
              <span>Total</span>
              <span>{orderData.currency} {orderData.total.toFixed(2)}</span>
            </div>
          </div>
        </motion.div>

        {/* Delivery Address */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-[#D4AF37]/20"
        >
          <h2 className="text-xl font-bold text-white mb-4">Delivery Address</h2>
          <div className="text-gray-300">
            <p className="font-semibold text-white">{orderData.address.name}</p>
            <p>{orderData.address.line1}</p>
            {orderData.address.line2 && <p>{orderData.address.line2}</p>}
            <p>
              {orderData.address.city}, {orderData.address.state} {orderData.address.zip}
            </p>
            <p>{orderData.address.country}</p>
            <p className="mt-2">{orderData.address.phone}</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
