"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  paymentMethod: string;
  total: number;
  currency: string;
  trackingNumber?: string;
  courier?: string;
  estimatedDelivery?: string;
  createdAt: string;
  user: {
    name: string;
    email: string;
  };
  items: Array<{
    name: string;
    quantity: number;
  }>;
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [filter, setFilter] = useState("ALL");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/orders?page=${page}&status=${filter}`);
      const data = await response.json();
      if (data.success) {
        setOrders(data.data);
        setTotal(data.pagination?.total || 0);
      }
    } catch (error) {
      console.error("Failed to fetch orders:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [page, filter]);

  const handleUpdateStatus = async (orderId: string, data: any) => {
    try {
      const response = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await response.json();
      if (result.success) {
        fetchOrders();
        setSelectedOrder(null);
      }
    } catch (error) {
      console.error("Failed to update order:", error);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      PENDING: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
      CONFIRMED: "bg-blue-500/20 text-blue-400 border-blue-500/30",
      PROCESSING: "bg-purple-500/20 text-purple-400 border-purple-500/30",
      SHIPPED: "bg-indigo-500/20 text-indigo-400 border-indigo-500/30",
      DELIVERED: "bg-green-500/20 text-green-400 border-green-500/30",
      CANCELLED: "bg-red-500/20 text-red-400 border-red-500/30",
      REFUNDED: "bg-orange-500/20 text-orange-400 border-orange-500/30",
    };
    return colors[status] || "bg-gray-500/20 text-gray-400 border-gray-500/30";
  };

  const filteredOrders = orders.filter(
    (order) =>
      order.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
      order.user.email.toLowerCase().includes(search.toLowerCase()) ||
      order.user.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0F172A] to-[#1E293B] p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-white mb-2">Order Management</h1>
          <p className="text-gray-400">Manage and track all orders</p>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-[#D4AF37]/20 mb-6"
        >
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search by order number, email, or name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full px-4 py-3 bg-white/5 border border-[#D4AF37]/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#D4AF37]"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              {["ALL", "PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"].map(
                (status) => (
                  <button
                    key={status}
                    onClick={() => setFilter(status)}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      filter === status
                        ? "bg-[#D4AF37] text-[#0F172A]"
                        : "bg-white/5 text-gray-300 hover:bg-white/10"
                    }`}
                  >
                    {status}
                  </button>
                )
              )}
            </div>
          </div>
        </motion.div>

        {/* Orders Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/10 backdrop-blur-lg rounded-2xl border border-[#D4AF37]/20 overflow-hidden"
        >
          {loading ? (
            <div className="p-8 text-center text-white">Loading orders...</div>
          ) : filteredOrders.length === 0 ? (
            <div className="p-8 text-center text-gray-400">No orders found</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-white/5">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-white">Order #</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-white">Customer</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-white">Status</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-white">Total</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-white">Date</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-white">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700/50">
                  {filteredOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4 text-white font-medium">{order.orderNumber}</td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-white">{order.user.name}</p>
                          <p className="text-gray-400 text-sm">{order.user.email}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(
                            order.status
                          )}`}
                        >
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-white font-medium">
                        {order.currency} {order.total.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-gray-400">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="px-4 py-2 bg-[#D4AF37] hover:bg-[#B8962E] text-[#0F172A] font-semibold rounded-lg transition-colors"
                        >
                          Manage
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>

        {/* Order Management Modal */}
        {selectedOrder && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={() => setSelectedOrder(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#1E293B] rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-[#D4AF37]/20"
            >
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-white">Order #{selectedOrder.orderNumber}</h2>
                  <p className="text-gray-400">
                    Customer: {selectedOrder.user.name} ({selectedOrder.user.email})
                  </p>
                </div>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Update Status Form */}
              <div className="bg-white/5 rounded-xl p-6 mb-6">
                <h3 className="text-lg font-semibold text-white mb-4">Update Order Status</h3>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const formData = new FormData(e.currentTarget);
                    handleUpdateStatus(selectedOrder.id, {
                      status: formData.get("status") as string,
                      trackingNumber: formData.get("trackingNumber") as string,
                      courier: formData.get("courier") as string,
                      notes: formData.get("notes") as string,
                      estimatedDelivery: formData.get("estimatedDelivery") as string,
                    });
                  }}
                  className="space-y-4"
                >
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Status</label>
                    <select
                      name="status"
                      defaultValue={selectedOrder.status}
                      className="w-full px-4 py-3 bg-white/5 border border-[#D4AF37]/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#D4AF37]"
                    >
                      <option value="PENDING">Pending</option>
                      <option value="CONFIRMED">Confirmed</option>
                      <option value="PROCESSING">Processing</option>
                      <option value="SHIPPED">Shipped</option>
                      <option value="DELIVERED">Delivered</option>
                      <option value="CANCELLED">Cancelled</option>
                      <option value="REFUNDED">Refunded</option>
                    </select>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Tracking Number
                      </label>
                      <input
                        type="text"
                        name="trackingNumber"
                        defaultValue={selectedOrder.trackingNumber}
                        placeholder="Enter tracking number"
                        className="w-full px-4 py-3 bg-white/5 border border-[#D4AF37]/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#D4AF37]"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Courier</label>
                      <input
                        type="text"
                        name="courier"
                        defaultValue={selectedOrder.courier}
                        placeholder="Enter courier name"
                        className="w-full px-4 py-3 bg-white/5 border border-[#D4AF37]/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#D4AF37]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Estimated Delivery
                    </label>
                    <input
                      type="datetime-local"
                      name="estimatedDelivery"
                      defaultValue={
                        selectedOrder.estimatedDelivery
                          ? new Date(selectedOrder.estimatedDelivery).toISOString().slice(0, 16)
                          : ""
                      }
                      className="w-full px-4 py-3 bg-white/5 border border-[#D4AF37]/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#D4AF37]"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Notes</label>
                    <textarea
                      name="notes"
                      rows={3}
                      placeholder="Add any notes about this status change..."
                      className="w-full px-4 py-3 bg-white/5 border border-[#D4AF37]/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#D4AF37]"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-[#D4AF37] hover:bg-[#B8962E] text-[#0F172A] font-semibold rounded-lg transition-colors"
                  >
                    Update Status
                  </button>
                </form>
              </div>

              {/* Order Items */}
              <div className="bg-white/5 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Order Items</h3>
                <div className="space-y-3">
                  {selectedOrder.items.map((item, index) => (
                    <div key={index} className="flex justify-between text-gray-300">
                      <span>{item.name} x {item.quantity}</span>
                    </div>
                  ))}
                </div>
                <div className="border-t border-gray-700 mt-4 pt-4 flex justify-between text-white font-bold">
                  <span>Total</span>
                  <span>
                    {selectedOrder.currency} {selectedOrder.total.toFixed(2)}
                  </span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
