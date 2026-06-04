// src/app/admin/layout.tsx
"use client";
import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, Package, ShoppingCart, Users, BarChart2,
  Tag, FolderOpen, Menu, X, LogOut, ChevronRight,
  Home, Store, Truck, FileText, Upload, Bell, Settings
} from "lucide-react";
import { useAuthStore } from "@/store/index";

const NAV = [
  { icon: LayoutDashboard, label: "Tableau de bord", href: "/admin" },
  { icon: Package, label: "Produits", href: "/admin/products" },
  { icon: ShoppingCart, label: "Commandes", href: "/admin/orders" },
  { icon: Users, label: "Utilisateurs", href: "/admin/users" },
  { icon: BarChart2, label: "Analytiques", href: "/admin/analytics" },
  { icon: Tag, label: "Coupons", href: "/admin/coupons" },
  { icon: FolderOpen, label: "Catégories", href: "/admin/categories" },
  { icon: Store, label: "Vendeurs", href: "/admin/vendors" },
  { icon: Truck, label: "Livraison", href: "/admin/delivery" },
  { icon: FileText, label: "CMS", href: "/admin/cms" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuthStore();

  const Sidebar = ({ mobile = false }: { mobile?: boolean }) => (
    <aside
      className={`${
        mobile ? "w-full" : "w-64"
      } bg-foreground text-background border-r border-white/10 flex flex-col h-full`}
    >
      {/* Logo */}
      <div className="p-6 border-b border-white/10">
        <Link href="/admin" className="flex items-center gap-3">
          <div className="w-9 h-9 bg-brand-700 rounded-xl flex items-center justify-center shadow-brand">
            <span className="text-white font-black text-sm">N</span>
          </div>
          <div>
            <p className="font-black text-sm text-white">NexMart</p>
            <p className="text-[10px] text-white/45 uppercase tracking-wider">Centre de Contrôle</p>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider px-3 mb-3">
          Intelligence
        </p>
        {NAV.map(({ icon: Icon, label, href }) => {
          const active = href === "/admin" ? pathname === href : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                active
                  ? "bg-white text-foreground shadow-lg"
                  : "text-white/58 hover:text-white hover:bg-white/10"
              }`}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {label}
              {active && <ChevronRight className="w-3.5 h-3.5 ml-auto" />}
            </Link>
          );
        })}

        <div className="pt-4 border-t border-white/10 mt-4">
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider px-3 mb-3">
            Quick Actions
          </p>
          <Link
            href="/admin/products/new"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold text-sky-200 hover:bg-white/10 transition-all"
          >
            <Upload className="w-4 h-4" />
            Add Product
          </Link>
          <Link
            href="/"
            target="_blank"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-white/58 hover:text-white hover:bg-white/10 transition-all"
          >
            <Home className="w-4 h-4" />
            View Store
          </Link>
        </div>
      </nav>

      {/* User */}
      <div className="p-4 border-t border-white/10">
        {user && (
          <div className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-white/10 transition-colors group">
            <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center text-violet-700 text-xs font-black flex-shrink-0">
              {user.name[0]}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold truncate text-white">{user.name}</p>
              <p className="text-xs text-white/45 truncate">{user.role}</p>
            </div>
            <button
              onClick={logout}
              className="opacity-0 group-hover:opacity-100 text-white/50 hover:text-rose-300 transition-all"
              title="Sign out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </aside>
  );

  return (
    <div className="flex h-screen bg-surface overflow-hidden">
      {/* Desktop sidebar */}
      <div className="hidden lg:flex flex-shrink-0">
        <Sidebar />
      </div>

      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/50 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed left-0 top-0 bottom-0 z-50 w-72 lg:hidden"
            >
              <Sidebar mobile />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="h-16 border-b border-border flex items-center px-6 gap-4 flex-shrink-0 bg-background/80 backdrop-blur-xl">
          <button
            onClick={() => setSidebarOpen(true)}
            className="btn-ghost p-2 lg:hidden"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Breadcrumb */}
          <div className="hidden sm:flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">NexMart Admin</span>
            {pathname !== "/admin" && (
              <>
                <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="font-medium capitalize">
                  {pathname.split("/").filter(Boolean).slice(1).join(" / ")}
                </span>
              </>
            )}
          </div>

          <div className="ml-auto flex items-center gap-2">
            <button className="btn-ghost p-2 relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-emerald-500 rounded-full" />
            </button>
            <Link href="/admin/settings" className="btn-ghost p-2">
              <Settings className="w-5 h-5" />
            </Link>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-6 max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
