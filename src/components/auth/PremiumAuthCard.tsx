// src/components/auth/PremiumAuthCard.tsx
'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { GlassCard, GradientText } from '@/components/ui/premium/GlassCard';
import { PremiumButton } from '@/components/ui/premium/PremiumButton';
import { Eye, EyeOff, Mail, Lock, User, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface FormFieldProps {
  label: string;
  placeholder: string;
  type?: string;
  icon: React.ReactNode;
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

const FormField: React.FC<FormFieldProps> = ({
  label,
  placeholder,
  type = 'text',
  icon,
  value,
  onChange,
  error,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const inputType =
    type === 'password' && showPassword ? 'text' : type;

  return (
    <div className="space-y-2">
      <label className="text-sm font-semibold text-white">{label}</label>
      <div className="relative">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
          {icon}
        </div>
        <input
          type={inputType}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={cn(
            'w-full pl-12 pr-4 py-3 rounded-lg bg-slate-800/50 border border-slate-700 text-white placeholder:text-slate-500',
            'focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent',
            'transition-all duration-200',
            error && 'border-red-500 focus:ring-red-400'
          )}
        />
        {type === 'password' && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
          >
            {showPassword ? (
              <EyeOff className="w-5 h-5" />
            ) : (
              <Eye className="w-5 h-5" />
            )}
          </button>
        )}
      </div>
      {error && <p className="text-sm text-red-400">{error}</p>}
    </div>
  );
};

interface PremiumAuthCardProps {
  type: 'login' | 'register';
  onSubmit: (data: any) => void;
}

export const PremiumAuthCard: React.FC<PremiumAuthCardProps> = ({
  type,
  onSubmit,
}) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const isLogin = type === 'login';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate submission
    await new Promise((r) => setTimeout(r, 1000));
    onSubmit(formData);
    setLoading(false);
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900"
    >
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          animate={{
            x: [-100, 100],
            y: [-100, 100],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            repeatType: 'reverse',
          }}
          className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-amber-400/20 to-transparent rounded-full blur-3xl"
        />
      </div>

      {/* Card */}
      <GlassCard variant="premium" className="w-full max-w-md relative z-10">
        <div className="p-8 space-y-6">
          {/* Header */}
          <motion.div variants={itemVariants} className="space-y-2">
            <h1 className="text-3xl font-bold text-white">
              {isLogin ? 'Welcome Back' : 'Create Account'}
            </h1>
            <p className="text-slate-400">
              {isLogin
                ? 'Sign in to your account'
                : 'Join us and start shopping'}
            </p>
          </motion.div>

          {/* Form */}
          <motion.form
            variants={containerVariants}
            onSubmit={handleSubmit}
            className="space-y-4"
          >
            {!isLogin && (
              <motion.div variants={itemVariants}>
                <FormField
                  label="Full Name"
                  placeholder="John Doe"
                  icon={<User className="w-5 h-5" />}
                  value={formData.fullName}
                  onChange={(v) =>
                    setFormData({ ...formData, fullName: v })
                  }
                  error={errors.fullName}
                />
              </motion.div>
            )}

            <motion.div variants={itemVariants}>
              <FormField
                label="Email Address"
                placeholder="you@example.com"
                type="email"
                icon={<Mail className="w-5 h-5" />}
                value={formData.email}
                onChange={(v) => setFormData({ ...formData, email: v })}
                error={errors.email}
              />
            </motion.div>

            <motion.div variants={itemVariants}>
              <FormField
                label="Password"
                placeholder="••••••••"
                type="password"
                icon={<Lock className="w-5 h-5" />}
                value={formData.password}
                onChange={(v) => setFormData({ ...formData, password: v })}
                error={errors.password}
              />
            </motion.div>

            {!isLogin && (
              <motion.div variants={itemVariants}>
                <FormField
                  label="Confirm Password"
                  placeholder="••••••••"
                  type="password"
                  icon={<Lock className="w-5 h-5" />}
                  value={formData.confirmPassword}
                  onChange={(v) =>
                    setFormData({ ...formData, confirmPassword: v })
                  }
                  error={errors.confirmPassword}
                />
              </motion.div>
            )}

            {isLogin && (
              <motion.div variants={itemVariants}>
                <Link
                  href="/forgot-password"
                  className="text-sm text-amber-400 hover:text-amber-300 transition-colors"
                >
                  Forgot password?
                </Link>
              </motion.div>
            )}

            <motion.div variants={itemVariants}>
              <PremiumButton
                type="submit"
                size="lg"
                className="w-full"
                isLoading={loading}
                icon={<ArrowRight className="w-5 h-5" />}
              >
                {isLogin ? 'Sign In' : 'Create Account'}
              </PremiumButton>
            </motion.div>
          </motion.form>

          {/* Divider */}
          <motion.div variants={itemVariants} className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-700" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-gradient-to-br from-white/10 to-white/5 text-slate-400">
                Or continue with
              </span>
            </div>
          </motion.div>

          {/* Social Auth */}
          <motion.div
            variants={itemVariants}
            className="grid grid-cols-2 gap-3"
          >
            <PremiumButton size="md" variant="glass">
              Google
            </PremiumButton>
            <PremiumButton size="md" variant="glass">
              GitHub
            </PremiumButton>
          </motion.div>

          {/* Footer */}
          <motion.p variants={itemVariants} className="text-center text-slate-400">
            {isLogin ? "Don't have an account? " : 'Already have an account? '}
            <Link
              href={isLogin ? '/register' : '/login'}
              className="text-amber-400 font-semibold hover:text-amber-300 transition-colors"
            >
              {isLogin ? 'Sign up' : 'Sign in'}
            </Link>
          </motion.p>
        </div>
      </GlassCard>
    </motion.div>
  );
};
