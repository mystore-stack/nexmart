// src/components/delivery/DeliveryTracker.tsx
'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { GlassCard, Badge } from '@/components/ui/premium/GlassCard';
import { CheckCircle, Truck, Package, MapPin, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TrackingStep {
  id: string;
  status: string;
  description: string;
  timestamp?: Date;
  completed: boolean;
  icon: React.ReactNode;
}

interface DeliveryTrackerProps {
  orderId: string;
  estimatedDelivery: Date;
  steps: TrackingStep[];
  currentStep: number;
}

export const DeliveryTracker: React.FC<DeliveryTrackerProps> = ({
  orderId,
  estimatedDelivery,
  steps,
  currentStep,
}) => {
  const daysLeft = Math.ceil(
    (estimatedDelivery.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );

  return (
    <GlassCard className="p-6 space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">Order Tracking</h2>
          <Badge label={`#${orderId.slice(-8)}`} variant="premium" />
        </div>
        <p className="text-slate-400">
          Estimated delivery in{' '}
          <span className="text-amber-400 font-semibold">{daysLeft} days</span>
        </p>
      </div>

      {/* Progress Bar */}
      <div className="space-y-3">
        <div className="h-2 bg-slate-700/50 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="h-full bg-gradient-to-r from-amber-400 to-amber-600"
          />
        </div>
        <div className="flex justify-between text-sm text-slate-400">
          <span>{currentStep + 1}</span>
          <span>of {steps.length}</span>
        </div>
      </div>

      {/* Timeline */}
      <div className="space-y-4">
        {steps.map((step, idx) => (
          <motion.div
            key={step.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="flex gap-4"
          >
            {/* Icon */}
            <div className="flex flex-col items-center">
              <motion.div
                animate={step.completed ? { scale: [1, 1.2, 1] } : undefined}
                transition={{ duration: 0.5, repeat: idx === currentStep ? Infinity : 0 }}
                className={cn(
                  'w-10 h-10 rounded-full flex items-center justify-center',
                  step.completed
                    ? 'bg-emerald-500 text-white'
                    : idx === currentStep
                    ? 'bg-gradient-to-r from-amber-400 to-amber-600 text-white'
                    : 'bg-slate-700/50 text-slate-400'
                )}
              >
                {step.completed ? (
                  <CheckCircle className="w-6 h-6" />
                ) : idx === currentStep ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                  >
                    {step.icon}
                  </motion.div>
                ) : (
                  step.icon
                )}
              </motion.div>
              {idx < steps.length - 1 && (
                <div
                  className={cn(
                    'w-1 h-12 mt-2',
                    step.completed ? 'bg-emerald-500' : 'bg-slate-700/50'
                  )}
                />
              )}
            </div>

            {/* Content */}
            <div className="flex-1 pt-1">
              <div className="flex items-center gap-2">
                <h3
                  className={cn(
                    'font-semibold',
                    step.completed ? 'text-emerald-400' : 'text-white'
                  )}
                >
                  {step.status}
                </h3>
                {step.completed && <CheckCircle className="w-4 h-4 text-emerald-400" />}
              </div>
              <p className="text-slate-400 text-sm mt-1">{step.description}</p>
              {step.timestamp && (
                <div className="flex items-center gap-1 text-xs text-slate-500 mt-2">
                  <Clock className="w-3 h-3" />
                  {step.timestamp.toLocaleDateString()}
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Delivery Info */}
      <div className="bg-gradient-to-r from-amber-400/10 to-amber-600/10 border border-amber-400/20 rounded-xl p-4 flex items-center gap-3">
        <MapPin className="w-5 h-5 text-amber-400 flex-shrink-0" />
        <div>
          <p className="text-sm text-slate-300">
            Delivery to: <span className="text-white font-semibold">Your Address</span>
          </p>
          <p className="text-xs text-slate-400">
            Tracking number: <span className="text-amber-400">{orderId}</span>
          </p>
        </div>
      </div>
    </GlassCard>
  );
};

// Expected tracking steps
export const DEFAULT_TRACKING_STEPS: TrackingStep[] = [
  {
    id: '1',
    status: 'Order Confirmed',
    description: 'Your order has been received and confirmed',
    completed: true,
    icon: <CheckCircle className="w-6 h-6" />,
  },
  {
    id: '2',
    status: 'Processing',
    description: 'We are preparing your order for shipment',
    completed: true,
    icon: <Package className="w-6 h-6" />,
  },
  {
    id: '3',
    status: 'Shipped',
    description: 'Your order is on its way',
    completed: false,
    icon: <Truck className="w-6 h-6" />,
  },
  {
    id: '4',
    status: 'Out for Delivery',
    description: 'Your order will arrive soon',
    completed: false,
    icon: <Truck className="w-6 h-6" />,
  },
  {
    id: '5',
    status: 'Delivered',
    description: 'Your order has been delivered',
    completed: false,
    icon: <CheckCircle className="w-6 h-6" />,
  },
];
