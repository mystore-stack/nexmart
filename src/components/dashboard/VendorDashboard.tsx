// src/components/dashboard/VendorDashboard.tsx
'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { GlassCard, Badge } from '@/components/ui/premium/GlassCard';
import { PremiumButton } from '@/components/ui/premium/PremiumButton';
import {
  Package,
  TrendingUp,
  Star,
  Clock,
  CheckCircle,
  AlertCircle,
  Plus,
} from 'lucide-react';

interface OrderItemProps {
  id: string;
  productName: string;
  buyer: string;
  amount: number;
  status: 'pending' | 'shipped' | 'delivered' | 'cancelled';
  date: string;
}

const OrderItem: React.FC<OrderItemProps> = ({
  id,
  productName,
  buyer,
  amount,
  status,
  date,
}) => {
  const statusConfig = {
    pending: { color: 'warning', icon: <Clock className="w-4 h-4" /> },
    shipped: { color: 'info', icon: <Package className="w-4 h-4" /> },
    delivered: { color: 'success', icon: <CheckCircle className="w-4 h-4" /> },
    cancelled: { color: 'error', icon: <AlertCircle className="w-4 h-4" /> },
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex items-center justify-between p-4 rounded-lg hover:bg-slate-700/30 transition-colors"
    >
      <div className="flex-1">
        <p className="font-semibold text-white">{productName}</p>
        <p className="text-sm text-slate-400">{buyer}</p>
      </div>
      <div className="flex items-center gap-4">
        <div className="text-right">
          <p className="font-semibold text-white">${amount}</p>
          <p className="text-xs text-slate-400">{date}</p>
        </div>
        <Badge
          label={status.charAt(0).toUpperCase() + status.slice(1)}
          variant={
            statusConfig[status].color as
              | 'success'
              | 'warning'
              | 'error'
              | 'info'
          }
          icon={statusConfig[status].icon}
        />
      </div>
    </motion.div>
  );
};

export const VendorDashboard: React.FC = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-white">Vendor Dashboard</h1>
          <p className="text-slate-400 mt-2">Manage your store and sales</p>
        </div>
        <PremiumButton size="lg" variant="primary" icon={<Plus className="w-5 h-5" />}>
          Add Product
        </PremiumButton>
      </div>

      {/* Stats */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        <motion.div variants={itemVariants}>
          <GlassCard variant="premium" className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">This Month Sales</p>
                <p className="text-3xl font-bold text-white mt-2">$8,432</p>
              </div>
              <TrendingUp className="w-8 h-8 text-emerald-400" />
            </div>
          </GlassCard>
        </motion.div>

        <motion.div variants={itemVariants}>
          <GlassCard variant="premium" className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Rating</p>
                <p className="text-3xl font-bold text-white mt-2">4.8/5.0</p>
              </div>
              <Star className="w-8 h-8 text-amber-400" />
            </div>
          </GlassCard>
        </motion.div>

        <motion.div variants={itemVariants}>
          <GlassCard variant="premium" className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Active Products</p>
                <p className="text-3xl font-bold text-white mt-2">24</p>
              </div>
              <Package className="w-8 h-8 text-blue-400" />
            </div>
          </GlassCard>
        </motion.div>
      </motion.div>

      {/* Recent Orders */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <GlassCard variant="premium" className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">Recent Orders</h2>
            <span className="text-sm text-slate-400">Last 7 days</span>
          </div>

          <div className="space-y-2 divide-y divide-slate-700/50">
            <OrderItem
              id="1"
              productName="Premium Headphones"
              buyer="John Doe"
              amount={129.99}
              status="delivered"
              date="Today"
            />
            <OrderItem
              id="2"
              productName="Wireless Mouse"
              buyer="Jane Smith"
              amount={49.99}
              status="shipped"
              date="Yesterday"
            />
            <OrderItem
              id="3"
              productName="Mechanical Keyboard"
              buyer="Mike Johnson"
              amount={189.99}
              status="pending"
              date="2 days ago"
            />
            <OrderItem
              id="4"
              productName="USB-C Hub"
              buyer="Sarah Williams"
              amount={79.99}
              status="delivered"
              date="3 days ago"
            />
          </div>
        </GlassCard>
      </motion.div>
    </div>
  );
};
