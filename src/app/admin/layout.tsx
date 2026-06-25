// src/app/admin/layout.tsx
"use client";
import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, Package, ShoppingCart, Users, BarChart2,
  Tag, FolderOpen, Menu, X, LogOut, ChevronRight,
  Home, Store, Truck, FileText, Upload, Bell, Settings, Image,
  BarChart3, LineChart, Megaphone, FlaskConical, ChevronDown,
  Bot, FileQuestion, AlertCircle, Cpu, LayoutTemplate, Image as ImageIcon, BellRing, Layers, Award, GitBranch
} from "lucide-react";
import { useAuthStore } from "@/store/index";

interface NavItem {
  icon?: any;
  label: string;
  href?: string;
  items?: NavItem[];
  group?: string;
}

const NAV: NavItem[] = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/admin" },
  { icon: Package, label: "Products", href: "/admin/products" },
  { icon: ShoppingCart, label: "Orders", href: "/admin/orders" },
  { icon: Users, label: "Users", href: "/admin/users" },
  { icon: Tag, label: "Coupons", href: "/admin/coupons" },
  { icon: FolderOpen, label: "Categories", href: "/admin/categories" },
  { icon: Store, label: "Vendors", href: "/admin/vendors" },
  { icon: Truck, label: "Delivery", href: "/admin/delivery" },
  { icon: Image, label: "Hero CMS", href: "/admin/cms/hero" },
  { icon: FileText, label: "CMS Hub", href: "/admin/cms" },
];

const ANALYTICS_GROUP: NavItem = {
  icon: BarChart3,
  label: "Analytics",
  items: [
    { icon: LineChart, label: "Overview", href: "/admin/analytics" },
    { icon: BarChart3, label: "Banner Analytics", href: "/admin/analytics/banners" },
    { icon: Megaphone, label: "Marketing Analytics", href: "/admin/analytics/marketing" },
  ]
};

const OPTIMIZATION_GROUP: NavItem = {
  icon: FlaskConical,
  label: "Optimization",
  items: [
    { icon: FlaskConical, label: "A/B Testing", href: "/admin/experiments" },
  ]
};

const CUSTOMERS_GROUP: NavItem = {
  icon: Users,
  label: "Customers",
  items: [
    { icon: Users, label: "Customer Analytics", href: "/admin/customers/analytics" },
  ]
};

const MARKETING_GROUP: NavItem = {
  icon: Megaphone,
  label: "Marketing",
  items: [
    { icon: Megaphone, label: "Campaigns", href: "/admin/marketing/campaigns" },
  ]
};

const AI_GROUP: NavItem = {
  icon: Bot,
  label: "AI",
  items: [
    { icon: Bot, label: "AI Engineer", href: "/admin/ai" },
    { icon: Package, label: "AI Product Manager", href: "/admin/ai/products" },
    { icon: Bot, label: "AI Chat Engineer", href: "/admin/ai/chat" },
    { icon: AlertCircle, label: "Error Center", href: "/admin/ai/errors" },
    { icon: FileQuestion, label: "Project Auditor", href: "/admin/ai/audit" },
    { icon: Cpu, label: "Health Monitor", href: "/admin/ai/health" },
    { icon: GitBranch, label: "Deployments", href: "/admin/ai/deployments" },
    { icon: Settings, label: "AI Settings", href: "/admin/settings/ai" },
  ]
};

const CONTENT_GROUP: NavItem = {
  icon: LayoutTemplate,
  label: "Content",
  items: [
    { icon: LayoutTemplate, label: "Paramètres du site", href: "/admin/cms/settings" },
    { icon: LayoutTemplate, label: "CMS Hub", href: "/admin/cms" },
    { icon: LayoutTemplate, label: "Homepage Builder", href: "/admin/cms/homepage" },
    { icon: LayoutTemplate, label: "Announcement Bar", href: "/admin/cms/announcement" },
    { icon: LayoutTemplate, label: "Footer", href: "/admin/cms/footer" },
    { icon: ImageIcon, label: "Media Library", href: "/admin/cms/media" },
    { icon: Menu, label: "Navigation", href: "/admin/cms/navigation" },
    { icon: Award, label: "Brands", href: "/admin/cms/brands" },
    { icon: BarChart3, label: "CMS Analytics", href: "/admin/cms/analytics" },
  ]
};

