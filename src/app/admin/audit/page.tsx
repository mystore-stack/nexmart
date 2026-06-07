// src/app/admin/audit/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  Users,
  ShoppingCart,
  CreditCard,
  TrendingUp,
  Filter,
  Search,
  RefreshCw,
  Play,
  Eye,
  Shield,
  AlertOctagon,
} from "lucide-react";

interface AuditStats {
  totalSessions: number;
  completedSessions: number;
  abandonedSessions: number;
  conversionRate: number;
  avgConversionValue: number;
}

interface AuditEvent {
  id: string;
  eventType: string;
  createdAt: string;
  userId?: string;
  metadata?: any;
  fraudScore?: number;
}

interface AuditAlert {
  id: string;
  alertType: string;
  severity: string;
  title: string;
  createdAt: string;
  resolved: boolean;
}

export default function AuditDashboardPage() {
  const [stats, setStats] = useState<AuditStats | null>(null);
  const [events, setEvents] = useState<AuditEvent[]>([]);
  const [alerts, setAlerts] = useState<AuditAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchData();
    // Set up real-time polling (in production, use WebSockets or Supabase Realtime)
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      const [statsRes, eventsRes, alertsRes] = await Promise.all([
        fetch("/api/audit/stats"),
        fetch("/api/audit/events?limit=20"),
        fetch("/api/audit/alerts?limit=10"),
      ]);

      const [statsData, eventsData, alertsData] = await Promise.all([
        statsRes.json(),
        eventsRes.json(),
        alertsRes.json(),
      ]);

      if (statsData.success) setStats(statsData.stats);
      if (eventsData.success) setEvents(eventsData.events);
      if (alertsData.success) setAlerts(alertsData.alerts);
    } catch (error) {
      console.error("Failed to fetch audit data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "CRITICAL":
        return "bg-red-500 text-white";
      case "HIGH":
        return "bg-orange-500 text-white";
      case "MEDIUM":
        return "bg-yellow-500 text-white";
      case "LOW":
        return "bg-blue-500 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  const getEventTypeIcon = (eventType: string) => {
    if (eventType.includes("PAYMENT")) return <CreditCard className="w-4 h-4" />;
    if (eventType.includes("CART")) return <ShoppingCart className="w-4 h-4" />;
    if (eventType.includes("CHECKOUT")) return <Activity className="w-4 h-4" />;
    if (eventType.includes("USER")) return <Users className="w-4 h-4" />;
    return <Clock className="w-4 h-4" />;
  };

  const filteredEvents = events.filter((event) => {
    if (filter !== "all" && !event.eventType.includes(filter.toUpperCase())) return false;
    if (searchQuery && !event.eventType.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <RefreshCw className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Audit Dashboard</h1>
              <p className="text-sm text-gray-500 mt-1">Real-time event monitoring and fraud detection</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={fetchData}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Sessions"
            value={stats?.totalSessions || 0}
            icon={<Users className="w-5 h-5" />}
            color="blue"
            trend="+12%"
          />
          <StatCard
            title="Conversion Rate"
            value={`${stats?.conversionRate.toFixed(1) || 0}%`}
            icon={<TrendingUp className="w-5 h-5" />}
            color="green"
            trend="+5%"
          />
          <StatCard
            title="Avg Order Value"
            value={`${stats?.avgConversionValue.toFixed(0) || 0} MAD`}
            icon={<ShoppingCart className="w-5 h-5" />}
            color="purple"
            trend="+8%"
          />
          <StatCard
            title="Active Alerts"
            value={alerts.filter((a) => !a.resolved).length}
            icon={<AlertTriangle className="w-5 h-5" />}
            color="red"
            trend="-3%"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Events Stream */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Live Event Stream</h2>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-gray-400" />
                    <select
                      value={filter}
                      onChange={(e) => setFilter(e.target.value)}
                      className="text-sm border border-gray-300 rounded-lg px-3 py-1.5"
                    >
                      <option value="all">All Events</option>
                      <option value="checkout">Checkout</option>
                      <option value="payment">Payment</option>
                      <option value="cart">Cart</option>
                      <option value="order">Order</option>
                    </select>
                  </div>
                  <div className="relative">
                    <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search events..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9 text-sm border border-gray-300 rounded-lg px-3 py-1.5 w-48"
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {filteredEvents.map((event, index) => (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                  >
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                      {getEventTypeIcon(event.eventType)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-gray-900">{event.eventType}</p>
                        <span className="text-xs text-gray-500">
                          {new Date(event.createdAt).toLocaleTimeString()}
                        </span>
                      </div>
                      {event.fraudScore && event.fraudScore > 50 && (
                        <div className="mt-1 flex items-center gap-2">
                          <Shield className="w-3 h-3 text-orange-500" />
                          <span className="text-xs text-orange-600">Fraud Score: {event.fraudScore}</span>
                        </div>
                      )}
                      {event.metadata && Object.keys(event.metadata).length > 0 && (
                        <p className="text-xs text-gray-500 mt-1 truncate">
                          {JSON.stringify(event.metadata)}
                        </p>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          {/* Alerts Panel */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Active Alerts</h2>
            </div>
            <div className="p-6">
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {alerts.map((alert) => (
                  <motion.div
                    key={alert.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`p-4 rounded-lg border ${
                      alert.resolved
                        ? "bg-gray-50 border-gray-200 opacity-60"
                        : "bg-white border-red-200"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`flex-shrink-0 w-8 h-8 rounded-full ${getSeverityColor(alert.severity)} flex items-center justify-center`}>
                        {alert.resolved ? (
                          <CheckCircle className="w-4 h-4" />
                        ) : (
                          <AlertOctagon className="w-4 h-4" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">{alert.title}</p>
                        <p className="text-xs text-gray-500 mt-1">{alert.alertType}</p>
                        <span className="text-xs text-gray-400 mt-2 block">
                          {new Date(alert.createdAt).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))}
                {alerts.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <CheckCircle className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                    <p className="text-sm">No active alerts</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Session Replay Section */}
        <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Session Replay</h2>
              <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                <Play className="w-4 h-4" />
                Create Replay
              </button>
            </div>
          </div>
          <div className="p-6">
            <div className="text-center py-12 text-gray-500">
              <Eye className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium">Select a session to replay</p>
              <p className="text-sm mt-2">Replay full user sessions step-by-step to debug issues</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  icon,
  color,
  trend,
}: {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  trend: string;
}) {
  const colorClasses = {
    blue: "bg-blue-500 text-white",
    green: "bg-green-500 text-white",
    purple: "bg-purple-500 text-white",
    red: "bg-red-500 text-white",
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between">
        <div className={`w-12 h-12 rounded-lg ${colorClasses[color as keyof typeof colorClasses]} flex items-center justify-center`}>
          {icon}
        </div>
        <span className={`text-sm font-medium ${trend.startsWith("+") ? "text-green-600" : "text-red-600"}`}>
          {trend}
        </span>
      </div>
      <p className="text-2xl font-bold text-gray-900 mt-4">{value}</p>
      <p className="text-sm text-gray-500 mt-1">{title}</p>
    </div>
  );
}
