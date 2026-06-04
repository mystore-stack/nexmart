// src/components/dashboard/AdminDashboard.tsx
'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { GlassCard } from '@/components/ui/premium/GlassCard';
import {
  BarChart3,
  Users,
  ShoppingCart,
  TrendingUp,
  Activity,
  Settings,
  LogOut,
} from 'lucide-react';

interface DashboardCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon: React.ReactNode;
  trend?: 'up' | 'down';
}

const DashboardCard: React.FC<DashboardCardProps> = ({
  title,
  value,
  change,
  icon,
  trend = 'up',
}) => (
  <GlassCard variant="premium" className="p-6">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-slate-400 text-sm font-medium">{title}</p>
        <p className="text-3xl font-bold text-white mt-2">{value}</p>
        {change !== undefined && (
          <p
            className={`text-sm mt-2 ${
              trend === 'up' ? 'text-emerald-400' : 'text-red-400'
            }`}
          >
            {trend === 'up' ? '↑' : '↓'} {change}% from last month
          </p>
        )}
      </div>
      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white">
        {icon}
      </div>
    </div>
  </GlassCard>
);

export const AdminDashboard: React.FC = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-white">Admin Dashboard</h1>
        <p className="text-slate-400 mt-2">Welcome back, Admin</p>
      </div>

      {/* Stats Grid */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        <motion.div variants={itemVariants}>
          <DashboardCard
            title="Total Revenue"
            value="$125,430"
            change={12.5}
            icon={<TrendingUp className="w-6 h-6" />}
          />
        </motion.div>
        <motion.div variants={itemVariants}>
          <DashboardCard
            title="Total Orders"
            value="2,543"
            change={8.2}
            icon={<ShoppingCart className="w-6 h-6" />}
          />
        </motion.div>
        <motion.div variants={itemVariants}>
          <DashboardCard
            title="Active Users"
            value="8,291"
            change={5.1}
            icon={<Users className="w-6 h-6" />}
          />
        </motion.div>
        <motion.div variants={itemVariants}>
          <DashboardCard
            title="Conversion Rate"
            value="3.2%"
            change={0.5}
            icon={<Activity className="w-6 h-6" />}
          />
        </motion.div>
      </motion.div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-2"
        >
          <GlassCard variant="premium" className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Sales Overview</h2>
              <BarChart3 className="w-5 h-5 text-amber-400" />
            </div>
            <div className="space-y-4">
              {['January', 'February', 'March', 'April', 'May', 'June'].map(
                (month, idx) => (
                  <div key={month} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-400">{month}</span>
                      <span className="text-sm font-semibold text-white">
                        ${Math.random() * 30 + 10}k
                      </span>
                    </div>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.random() * 100}%` }}
                      transition={{ duration: 0.8, delay: idx * 0.1 }}
                      className="h-2 bg-gradient-to-r from-amber-400 to-amber-600 rounded-full"
                    />
                  </div>
                )
              )}
            </div>
          </GlassCard>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <GlassCard variant="premium" className="p-6">
            <h2 className="text-xl font-bold text-white mb-4">Quick Actions</h2>
            <div className="space-y-3">
              {[
                { icon: ShoppingCart, label: 'View Orders', count: 24 },
                { icon: Users, label: 'Manage Users', count: 12 },
                { icon: Settings, label: 'Settings', count: 0 },
                { icon: Activity, label: 'Analytics', count: 0 },
              ].map(({ icon: Icon, label, count }) => (
                <motion.button
                  key={label}
                  whileHover={{ x: 4 }}
                  className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-slate-700/50 transition-colors"
                >
                  <Icon className="w-5 h-5 text-amber-400" />
                  <span className="flex-1 text-left text-white text-sm">
                    {label}
                  </span>
                  {count > 0 && (
                    <span className="bg-amber-400 text-black text-xs font-bold px-2 py-1 rounded-full">
                      {count}
                    </span>
                  )}
                </motion.button>
              ))}
            </div>
          </GlassCard>
        </motion.div>
      </div>
    </div>
  );
};
