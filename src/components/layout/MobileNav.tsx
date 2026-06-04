// src/components/layout/MobileNav.tsx
'use client';

import React from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home,
  ShoppingBag,
  Heart,
  User,
  Menu,
  X,
  Search,
  Settings,
  LogOut,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
  isAuthenticated?: boolean;
}

const navItems = [
  { icon: Home, label: 'Home', href: '/' },
  { icon: ShoppingBag, label: 'Shop', href: '/products' },
  { icon: Heart, label: 'Wishlist', href: '/wishlist' },
  { icon: User, label: 'Account', href: '/account' },
];

export const MobileNav: React.FC<MobileNavProps> = ({
  isOpen,
  onClose,
  isAuthenticated = false,
}) => {
  const drawerVariants = {
    hidden: { x: '-100%', opacity: 0 },
    visible: {
      x: 0,
      opacity: 1,
      transition: { type: 'spring', stiffness: 300, damping: 30 },
    },
    exit: {
      x: '-100%',
      opacity: 0,
      transition: { duration: 0.2 },
    },
  };

  const listVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { x: -20, opacity: 0 },
    visible: {
      x: 0,
      opacity: 1,
      transition: { type: 'spring', stiffness: 300, damping: 30 },
    },
  };

  return (
    <>
      {/* Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
          />
        )}
      </AnimatePresence>

      {/* Drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            variants={drawerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed left-0 top-0 h-screen z-50 w-80 bg-gradient-to-b from-slate-900 to-slate-950 border-r border-slate-800 overflow-y-auto"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-800">
              <h2 className="text-xl font-bold text-white">Menu</h2>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
              >
                <X className="w-6 h-6 text-white" />
              </motion.button>
            </div>

            {/* Search */}
            <div className="p-4 border-b border-slate-800">
              <div className="flex items-center gap-2 bg-slate-800/50 rounded-lg px-3 py-2 focus-within:ring-2 focus-within:ring-amber-400">
                <Search className="w-4 h-4 text-slate-400" />
                <input
                  type="search"
                  placeholder="Search..."
                  className="flex-1 bg-transparent text-white placeholder:text-slate-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Navigation Items */}
            <motion.nav
              variants={listVariants}
              initial="hidden"
              animate="visible"
              className="p-4 space-y-2"
            >
              {navItems.map(({ icon: Icon, label, href }) => (
                <motion.div key={href} variants={itemVariants}>
                  <Link
                    href={href}
                    onClick={onClose}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-800/50 transition-colors"
                  >
                    <Icon className="w-5 h-5 text-amber-400" />
                    <span className="text-white font-medium">{label}</span>
                  </Link>
                </motion.div>
              ))}
            </motion.nav>

            {/* Divider */}
            <div className="border-t border-slate-800 my-4" />

            {/* Footer Links */}
            {isAuthenticated && (
              <motion.div
                variants={listVariants}
                initial="hidden"
                animate="visible"
                className="p-4 space-y-2"
              >
                <motion.div variants={itemVariants}>
                  <Link
                    href="/account/settings"
                    onClick={onClose}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-800/50 transition-colors"
                  >
                    <Settings className="w-5 h-5 text-slate-400" />
                    <span className="text-white font-medium">Settings</span>
                  </Link>
                </motion.div>
                <motion.div variants={itemVariants}>
                  <button
                    onClick={onClose}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-red-900/20 text-red-400 transition-colors"
                  >
                    <LogOut className="w-5 h-5" />
                    <span className="font-medium">Sign Out</span>
                  </button>
                </motion.div>
              </motion.div>
            )}

            {/* Auth Buttons */}
            {!isAuthenticated && (
              <motion.div
                variants={listVariants}
                initial="hidden"
                animate="visible"
                className="p-4 space-y-3 border-t border-slate-800"
              >
                <motion.div variants={itemVariants}>
                  <Link
                    href="/login"
                    onClick={onClose}
                    className="block w-full text-center px-4 py-3 rounded-lg border border-amber-400 text-amber-400 font-semibold hover:bg-amber-400/10 transition-colors"
                  >
                    Sign In
                  </Link>
                </motion.div>
                <motion.div variants={itemVariants}>
                  <Link
                    href="/register"
                    onClick={onClose}
                    className="block w-full text-center px-4 py-3 rounded-lg bg-gradient-to-r from-amber-400 to-amber-600 text-white font-semibold hover:shadow-lg transition-all"
                  >
                    Sign Up
                  </Link>
                </motion.div>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

// Bottom Navigation for mobile
interface BottomNavProps {
  currentRoute: string;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentRoute }) => {
  const items = [
    { icon: Home, label: 'Home', href: '/' },
    { icon: ShoppingBag, label: 'Shop', href: '/products' },
    { icon: Search, label: 'Search', href: '/search' },
    { icon: Heart, label: 'Wishlist', href: '/wishlist' },
    { icon: User, label: 'Account', href: '/account' },
  ];

  return (
    <motion.nav
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      className="fixed bottom-0 left-0 right-0 z-40 bg-gradient-to-t from-slate-950 to-slate-900 border-t border-slate-800 lg:hidden"
    >
      <div className="flex items-center justify-around">
        {items.map(({ icon: Icon, label, href }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex-1 flex flex-col items-center justify-center py-3 px-2 transition-colors',
              currentRoute === href
                ? 'text-amber-400 border-t-2 border-amber-400'
                : 'text-slate-400 hover:text-white'
            )}
          >
            <Icon className="w-6 h-6" />
            <span className="text-xs mt-1">{label}</span>
          </Link>
        ))}
      </div>
    </motion.nav>
  );
};
