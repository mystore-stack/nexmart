// src/components/checkout/PremiumCheckout.tsx
'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { GlassCard, Badge } from '@/components/ui/premium/GlassCard';
import { PremiumButton } from '@/components/ui/premium/PremiumButton';
import {
  ShoppingCart,
  Truck,
  CreditCard,
  CheckCircle,
  ChevronRight,
} from 'lucide-react';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

interface CheckoutStep {
  id: number;
  label: string;
  icon: React.ReactNode;
}

const STEPS: CheckoutStep[] = [
  { id: 1, label: 'Cart', icon: <ShoppingCart className="w-5 h-5" /> },
  { id: 2, label: 'Shipping', icon: <Truck className="w-5 h-5" /> },
  { id: 3, label: 'Payment', icon: <CreditCard className="w-5 h-5" /> },
  { id: 4, label: 'Confirm', icon: <CheckCircle className="w-5 h-5" /> },
];

interface PremiumCheckoutProps {
  items: CartItem[];
  onComplete?: () => void;
}

export const PremiumCheckout: React.FC<PremiumCheckoutProps> = ({
  items,
  onComplete,
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [shippingData, setShippingData] = useState({
    fullName: '',
    address: '',
    city: '',
    zipCode: '',
  });
  const [paymentData, setPaymentData] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
  });

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = 10;
  const tax = subtotal * 0.1;
  const total = subtotal + shipping + tax;

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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-black p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-white mb-2">Checkout</h1>
          <p className="text-slate-400">Complete your purchase</p>
        </motion.div>

        {/* Progress Steps */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-8"
        >
          <div className="flex items-center gap-2 md:gap-4">
            {STEPS.map((step, idx) => (
              <div key={step.id} className="flex items-center gap-2 md:gap-4 flex-1">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  onClick={() => setCurrentStep(step.id)}
                  className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                    currentStep >= step.id
                      ? 'bg-gradient-to-r from-amber-400 to-amber-600 text-white'
                      : 'bg-slate-700/50 text-slate-400'
                  }`}
                >
                  {step.icon}
                </motion.button>
                <div className="hidden md:block">
                  <p
                    className={`text-sm font-semibold ${
                      currentStep >= step.id
                        ? 'text-white'
                        : 'text-slate-500'
                    }`}
                  >
                    {step.label}
                  </p>
                </div>
                {idx < STEPS.length - 1 && (
                  <div
                    className={`flex-1 h-1 rounded-full transition-colors ${
                      currentStep > step.id
                        ? 'bg-gradient-to-r from-amber-400 to-amber-600'
                        : 'bg-slate-700/50'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="lg:col-span-2 space-y-6"
          >
            {/* Step 1: Cart Review */}
            {currentStep === 1 && (
              <motion.div variants={itemVariants}>
                <GlassCard variant="premium" className="p-6">
                  <h2 className="text-2xl font-bold text-white mb-6">
                    Order Review
                  </h2>
                  <div className="space-y-4">
                    {items.map((item) => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex gap-4 p-4 rounded-lg hover:bg-slate-700/30 transition-colors"
                      >
                        <div className="w-20 h-20 rounded-lg bg-slate-700/50" />
                        <div className="flex-1">
                          <h3 className="font-semibold text-white">
                            {item.name}
                          </h3>
                          <p className="text-slate-400 text-sm">
                            Quantity: {item.quantity}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-white">
                            ${(item.price * item.quantity).toFixed(2)}
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </GlassCard>
              </motion.div>
            )}

            {/* Step 2: Shipping */}
            {currentStep === 2 && (
              <motion.div variants={itemVariants}>
                <GlassCard variant="premium" className="p-6">
                  <h2 className="text-2xl font-bold text-white mb-6">
                    Shipping Address
                  </h2>
                  <form className="space-y-4">
                    <input
                      type="text"
                      placeholder="Full Name"
                      className="w-full px-4 py-3 rounded-lg bg-slate-800/50 border border-slate-700 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-400"
                      value={shippingData.fullName}
                      onChange={(e) =>
                        setShippingData({
                          ...shippingData,
                          fullName: e.target.value,
                        })
                      }
                    />
                    <input
                      type="text"
                      placeholder="Address"
                      className="w-full px-4 py-3 rounded-lg bg-slate-800/50 border border-slate-700 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-400"
                      value={shippingData.address}
                      onChange={(e) =>
                        setShippingData({
                          ...shippingData,
                          address: e.target.value,
                        })
                      }
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <input
                        type="text"
                        placeholder="City"
                        className="px-4 py-3 rounded-lg bg-slate-800/50 border border-slate-700 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-400"
                        value={shippingData.city}
                        onChange={(e) =>
                          setShippingData({
                            ...shippingData,
                            city: e.target.value,
                          })
                        }
                      />
                      <input
                        type="text"
                        placeholder="Zip Code"
                        className="px-4 py-3 rounded-lg bg-slate-800/50 border border-slate-700 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-400"
                        value={shippingData.zipCode}
                        onChange={(e) =>
                          setShippingData({
                            ...shippingData,
                            zipCode: e.target.value,
                          })
                        }
                      />
                    </div>
                  </form>
                </GlassCard>
              </motion.div>
            )}

            {/* Step 3: Payment */}
            {currentStep === 3 && (
              <motion.div variants={itemVariants}>
                <GlassCard variant="premium" className="p-6">
                  <h2 className="text-2xl font-bold text-white mb-6">
                    Payment Method
                  </h2>
                  <form className="space-y-4">
                    <input
                      type="text"
                      placeholder="Card Number"
                      className="w-full px-4 py-3 rounded-lg bg-slate-800/50 border border-slate-700 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-400"
                      value={paymentData.cardNumber}
                      onChange={(e) =>
                        setPaymentData({
                          ...paymentData,
                          cardNumber: e.target.value,
                        })
                      }
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <input
                        type="text"
                        placeholder="MM/YY"
                        className="px-4 py-3 rounded-lg bg-slate-800/50 border border-slate-700 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-400"
                        value={paymentData.expiryDate}
                        onChange={(e) =>
                          setPaymentData({
                            ...paymentData,
                            expiryDate: e.target.value,
                          })
                        }
                      />
                      <input
                        type="text"
                        placeholder="CVV"
                        className="px-4 py-3 rounded-lg bg-slate-800/50 border border-slate-700 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-400"
                        value={paymentData.cvv}
                        onChange={(e) =>
                          setPaymentData({
                            ...paymentData,
                            cvv: e.target.value,
                          })
                        }
                      />
                    </div>
                  </form>
                </GlassCard>
              </motion.div>
            )}

            {/* Step 4: Confirmation */}
            {currentStep === 4 && (
              <motion.div variants={itemVariants}>
                <GlassCard variant="premium" className="p-12 text-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: 'spring' }}
                    className="w-16 h-16 rounded-full bg-gradient-to-r from-emerald-400 to-emerald-600 flex items-center justify-center mx-auto mb-4"
                  >
                    <CheckCircle className="w-8 h-8 text-white" />
                  </motion.div>
                  <h2 className="text-3xl font-bold text-white mb-2">
                    Order Confirmed!
                  </h2>
                  <p className="text-slate-400 mb-6">
                    Your order has been placed successfully
                  </p>
                  <p className="text-amber-400 font-semibold">
                    Order #2024-123456
                  </p>
                </GlassCard>
              </motion.div>
            )}
          </motion.div>

          {/* Order Summary */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="h-fit"
          >
            <GlassCard variant="premium" className="p-6 sticky top-20">
              <h3 className="text-xl font-bold text-white mb-6">
                Order Summary
              </h3>

              <div className="space-y-4 mb-6 pb-6 border-b border-slate-700">
                <div className="flex items-center justify-between text-slate-300">
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between text-slate-300">
                  <span>Shipping</span>
                  <span>${shipping.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between text-slate-300">
                  <span>Tax</span>
                  <span>${tax.toFixed(2)}</span>
                </div>
              </div>

              <div className="flex items-center justify-between mb-6">
                <span className="text-lg font-bold text-white">Total</span>
                <span className="text-2xl font-bold text-amber-400">
                  ${total.toFixed(2)}
                </span>
              </div>

              <div className="space-y-3">
                <PremiumButton
                  size="lg"
                  className="w-full"
                  onClick={() => {
                    if (currentStep < 4) {
                      setCurrentStep(currentStep + 1);
                    } else {
                      onComplete?.();
                    }
                  }}
                  icon={<ChevronRight className="w-5 h-5" />}
                >
                  {currentStep === 4 ? 'Complete Order' : 'Next Step'}
                </PremiumButton>
                {currentStep > 1 && (
                  <PremiumButton
                    size="lg"
                    variant="ghost"
                    className="w-full"
                    onClick={() => setCurrentStep(currentStep - 1)}
                  >
                    Previous
                  </PremiumButton>
                )}
              </div>

              <Badge label="Free Returns within 30 days" variant="success" />
            </GlassCard>
          </motion.div>
        </div>
      </div>
    </div>
  );
};