const SYSTEM_GROUP: NavItem = {
  icon: Cpu,
  label: "System",
  items: [
    { icon: Cpu, label: "Automations", href: "/admin/automations" },
    { icon: AlertCircle, label: "Automation Errors", href: "/admin/automations/errors" },
    { icon: FileQuestion, label: "Automation Logs", href: "/admin/automations/logs" },
    { icon: Layers, label: "Automation Queues", href: "/admin/automations/queues" },
    { icon: FileQuestion, label: "Audit Log", href: "/admin/audit" },
    { icon: Layers, label: "Job Queues", href: "/admin/queues" },
    { icon: BellRing, label: "Notifications", href: "/admin/notifications" },
  ]
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<string[]>(["Analytics", "Optimization", "Customers", "Marketing", "AI", "Content", "System"]);
  const { user, logout } = useAuthStore();

  const toggleGroup = (groupLabel: string) => {
    setExpandedGroups(prev =>
      prev.includes(groupLabel)
        ? prev.filter(g => g !== groupLabel)
        : [...prev, groupLabel]
    );
  };

  const isActive = (href: string) => {
    return href === "/admin" ? pathname === href : pathname.startsWith(href);
  };

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
          Main
        </p>
        {NAV.map(({ icon: Icon, label, href }) => (
          <Link
            key={href}
            href={href}
            onClick={() => setSidebarOpen(false)}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group ${
              isActive(href)
                ? "bg-white text-foreground shadow-lg"
                : "text-white/58 hover:text-white hover:bg-white/10"
            }`}
          >
            <Icon className="w-4 h-4 flex-shrink-0" />
            {label}
            {isActive(href) && <ChevronRight className="w-3.5 h-3.5 ml-auto" />}
          </Link>
        ))}

        {/* Analytics Group */}
        <div className="pt-4">
          <button
            onClick={() => toggleGroup("Analytics")}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-white/70 hover:text-white hover:bg-white/10 transition-all w-full"
          >
            <BarChart3 className="w-4 h-4 flex-shrink-0" />
            Analytics
            <ChevronDown className={`w-3.5 h-3.5 ml-auto transition-transform ${expandedGroups.includes("Analytics") ? "rotate-180" : ""}`} />
          </button>
          {expandedGroups.includes("Analytics") && ANALYTICS_GROUP.items?.map((item) => (
            <Link
              key={item.href}
              href={item.href!}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all group ml-4 ${
                isActive(item.href!)
                  ? "bg-white text-foreground shadow-lg"
                  : "text-white/58 hover:text-white hover:bg-white/10"
              }`}
            >
              {item.icon && <item.icon className="w-4 h-4 flex-shrink-0" />}
              {item.label}
              {isActive(item.href!) && <ChevronRight className="w-3.5 h-3.5 ml-auto" />}
            </Link>
          ))}
        </div>

        {/* Optimization Group */}
        <div className="pt-2">
          <button
            onClick={() => toggleGroup("Optimization")}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-white/70 hover:text-white hover:bg-white/10 transition-all w-full"
          >
            <FlaskConical className="w-4 h-4 flex-shrink-0" />
            Optimization
            <ChevronDown className={`w-3.5 h-3.5 ml-auto transition-transform ${expandedGroups.includes("Optimization") ? "rotate-180" : ""}`} />
          </button>
          {expandedGroups.includes("Optimization") && OPTIMIZATION_GROUP.items?.map((item) => (
            <Link
              key={item.href}
              href={item.href!}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all group ml-4 ${
                isActive(item.href!)
                  ? "bg-white text-foreground shadow-lg"
                  : "text-white/58 hover:text-white hover:bg-white/10"
              }`}
            >
              {item.icon && <item.icon className="w-4 h-4 flex-shrink-0" />}
              {item.label}
              {isActive(item.href!) && <ChevronRight className="w-3.5 h-3.5 ml-auto" />}
            </Link>
          ))}
        </div>

        {/* Customers Group */}
        <div className="pt-2">
          <button
            onClick={() => toggleGroup("Customers")}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-white/70 hover:text-white hover:bg-white/10 transition-all w-full"
          >
            <Users className="w-4 h-4 flex-shrink-0" />
            Customers
            <ChevronDown className={`w-3.5 h-3.5 ml-auto transition-transform ${expandedGroups.includes("Customers") ? "rotate-180" : ""}`} />
          </button>
          {expandedGroups.includes("Customers") && CUSTOMERS_GROUP.items?.map((item) => (
            <Link
              key={item.href}
              href={item.href!}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all group ml-4 ${
                isActive(item.href!)
                  ? "bg-white text-foreground shadow-lg"
                  : "text-white/58 hover:text-white hover:bg-white/10"
              }`}
            >
              {item.icon && <item.icon className="w-4 h-4 flex-shrink-0" />}
              {item.label}
              {isActive(item.href!) && <ChevronRight className="w-3.5 h-3.5 ml-auto" />}
            </Link>
          ))}
        </div>

        {/* Marketing Group */}
        <div className="pt-2">
          <button
            onClick={() => toggleGroup("Marketing")}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-white/70 hover:text-white hover:bg-white/10 transition-all w-full"
          >
            <Megaphone className="w-4 h-4 flex-shrink-0" />
            Marketing
            <ChevronDown className={`w-3.5 h-3.5 ml-auto transition-transform ${expandedGroups.includes("Marketing") ? "rotate-180" : ""}`} />
          </button>
          {expandedGroups.includes("Marketing") && MARKETING_GROUP.items?.map((item) => (
            <Link
              key={item.href}
              href={item.href!}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all group ml-4 ${
                isActive(item.href!)
                  ? "bg-white text-foreground shadow-lg"
                  : "text-white/58 hover:text-white hover:bg-white/10"
              }`}
            >
              {item.icon && <item.icon className="w-4 h-4 flex-shrink-0" />}
              {item.label}
              {isActive(item.href!) && <ChevronRight className="w-3.5 h-3.5 ml-auto" />}
            </Link>
          ))}
        </div>

        {/* AI Group */}
        <div className="pt-2">
          <button
            onClick={() => toggleGroup("AI")}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-white/70 hover:text-white hover:bg-white/10 transition-all w-full"
          >
            <Bot className="w-4 h-4 flex-shrink-0" />
            AI
            <ChevronDown className={`w-3.5 h-3.5 ml-auto transition-transform ${expandedGroups.includes("AI") ? "rotate-180" : ""}`} />
          </button>
          {expandedGroups.includes("AI") && AI_GROUP.items?.map((item) => (
            <Link
              key={item.href}
              href={item.href!}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all group ml-4 ${
                isActive(item.href!)
                  ? "bg-white text-foreground shadow-lg"
                  : "text-white/58 hover:text-white hover:bg-white/10"
              }`}
            >
              {item.icon && <item.icon className="w-4 h-4 flex-shrink-0" />}
              {item.label}
              {isActive(item.href!) && <ChevronRight className="w-3.5 h-3.5 ml-auto" />}
            </Link>
          ))}
        </div>

        {/* Content Group */}
        <div className="pt-2">
          <button
            onClick={() => toggleGroup("Content")}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-white/70 hover:text-white hover:bg-white/10 transition-all w-full"
          >
            <LayoutTemplate className="w-4 h-4 flex-shrink-0" />
            Content
            <ChevronDown className={`w-3.5 h-3.5 ml-auto transition-transform ${expandedGroups.includes("Content") ? "rotate-180" : ""}`} />
          </button>
          {expandedGroups.includes("Content") && CONTENT_GROUP.items?.map((item) => (
            <Link
              key={item.href}
              href={item.href!}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all group ml-4 ${
                isActive(item.href!)
                  ? "bg-white text-foreground shadow-lg"
                  : "text-white/58 hover:text-white hover:bg-white/10"
              }`}
            >
              {item.icon && <item.icon className="w-4 h-4 flex-shrink-0" />}
              {item.label}
              {isActive(item.href!) && <ChevronRight className="w-3.5 h-3.5 ml-auto" />}
            </Link>
          ))}
        </div>

        {/* System Group */}
        <div className="pt-2">
          <button
            onClick={() => toggleGroup("System")}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-white/70 hover:text-white hover:bg-white/10 transition-all w-full"
          >
            <Cpu className="w-4 h-4 flex-shrink-0" />
            System
            <ChevronDown className={`w-3.5 h-3.5 ml-auto transition-transform ${expandedGroups.includes("System") ? "rotate-180" : ""}`} />
          </button>
          {expandedGroups.includes("System") && SYSTEM_GROUP.items?.map((item) => (
            <Link
              key={item.href}
              href={item.href!}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all group ml-4 ${
                isActive(item.href!)
                  ? "bg-white text-foreground shadow-lg"
                  : "text-white/58 hover:text-white hover:bg-white/10"
              }`}
            >
              {item.icon && <item.icon className="w-4 h-4 flex-shrink-0" />}
              {item.label}
              {isActive(item.href!) && <ChevronRight className="w-3.5 h-3.5 ml-auto" />}
            </Link>
          ))}
        </div>

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
