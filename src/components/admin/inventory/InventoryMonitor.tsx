"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  TrendingUp,
  TrendingDown,
  AlertCircle,
  CheckCircle,
  Package,
  Activity,
  Clock,
} from "lucide-react";
import { useInventoryUpdates, type InventoryUpdate } from "@/hooks/useInventoryUpdates";
import { Badge } from "@/components/ui/badge";

interface UpdateGroup {
  productId: string;
  productName: string;
  updates: InventoryUpdate[];
}

export function InventoryMonitor() {
  const { updates, isConnected } = useInventoryUpdates(true);
  const [groupedUpdates, setGroupedUpdates] = useState<UpdateGroup[]>([]);

  useEffect(() => {
    // Group updates by product
    const groups: Record<string, UpdateGroup> = {};

    updates.forEach((update) => {
      if (!groups[update.productId]) {
        groups[update.productId] = {
          productId: update.productId,
          productName: update.productName,
          updates: [],
        };
      }
      groups[update.productId].updates.push(update);
    });

    setGroupedUpdates(Object.values(groups).slice(0, 10)); // Show top 10
  }, [updates]);

  const getPriorityColor = (priority: string) => {
    const colors: Record<string, string> = {
      CRITICAL: "bg-red-100 text-red-700",
      HIGH: "bg-orange-100 text-orange-700",
      MEDIUM: "bg-yellow-100 text-yellow-700",
      LOW: "bg-green-100 text-green-700",
    };
    return colors[priority] || "bg-gray-100 text-gray-700";
  };

  const getStockChangeIcon = (change: number) => {
    if (change > 0) {
      return <TrendingUp className="w-4 h-4 text-green-600" />;
    } else if (change < 0) {
      return <TrendingDown className="w-4 h-4 text-red-600" />;
    }
    return <Activity className="w-4 h-4 text-gray-400" />;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Package className="w-6 h-6" />
            Live Inventory Monitor
          </h2>
          <p className="text-sm text-muted-foreground">
            Real-time inventory updates and changes
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${isConnected ? "bg-green-500" : "bg-red-500"} animate-pulse`} />
          <span className="text-sm">
            {isConnected ? "Connected" : "Disconnected"}
          </span>
        </div>
      </div>

      {/* Updates Feed */}
      <div className="space-y-3 max-h-[600px] overflow-y-auto">
        <AnimatePresence mode="popLayout">
          {groupedUpdates.length === 0 ? (
            <div className="bg-muted/30 rounded-lg p-8 text-center">
              <Clock className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                Waiting for inventory updates...
              </p>
            </div>
          ) : (
            groupedUpdates.map((group, groupIndex) => (
              <motion.div
                key={`${group.productId}-${groupIndex}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ type: "spring", stiffness: 300 }}
                className="bg-card border border-border rounded-lg overflow-hidden"
              >
                {/* Header */}
                <div className="bg-muted/50 px-4 py-2 flex items-center justify-between">
                  <div className="flex items-center gap-2 flex-1">
                    <Package className="w-4 h-4 text-muted-foreground" />
                    <div className="flex-1">
                      <p className="text-sm font-semibold">{group.productName}</p>
                      <p className="text-xs text-muted-foreground font-mono">
                        {group.productId.slice(0, 8)}...
                      </p>
                    </div>
                  </div>
                  <Badge variant="outline">
                    {group.updates.length} update{group.updates.length !== 1 ? "s" : ""}
                  </Badge>
                </div>

                {/* Updates */}
                <div className="divide-y divide-border">
                  {group.updates.slice(0, 3).map((update, updateIndex) => (
                    <motion.div
                      key={`${update.productId}-${updateIndex}`}
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="px-4 py-3 flex items-center justify-between hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-3 flex-1">
                        {getStockChangeIcon(
                          update.newStock - update.previousStock
                        )}
                        <div className="flex-1">
                          <p className="text-sm">
                            <span className="font-mono font-semibold">
                              {update.previousStock}
                            </span>
                            <span className="text-muted-foreground mx-2">→</span>
                            <span className="font-mono font-semibold">
                              {update.newStock}
                            </span>
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {update.changeReason}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getPriorityColor(update.priority)}>
                          {update.priority}
                        </Badge>
                        <p className="text-xs text-muted-foreground">
                          {new Date(update.timestamp).toLocaleTimeString()}
                        </p>
                      </div>
                    </motion.div>
                  ))}

                  {group.updates.length > 3 && (
                    <div className="px-4 py-2 text-center text-xs text-muted-foreground bg-muted/20">
                      +{group.updates.length - 3} more update
                      {group.updates.length - 3 !== 1 ? "s" : ""}
                    </div>
                  )}
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

      {/* Stats */}
      {updates.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card border border-border rounded-lg p-4"
          >
            <p className="text-xs text-muted-foreground mb-1">Total Updates</p>
            <p className="text-2xl font-bold">{updates.length}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-card border border-border rounded-lg p-4"
          >
            <p className="text-xs text-muted-foreground mb-1">Critical Updates</p>
            <p className="text-2xl font-bold text-red-600">
              {updates.filter((u) => u.priority === "CRITICAL").length}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-card border border-border rounded-lg p-4"
          >
            <p className="text-xs text-muted-foreground mb-1">Last Updated</p>
            <p className="text-sm font-mono">
              {updates[0]
                ? new Date(updates[0].timestamp).toLocaleTimeString()
                : "N/A"}
            </p>
          </motion.div>
        </div>
      )}
    </div>
  );
}
