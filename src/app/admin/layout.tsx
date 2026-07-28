"use client";

import { AdminSidebar } from '@/components/admin/Sidebar';
import { Bell, Search, LogOut, User } from 'lucide-react';
import Link from 'next/link';
import { signOut } from 'next-auth/react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const handleLogout = async () => {
    await signOut({ callbackUrl: '/admin/login' });
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <AdminSidebar />
      <main className="min-h-screen lg:pl-64">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white/90 px-5 backdrop-blur-xl sm:px-8">
          <div>
            <p className="text-xs text-slate-400">Workspace / <span className="text-slate-700">Admin</span></p>
            <h2 className="mt-1 text-sm font-bold text-slate-900">Commerce OS</h2>
          </div>
          <div className="flex items-center gap-3">
            <label className="hidden h-10 items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 text-slate-400 md:flex">
              <Search className="h-4 w-4" />
              <input className="w-40 bg-transparent text-sm outline-none" placeholder="Search anything..." />
            </label>
            <button className="relative rounded-xl border border-slate-200 p-2.5 text-slate-500 hover:bg-slate-50 transition-colors">
              <Bell className="h-4 w-4" />
              <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-blue-600" />
            </button>
            <Link
              href="/"
              className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <User className="h-4 w-4" />
              View Store
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-100 transition-colors"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </div>
        </header>
        <div className="p-5 sm:p-8">{children}</div>
      </main>
    </div>
  );
}

